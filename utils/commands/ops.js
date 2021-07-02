const config = require("../../config.json");

module.exports = (server, client, args) => {
	client.write("message", {
		player_id: -1,
		message: `Currently opped: ${config.ops.join(", ")}`
	})
}