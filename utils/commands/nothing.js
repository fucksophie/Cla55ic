module.exports = (server, client) => {
  client.write('message', {
    player_id: 0,
    message: 'Hello',
  });
};
