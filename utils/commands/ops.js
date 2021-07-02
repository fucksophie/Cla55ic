const config = require('../../config.json');

module.exports = (server, client) => {
  client.write('message', {
    player_id: 0,
    message: `Currently opped: ${config.ops.join(', ')}`,
  });
};
