import runStats from 'tile-stats-runner';
import Pbf from '../index.js';
import { Tile } from './vector_tile.js';

const url = 'https://tiles.openfreemap.org/planet/latest/{z}/{x}/{y}.pbf';

let readTime = 0;
let writeTime = 0;
let size = 0;
let numTiles = 0;

runStats(url, processTile, showStats, {
  width: 2880,
  height: 1800,
  minZoom: 0,
  maxZoom: 16,
  center: [-77.032751, 38.912792]
});

function processTile(body) {
  size += body.length;
  numTiles++;

  let now = clock();
  const tile = Tile.read(new Pbf(body));
  readTime += clock(now);

  now = clock();
  const pbf = new Pbf();
  Tile.write(tile, pbf);
  const buf = pbf.finish();
  writeTime += clock(now);

  console.assert(buf);
}

function showStats() {
  console.log('%d tiles, %d KB total', numTiles, Math.round(size / 1024));
  console.log('read time: %dms, or %d MB/s', Math.round(readTime), speed(readTime, size));
  console.log('write time: %dms, or %d MB/s', Math.round(writeTime), speed(writeTime, size));
}

function speed(time, size) {
  return Math.round(size / (1 << 20) / (time / 1000));
}

function clock(start) {
  if (!start) return process.hrtime();
  const t = process.hrtime(start);
  return t[0] * 1e3 + t[1] * 1e-6;
}
