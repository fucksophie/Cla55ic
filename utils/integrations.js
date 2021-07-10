const upd = require('irc-upd');
const Discord = require('discord.js');
const config = require('../config.json');

class Integrations {
  constructor(server) {
    this.server = server;

    if (config.discord.enabled) {
      this.discord = new Discord.Client();

      this.discord.on('ready', () => {
        this.discordChannel = this.discord.channels.cache.get(config.discord.id);
      });
      this.discord.on('message', (message) => {
        if (message.author.bot) return;

        this.server.players.forEach(async (player) => {
          player.write('message', {
            player_id: 0,
            message: `[&rDISCORD&f] ${message.author.username}&f: ${message.content}`,
          });
        });

        if (config.irc.enabled) {
          this.irc.say(config.irc.channel, `[DISCORD] ${message.author.username}: ${message.content}`);
        }
      });

      this.discord.login(config.discord.token);
    }

    if (config.irc.enabled) {
      this.irc = new upd.Client(config.irc.server.ip, config.irc.username, {
        channels: [config.irc.channel],
        secure: config.irc.channel,
        port: config.irc.server.port,
      });

      this.irc.addListener('message', (from, to, message) => {
        this.server.players.forEach(async (player) => {
          player.write('message', {
            player_id: 0,
            message: `[&rIRC&f] ${from}&f: ${message}`,
          });
        });

        if (config.discord.enabled) {
          this.discordChannel.send(`[IRC] ${from}: ${message}`);
        }
      });

      this.irc.addListener('part', (channel, nick) => {
        this.handleIRCEL(nick, false);
      });

      this.irc.addListener('join', (channel, nick) => {
        this.handleIRCEL(nick, true);
      });
    }
  }

  handleIRCEL(from, state) {
    this.server.players.forEach(async (player) => {
      player.write('message', {
        player_id: 0,
        message: `[&rIRC&f] ${from} ${state ? 'entered' : 'left'}`,
      });
    });

    if (config.discord.enabled) {
      this.discordChannel.send(`[IRC] ${from} ${state ? 'entered' : 'left'}`);
    }
  }

  handleMCEL(client, state) {
    if (config.discord.enabled) {
      this.discordChannel.send(`[CC] ${client.username} ${state ? 'entered' : 'left'}`);
    }

    if (config.irc.enabled) {
      this.irc.say(config.irc.channel, `[CC] ${client.username} ${state ? 'entered' : 'left'}`);
    }
  }

  handleMCChat(client, message) {
    if (config.discord.enabled) {
      this.discordChannel.send(`[CC] ${client.username}: ${message.replace(/%./gm, '')}`);
    }

    if (config.irc.enabled) {
      this.irc.say(config.irc.channel, `[CC] ${client.username}: ${message.replace(/%./gm, '')}`);
    }
  }
}

module.exports = Integrations;
