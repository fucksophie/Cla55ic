const config = require('../../config.json');

module.exports = async (server, client, args) => {
  if (config.ops.includes(client.username)) {
    if (args.length >= 2) {
      const username = args[0];
      args.shift();
      const rank = args.join(' ').replace(/%/gm, '&');
      const players = server.players.map((e) => e.username);

      if (players.includes(username)) {
        const dbPlayer = await server.db.get(username);

        dbPlayer.rank = rank;

        await server.db.set(username, dbPlayer);

        client.write('message', {
          player_id: 0,
          message: `Applied ${rank}&f to ${username}!`,
        });

        server.players[players.indexOf(username)].write('message', {
          player_id: 0,
          message: `You just got ${rank}!`,
        });
      } else {
        client.write('message', {
          player_id: 0,
          message: `${username} is not online!`,
        });
      }
    } else {
      client.write('message', {
        player_id: 0,
        message: 'Missing arguments.',
      });
    }
  } else {
    client.write('message', {
      player_id: 0,
      message: 'You are not opped.',
    });
  }
};
