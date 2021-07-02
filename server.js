const mc = require("minecraft-classic-protocol");

const crypto = require("crypto")

const { handleLogin, startHeartbeat } = require("./utils/onlinemode");
const chat = require("./utils/chat");
const World = require("./utils/world");
const values = require("./utils/values");
const cpe = require("./utils/cpe"); 

const server = mc.createServer({ 
    port: 25565,
    customPackets: require('minecraft-classic-protocol-extension').protocol
})

server.players = [];
server.hash = crypto.randomBytes(16).toString('hex');

const world = new World({
    x: 256,
    y: 20,
    z: 256,
}, "worlds/default.buf")

startHeartbeat(server)

server.on("login", client => {
    handleLogin(server, client)

    if(client.identification_byte == 0x42) {
        client.cpe = true;

        cpe.sendInfo(client)
        cpe.registerEntries(client)
        cpe.registerColors(client)
        cpe.writeHeaders(client)
    }

    server.players.push(client)

    console.log(`User connected! Now connected ${server.players.length}!`)

    world.send_packets(client);
  
    client.write('spawn_player', {
        ...values.defaultSpawn,
        player_name: client.username 
    });
    
    server.players.forEach(player => {
        if(player != client) {
            player.write("spawn_player", {
                ...values.defaultSpawn,
                player_id: server.players.length-1,
                player_name: client.username
            })
            
            client.write("spawn_player", {
                ...values.defaultSpawn,
                player_id: server.players.indexOf(player),
                player_name: player.username
            })
            
        }
    })
    
    client.on("message", packet => {
        chat(server, client, packet)
    })

    client.on("set_block", packet => {
        if(packet.mode == 0) {
            packet.block_type = 0; 
        }


        world.setBlock(packet, packet.block_type)
        server.players.forEach(player => {
            player.write("set_block", packet)
        })
    })

    client.on("position", packet => {
        server.players.forEach(player => {
            packet.player_id = server.players.indexOf(client);
            player.write("player_teleport", packet)
        })
    })
    

    client.on("error", () => handleLeave(true))
    client.on("end", handleLeave)

    function handleLeave(err) {
        if(!err) console.log(`User left! Now connected ${server.players.length}!`)

        server.players.forEach(player => {
            if(player != client) {
                player.write("despawn_player", {
                    "player_id": server.players.indexOf(client)
                })
            }
        })

        server.players = server.players.filter(e => e !== client)
        world.save()
    }
})



server.on('error', error => {
    console.log(`Oops! Something went wrong, ${error}`);
});
  
server.on('listening', () => {
    console.log(`Server running on port ${server.socketServer.address().port}!`);
});