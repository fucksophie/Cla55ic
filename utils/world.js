const fs = require('fs');
const zlib = require('zlib');

class World {
  constructor(size, file) {
    this.size = size;
    this.file = file;

    const layers = Math.floor(this.size.y / 2);

    if (!fs.existsSync(file)) {
      // eslint-disable-next-line new-cap
      this.data = new Buffer.alloc(4 + size.x * size.y * size.z, 0);
      this.data.writeInt32BE(this.size.x * this.size.y * this.size.z, 0);
      for (let i = 0; i < layers; i += 1) {
        if (i === layers - 1) {
          this.setLayer(layers - 1, 2);
        } else {
          this.setLayer(i, 1);
        }
      }
    } else {
      this.load();
    }
  }

  setBlock(pos, block) {
    this.data.writeUInt8(block, 4 + pos.x + this.size.z * (pos.z + this.size.x * pos.y));
  }

  getBlock(pos) {
    return this.data.readUInt8(4 + pos.x + this.size.z * (pos.z + this.size.x * pos.y));
  }

  dump() {
    return this.data;
  }

  setLayer(y, type) {
    for (let i = 0; i < this.size.z; i += 1) {
      for (let b = 0; b < this.size.x; b += 1) {
        this.setBlock({
          x: b,
          y,
          z: i,
        }, type);
      }
    }
  }

  load() {
    this.data = zlib.gunzipSync(fs.readFileSync(this.file));
  }

  save() {
    fs.writeFileSync(this.file, zlib.gzipSync(this.data));
  }

  sendPackets(client) {
    client.write('level_initialize', {});

    const raw = zlib.gzipSync(this.data);

    for (let i = 0; i < raw.length; i += 1024) {
      client.write('level_data_chunk', {
        chunk_data: raw.slice(i, Math.min(i + 1024, raw.length)),
        percent_complete: i === 0 ? 0 : Math.ceil((i / raw.length) * 100),
      });
    }

    client.write('level_finalize', {
      x_size: this.size.x,
      y_size: this.size.y,
      z_size: this.size.z,
    });
  }
}

module.exports = World;
