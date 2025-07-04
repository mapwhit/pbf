const Benchmark = require('benchmark');
const fs = require('node:fs');
const path = require('node:path');
const protocolBuffers = require('protocol-buffers');
const protobufjs = require('protobufjs');
const vt = require('./vector_tile');
const Pbf = require('../');

const { read: pbfReadTile, write: pbfWriteTile } = vt.Tile;
const data = fs.readFileSync(path.resolve(__dirname, '../test/fixtures/12665.vector.pbf'));
const ProtocolBuffersTile = protocolBuffers(fs.readFileSync(path.resolve(__dirname, 'vector_tile.proto'))).Tile;

const ProtobufjsTile = protobufjs.loadSync(path.resolve(__dirname, 'vector_tile.proto')).lookup('vector_tile.Tile');

const pbfTile = pbfReadTile(new Pbf(data));
const tileJSON = JSON.stringify(pbfTile);
const protocolBuffersTile = ProtocolBuffersTile.decode(data);
const protobufjsTile = ProtobufjsTile.decode(data);

const suite = new Benchmark.Suite();
suite
  .add('decode vector tile with pbf', () => {
    pbfReadTile(new Pbf(data));
  })
  .add('encode vector tile with pbf', () => {
    const pbf = new Pbf();
    pbfWriteTile(pbfTile, pbf);
    pbf.finish();
  })
  .add('decode vector tile with protocol-buffers', () => {
    ProtocolBuffersTile.decode(data);
  })
  .add('encode vector tile with protocol-buffers', () => {
    ProtocolBuffersTile.encode(protocolBuffersTile);
  })
  .add('decode vector tile with protobuf.js', () => {
    ProtobufjsTile.decode(data);
  })
  .add('encode vector tile with protobuf.js', () => {
    ProtobufjsTile.encode(protobufjsTile);
  })
  .add('JSON.parse vector tile', () => {
    JSON.parse(tileJSON);
  })
  .add('JSON.stringify vector tile', () => {
    JSON.stringify(pbfTile);
  })
  .on('cycle', event => {
    console.log(String(event.target));
  })
  .run();
