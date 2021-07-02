const fs = require("fs")
const version = fs.readFileSync(".git/refs/heads/main").slice(0, 7)

function sendInfo(client) { 
	client.write('ext_info', {
		app_name: `Cla55ic ${version}`,
		extension_count: 2
	});
}

function registerEntries(client) {
	client.write('ext_entry', {
		version: 1,
		ext_name: "MessageTypes"
	})

	client.write('ext_entry', {
		version: 1,
		ext_name: "TextColors"
	})
}

function writeHeaders(client) {
	client.write("message", {
		player_id: 1,
		message: "Welcome to &pCla55ic!"
	})
	
	client.write("message", {
		player_id: 2,
		message: "&pSource Code Available at"
	})
		
	client.write("message", {
		player_id: 3,
		message: "&rgithub.com/yourfriendoss/Cla55ic"
	})
}

function registerColors(client) {
	// Pink
	registerColor("#FFC0CB", "p", client)
	// Royal Yellow
	registerColor("#FADA5E", "r", client)
}

function registerColor(hex, code, client) {
	const [red, green, blue] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
	
	client.write("set_text_color", {
		red,
		green,
		blue,
		alpha: 255,
		code: code.charCodeAt(0)
	})
}


module.exports.registerColors = registerColors;
module.exports.registerEntries = registerEntries;
module.exports.writeHeaders = writeHeaders;
module.exports.sendInfo = sendInfo;