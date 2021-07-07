const fs = require('fs');

const commands = fs.readdirSync('utils/commands').map((e) => e.split('.js')[0].toLowerCase());

module.exports = async (server, client, message) => {
  const content = message.message;

  if (content.startsWith('/')) {
    const args = content.split(' ');
    const command = args.shift().substring(1).toLowerCase();

    if (commands.includes(command)) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(`./commands/${command}`)(server, client, args);
    } else {
      client.write('message', {
        player_id: 0,
        message: 'Command not found.',
      });
    }
  } else {
    const dbPlayer = await server.db.get(client.username);
    let chat = `${client.username}: ${content.replace(/%/gm, '&')}`;

    if (dbPlayer.tag) {
      chat = `<${dbPlayer.tag}&f> ${chat}`;
    }

    if (dbPlayer.rank) {
      chat = `[${dbPlayer.rank}&f] ${chat}`;
    }

    server.integrations.handleMCChat(client, content)

    server.players.forEach(async (player) => {
      player.write('message', {
        player_id: 0,
        message: chat,
      });
    });
  }
};
