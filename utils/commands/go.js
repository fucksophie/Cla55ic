const fs = require('fs');
const World = require('../world');

module.exports = {
  description: 'Go to a world.',
  onlyOP: false,
  run: (server, client, args) => {
    if (args.length === 1) {
      if (!fs.existsSync(`worlds/custom/${args[0]}.buf`) && args[0] !== 'default') {
        client.write('message', {
          player_id: 0,
          message: `&rWorld ${args[0]} does not exist. Create it with /createworld ${args[0]}`,
        });
        return;
      }

      client.world.save();

      server.players.forEach((player) => {
        if (player.world.file === client.world.file) {
          player.write('despawn_player', {
            player_id: server.players.indexOf(client),
          });
        }
      });
      if (args[0] === 'default') {
        // eslint-disable-next-line no-param-reassign
        client.world = new World({
          x: 256,
          y: 128,
          z: 256,
        }, 'worlds/default.buf');

        client.write('hack_control', {
          flying: 0,
          no_clip: 0,
          speeding: 0,
          spawn_control: 0,
          third_person_view: 0,
          jump_height: -1,
        });
      } else {
        // eslint-disable-next-line no-param-reassign
        client.world = new World({
          x: 256,
          y: 128,
          z: 256,
        }, `worlds/custom/${args[0]}.buf`);
        client.write('hack_control', {
          flying: 1,
          no_clip: 1,
          speeding: 1,
          spawn_control: 1,
          third_person_view: 1,
          jump_height: -1,
        });
      }

      client.world.sendPackets(client);

      client.write('spawn_player', {
        ...client.world.getSpawn(),
        player_name: client.username,
      });

      server.players.forEach((player) => {
        if (player !== client && player.world.file === client.world.file) {
          player.write('spawn_player', {
            ...client.world.getSpawn(),
            player_id: server.players.indexOf(client),
            player_name: client.username,
          });

          client.write('spawn_player', {
            ...client.world.getSpawn(),
            player_id: server.players.indexOf(player),
            player_name: player.username,
          });
        }
      });

      client.write('message', {
        player_id: 0,
        message: `You have been sent to the world &p${args[0]}!`,
      });

      if (args[0] !== 'default') {
        client.write('message', {
          player_id: 0,
          message: 'To go back to the main world, use',
        });

        client.write('message', {
          player_id: 0,
          message: '&r/go default',
        });
      }
    } else {
      client.write('message', {
        player_id: 0,
        message: 'Missing argument.',
      });
    }
  },
};
