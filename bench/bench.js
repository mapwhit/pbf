'use strict';

const Benchmark = require('benchmark');
const fs = require('fs');
const path = require('path');
const protocolBuffers = require('protocol-buffers');
const protobufjs = require('protobufjs');
const vt = require('./vector_tile');
const Pbf = require('../');
const pbfReadTile = vt.Tile.read;
const pbfWriteTile = vt.Tile.write;
const data = fs.readFileSync(path.resolve(__dirname, '../test/fixtures/12665.vector.pbf'));
const suite = new Benchmark.Suite();
const ProtocolBuffersTile = protocolBuffers(fs.readFileSync(path.resolve(__dirname, 'vector_tile.proto'))).Tile;

const ProtobufjsTile = protobufjs.loadSync(path.resolve(__dirname, 'vector_tile.proto'))
  .lookup('vector_tile.Tile');

const pbfTile = pbfReadTile(new Pbf(data));
const tileJSON = JSON.stringify(pbfTile);
const protocolBuffersTile = ProtocolBuffersTile.decode(data);
const protobufjsTile = ProtobufjsTile.decode(data);

suite
  .add('decode vector tile with pbf', function () {
    pbfReadTile(new Pbf(data));
  })
  .add('encode vector tile with pbf', function () {
    const pbf = new Pbf();
    pbfWriteTile(pbfTile, pbf);
    pbf.finish();
  })
  .add('decode vector tile with protocol-buffers', function () {
    ProtocolBuffersTile.decode(data);
  })
  .add('encode vector tile with protocol-buffers', function () {
    ProtocolBuffersTile.encode(protocolBuffersTile);
  })
  .add('decode vector tile with protobuf.js', function () {
    ProtobufjsTile.decode(data);
  })
  .add('encode vector tile with protobuf.js', function () {
    ProtobufjsTile.encode(protobufjsTile);
  })
  .add('JSON.parse vector tile', function () {
    JSON.parse(tileJSON);
  })
  .add('JSON.stringify vector tile', function () {
    JSON.stringify(pbfTile);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .run();
