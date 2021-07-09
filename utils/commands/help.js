const fs = require('fs');

// eslint-disable-next-line global-require, import/no-dynamic-require
const commands = fs.readdirSync(__dirname).map((e) => ({ name: e.slice(0, -3), command: require(`${__dirname}/${e}`) }));

module.exports = {
  description: 'Placeholder command.',
  onlyOP: false,
  run: (server, client) => {
    client.write('message', {
      player_id: 0,
      message: '&rHelp commands: ------------------',
    });

    commands.forEach((command) => {
      if (command.name !== 'help') {
        client.write('message', {
          player_id: 0,
          message: `&p${command.name}&f - ${command.command.description}${command.command.onlyOP ? ' (&roperator&f)' : ''}`,
        });
      }
    });
  },
};
