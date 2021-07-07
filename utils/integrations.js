const upd = require("irc-upd")
const config = require('../config.json');

class Integrations {
	constructor(server) {
		if(!config.irc.enabled) return;
		
		this.server = server;
		this.irc = new upd.Client(config.irc.server.ip, config.irc.username, {
			channels: [config.irc.channel],
			secure: config.irc.channel,
			port: config.irc.server.port,
		});

		this.irc.addListener('message', (from, to, message) => {
			this.handleIRCChat(from, message);
		})

		
		this.irc.addListener('part', (channel, nick) => {
			if(nick == config.irc.username) return;
			this.handleIRCEL(nick, false);
		})

		this.irc.addListener('join', (channel, nick) => {
			if(nick == config.irc.username) return;
			this.handleIRCEL(nick, true);
		})
	}

	handleIRCChat(from, message) {
		if(!config.irc.enabled) return;

		this.server.players.forEach(async (player) => {
			player.write('message', {
			  player_id: 0,
			  message: `[&rIRC&f] ${from}&f: ${message}`,
			});
		});
	}

	handleIRCEL(from, state) {
		if(!config.irc.enabled) return;

		this.server.players.forEach(async (player) => {
			player.write('message', {
			  player_id: 0,
			  message: `[&rIRC&f] ${from} ${state ? "entered" : "left"}`,
			});
		});
	}

	handleMCEL(client, state) {
		if(!config.irc.enabled) return;
		
		this.irc.say(config.irc.channel, `[CC] ${client.username} ${state ? "entered" : "left"}`);
	}

	handleMCChat(client, message) {
		if(!config.irc.enabled) return;
		
		this.irc.say(config.irc.channel, `[CC] ${client.username}: ${message.replace(/%./gm, '')}`)
	} 
}

module.exports = Integrations;