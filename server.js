/* eslint-disable no-param-reassign, no-console, global-require */
const mc = require('minecraft-classic-protocol');
const Josh = require('@joshdb/core');

const crypto = require('crypto');

const { handleLogin, startHeartbeat } = require('./utils/onlinemode');
const chat = require('./utils/chat');
const World = require('./utils/world');
const values = require('./utils/values');
const cpe = require('./utils/cpe');
const Integrations = require("./utils/integrations")

const server = mc.createServer({
  port: 25565,
  customPackets: require('./cpe.json'),
});

server.players = [];
server.hash = crypto.randomBytes(16).toString('hex');

server.integrations = new Integrations(server);

server.db = new Josh({
  name: 'Cla55ic',
  provider: require('@joshdb/sqlite'),
});

const world = new World({
  x: 256,
  y: 20,
  z: 256,
}, 'worlds/default.buf');

startHeartbeat(server);

server.on('login', async (client) => {
  handleLogin(server, client);

  if (!(await server.db.get(client.username))) {
    await server.db.set(client.username, {
      tag: '',
      rank: '',
    });
  }

  if (client.identification_byte === 0x42) {
    client.cpe = true;

    cpe.sendInfo(client);
    cpe.registerEntries(client);
    cpe.registerColors(client);
    cpe.writeHeaders(client);
    cpe.registerEvents(client);
  }

  server.players.push(client);

  console.log(`User connected! Now connected ${server.players.length}!`);

  server.players.forEach((player) => {
    player.write('message', {
      player_id: 0,
      message: `&${client.cpe ? 'p' : 'a'}${client.username} joined!`,
    });
  });

  world.sendPackets(client);

  client.write('spawn_player', {
    ...values.defaultSpawn,
    player_name: client.username,
  });

  server.players.forEach((player) => {
    if (player !== client) {
      player.write('spawn_player', {
        ...values.defaultSpawn,
        player_id: server.players.length - 1,
        player_name: client.username,
      });

      client.write('spawn_player', {
        ...values.defaultSpawn,
        player_id: server.players.indexOf(player),
        player_name: player.username,
      });
    }
  });

  client.on('message', (packet) => {
    chat(server, client, packet);
  });

  client.on('set_block', (packet) => {
    if (client.position) {
      if (packet.mode === 0) {
        packet.block_type = 0;
      }

      const previousBlock = world.getBlock(packet);

      const dx = (client.position.x / 32) - packet.x;
      const dy = (client.position.y / 32) - packet.y;
      const dz = (client.position.z / 32) - packet.z;
      const diff = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (diff > 7) {
        client.write('set_block', {
          ...packet,
          block_type: previousBlock,
        });

        client.write('message', {
          player_id: 0,
          message: `Your block could not be ${packet.mode ? 'placed' : 'removed'}.`,
        });
        return;
      }

      world.setBlock(packet, packet.block_type);
      server.players.forEach((player) => {
        player.write('set_block', packet);
      });
    } else {
      client.write('message', {
        player_id: 0,
        message: 'Move before placing a block.',
      });
    }
  });

  client.on('position', (packet) => {
    server.players.forEach((player) => {
      packet.player_id = server.players.indexOf(client);
      player.write('player_teleport', packet);
    });

    client.position = packet;
  });

  function handleLeave(err) {
    if (!err) {
      server.players.forEach((player) => {
        if (player !== client) {
          player.write('despawn_player', {
            player_id: server.players.indexOf(client),
          });
        }
      });

      server.players = server.players.filter((e) => e !== client);
      world.save();

      console.log(`User left! Now connected ${server.players.length}!`);

      server.players.forEach((player) => {
        player.write('message', {
          player_id: 0,
          message: `&${client.cpe ? 'r' : 'c'}${client.username} left!`,
        });
      });
    } else {
      console.log(`Player ${client.username} experienced error: ${err}`);
    }
  }

  client.on('error', (e) => handleLeave(e));
  client.on('end', handleLeave);
});

server.on('error', (error) => {
  console.log(`Oops! Something went wrong, ${error}`);
});

server.on('listening', () => {
  console.log(`Server running on port ${server.socketServer.address().port}!`);
});
