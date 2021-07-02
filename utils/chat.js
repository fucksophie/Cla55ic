const fs = require("fs")
const commands = fs.readdirSync("utils/commands").map(e=>e.split(".js")[0].toLowerCase())

module.exports = (server,client, message) => {
	const content = message.message;

	if(content.startsWith("/")) {
		const args = content.split(" ")
		const command = args.shift().substring(1).toLowerCase()

		if(commands.includes(command)) {
			require("./commands/"+command)(server, client, args)
		} else {
			client.write("message", {
				player_id: 0,
				message: "Command not found."
			})
		}
	} else {
		server.players.forEach(player => {
			player.write("message", {
				player_id: 0,
				message: client.username + "> " + content.replace("%", "&")
			})
		})
	}
}