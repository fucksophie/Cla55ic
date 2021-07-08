const chat = require('../chat');

module.exports = (server, client) => {
  client.write('message', {
    player_id: 0,
    message: chat.cp437("♪"),
  });
};
