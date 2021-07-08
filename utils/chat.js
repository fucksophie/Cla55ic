const fs = require('fs');
const emoji = require("./emoji.json");

const commands = fs.readdirSync('utils/commands').map((e) => e.split('.js')[0].toLowerCase());
const parital = {}

const controlChars = "\0☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼";
        
const extChars = "⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»" +
    "░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌" +
    "█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00a0";

module.exports.cp437 = (c) => {
  if(c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126) {
    return c
  }

  return String.fromCharCode(controlChars.indexOf(c) >= 0 ? controlChars.indexOf(c) : extChars.indexOf(c) >= 0 ? extChars.indexOf(c) + 127 : 63);
}

module.exports.handle = async (server, client, message) => {
  let content;

  if(message.unused == 1) {
    if(!parital[client.username]) parital[client.username] = "";
    parital[client.username] += message.message + " "

    return;
  } else {
    if(parital[client.username]) {
      content = parital[client.username] + " " + message.message;

      parital[client.username] = ""
    } else {
      content = message.message;
    }
  }

  emoji.forEach(moji => {
    if(content.includes(`{${moji.name}}`)) {
      content = content.split(`{${moji.name}}`).join(module.exports.cp437(moji.unicode))
    }
  })

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

    while (chat.length > 64) {
        server.players.forEach(async (player) => {
          player.write('message', {
            player_id: 0,
            message: chat.substring(0, 64),
          });
        });

        chat = chat.substring(64)
    }

    server.players.forEach(async (player) => {
      player.write('message', {
        player_id: 0,
        message: chat,
      });
    });
  }
};
