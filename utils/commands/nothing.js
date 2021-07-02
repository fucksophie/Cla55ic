module.exports = (server, client, args) => {
	client.write("message", {
		player_id: 0,
		message: "Hello"
	})
}