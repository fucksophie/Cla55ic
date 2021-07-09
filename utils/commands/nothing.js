const chat = require('../chat');

module.exports = {
  description: 'Placeholder command.',
  onlyOP: false,
  run: (server, client) => {
    client.write('message', {
      player_id: 0,
      message: chat.cp437('♪'),
    });
  },
};
