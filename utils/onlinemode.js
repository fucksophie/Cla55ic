const crypto = require("crypto")
const request = require("request")
const config = require("../config.json");

function handleLogin(server, client) {
	if(config["online-mode"]) {
		if(crypto.createHash('md5').update(server.hash + client.username).digest('hex') !== client.verification_key) {
			client.write('disconnect_player', {
				disconnect_reason: 'Refresh your Server List! Username could not be verified!'
			});

			return;
		}

		if(server.players.map(e=>e.username).includes(client.username)) {
			client.write('disconnect_player', {
				disconnect_reason: 'Duplicate name!'
			});
		
			return;
		}
	}
}


function startHeartbeat(server) {
	if(config["online-mode"]) {
		setInterval(() => {
			request('https://www.classicube.net/heartbeat.jsp' +
				`?port=${server.socketServer.address().port}` +
				'&max=255'+
				'&name=Cla55ic' +
				'&public=True'+
				`&version=7&salt=${server.hash}` +
				`&users=${server.players.length}`)
		}, 10000)
	}
}

module.exports.startHeartbeat = startHeartbeat;
module.exports.handleLogin = handleLogin;