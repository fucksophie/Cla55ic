const config = require('../../config.json');

module.exports = (server, client, args) => {
  if (config.ops.includes(client.username)) {
    if (args.length === 1) {
      const players = server.players.map((e) => e.username);
      if (players.includes(args[0])) {
        server.players[players.indexOf(args[0])].write('disconnect_player', {
          disconnect_reason: 'You were kicked by a operator.',
        });

        server.players[players.indexOf(args[0])].socket.destroy();
        client.write('message', {
          player_id: 0,
          message: `Kicked ${args[0]}!`,
        });
      }
    } else {
      client.write('message', {
        player_id: 0,
        message: 'Missing argument.',
      });
    }
  } else {
    client.write('message', {
      player_id: 0,
      message: 'You are not opped.',
    });
  }
};
