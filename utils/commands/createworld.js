const World = require('../world');

module.exports = {
  description: 'Create a world with a name.',
  onlyOP: false,
  run: (server, client, args) => {
    if (args.length === 1) {
      const world = new World({
        x: 256,
        y: 128,
        z: 256,
      }, `worlds/custom/${args[0]}.buf`);

      world.save();

      client.write('message', {
        player_id: 0,
        message: `&rI made a world for you called &p${args[0]}!`,
      });

      client.write('message', {
        player_id: 0,
        message: `You can enter it via &p/go ${args[0]}`,
      });
    } else {
      client.write('message', {
        player_id: 0,
        message: 'Missing argument.',
      });
    }
  },
};
