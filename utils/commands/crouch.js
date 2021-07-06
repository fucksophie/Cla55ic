module.exports = (server, client) => {
  client.write('player_teleport', {
    player_id: -1,
    x: client.position.x,
    y: client.position.y - 64,
    z: client.position.z,
    yaw: client.position.yaw,
    pitch: client.position.pitch,
  });
};
