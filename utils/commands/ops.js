const config = require('../../config.json');

module.exports = {
  description: 'See all opped players',
  onlyOP: false,
  run: (server, client) => {
    client.write('message', {
      player_id: 0,
      message: `Currently opped: ${config.ops.join(', ')}`,
    });
  },
};
