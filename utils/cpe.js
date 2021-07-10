/* eslint-disable no-param-reassign */
const fs = require('fs');

const version = fs.readFileSync('.git/refs/heads/main').slice(0, 7);
const config = require('../config.json');

function sendInfo(client) {
  client.write('ext_info', {
    app_name: `Cla55ic ${version}`,
    extension_count: 5,
  });
}

function registerEntries(client) {
  client.write('ext_entry', {
    version: 1,
    ext_name: 'MessageTypes',
  });

  client.write('ext_entry', {
    version: 1,
    ext_name: 'TextColors',
  });

  client.write('ext_entry', {
    version: 1,
    ext_name: 'CustomBlocks',
  });

  client.write('ext_entry', {
    version: 1,
    ext_name: 'TextHotKey',
  });

  client.write('ext_entry', {
    version: 1,
    ext_name: 'LongerMessages',
  });

  client.write('ext_entry', {
    version: 1,
    ext_name: 'HackControl',
  });
}

function writeHeaders(client) {
  client.write('message', {
    player_id: 1,
    message: config.status[0],
  });

  client.write('message', {
    player_id: 2,
    message: config.status[1],
  });

  client.write('message', {
    player_id: 3,
    message: config.status[2],
  });
}

function registerColor(hex, code, client) {
  const [red, green, blue] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));

  client.write('set_text_color', {
    red,
    green,
    blue,
    alpha: 255,
    code: code.charCodeAt(0),
  });
}

function registerEvents(client) {
  client.on('ext_info', (packet) => {
    client.extension_count = packet.extension_count;
    client.extensions = [];
  });

  client.on('ext_entry', (packet) => {
    client.extensions.push(packet);
    if (client.extension_count === client.extensions.length) {
      client.write('custom_block_support_level', {
        support_level: 1,
      });

      client.write('set_text_hotkey', {
        label: 'crouch',
        action: '/crouch\n',
        keycode: 42,
        keymods: 0,
      });
    }
  });
}

function registerColors(client) {
  // Pink
  registerColor('#FFC0CB', 'p', client);
  // Royal Yellow
  registerColor('#FADA5E', 'r', client);
}

module.exports.registerColors = registerColors;
module.exports.registerEntries = registerEntries;
module.exports.writeHeaders = writeHeaders;
module.exports.sendInfo = sendInfo;
module.exports.registerEvents = registerEvents;
