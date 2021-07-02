module.exports = (server, client, args) => {
	client.write("message", {
		player_id: -1,
		message: "Hello"
	})
}