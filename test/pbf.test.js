const fs = require('fs');
const path = require('path');
const test = require('tap').test;

global.DEBUG = true;

const Pbf = require('../');

function toArray(buf) {
  const arr = [];
  for (let i = 0; i < buf.length; i++) {
    arr.push(buf[i]);
  }
  return arr;
}

test('initialization', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(0));
  buf.destroy();
  t.end();
});

test('realloc', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(0));
  buf.realloc(5);
  t.ok(buf.length >= 5);
  buf.realloc(25);
  t.ok(buf.length >= 30);
  t.end();
});

const testNumbers = [1, 0, 0, 4, 14, 23, 40, 86, 127, 141, 113, 925, 258, 1105, 1291, 6872, 12545, 16256, 65521, 126522, 133028, 444205,
  846327, 1883372, 2080768, 266338304, 34091302912, 17179869184,
  3716678, 674158, 15203102, 27135056, 42501689, 110263473, 6449928, 65474499, 943840723, 1552431153, 407193337, 2193544970,
  8167778088, 5502125480, 14014009728, 56371207648, 9459068416, 410595966336, 673736830976, 502662539776, 2654996269056,
  5508583663616, 6862782705664, 34717688324096, 1074895093760, 95806297440256, 130518477701120, 197679237955584,
  301300890730496, 1310140661760000, 2883205519638528, 2690669862715392, 3319292539961344
];

test('readVarint & writeVarint', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(0));

  for (let i = 0; i < testNumbers.length; i++) {
    buf.writeVarint(testNumbers[i]);
    buf.writeVarint(-testNumbers[i]);
  }
  const len = buf.finish().length;
  t.equal(len, 841);
  buf.finish();

  let i = 0;
  while (buf.pos < len) {
    t.equal(buf.readVarint(), testNumbers[i]);
    t.equal(buf.readVarint(true), -testNumbers[i++]);
  }

  t.end();
});

test('writeVarint writes 0 for NaN', function (t) {
  const buf = Buffer.allocUnsafe(16);
  const pbf = new Pbf(buf);

  // Initialize buffer to ensure consistent tests
  buf.write('0123456789abcdef', 0);

  pbf.writeVarint('not a number');
  pbf.writeVarint(NaN);
  pbf.writeVarint(50);
  pbf.finish();

  t.equal(pbf.readVarint(), 0);
  t.equal(pbf.readVarint(), 0);
  t.equal(pbf.readVarint(), 50);

  t.end();
});

test('readVarint signed', function (t) {
  let bytes = [0xc8, 0xe8, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01];
  let buf = new Pbf(Buffer.from(bytes));
  t.equal(buf.readVarint(true), -3000);

  bytes = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01];
  buf = new Pbf(Buffer.from(bytes));
  t.equal(buf.readVarint(true), -1);

  bytes = [0xc8, 0x01];
  buf = new Pbf(Buffer.from(bytes));
  t.equal(buf.readVarint(true), 200);

  t.end();
});

test('readVarint64 (compatibility)', function (t) {
  const bytes = [0xc8, 0xe8, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01];
  const buf = new Pbf(Buffer.from(bytes));
  t.equal(buf.readVarint64(), -3000);
  t.end();
});

test('readVarint & writeVarint handle really big numbers', function (t) {
  const buf = new Pbf();
  const bigNum1 = Math.pow(2, 60);
  const bigNum2 = Math.pow(2, 63);
  buf.writeVarint(bigNum1);
  buf.writeVarint(bigNum2);
  buf.finish();
  t.equal(buf.readVarint(), bigNum1);
  t.equal(buf.readVarint(), bigNum2);
  t.end();
});

const testSigned = [0, 1, 2, 0, 2, -1, 11, 18, -17, 145, 369, 891, -1859, -798, 2780, -13107, 12589, -16433, 21140, 148023, 221062, -985141,
  494812, -2121059, -2078871, 82483, 19219191, 29094607, 35779553, -215357075, -334572816, -991453240, -1677041436, -3781260558,
  -6633052788, 1049995056, -22854591776, 37921771616, -136983944384, 187687841024, 107420097536, 1069000079360, 1234936065024,
  -2861223108608, -492686688256, -6740322942976, -7061359607808, 24638679941120, 19583051038720, 83969719009280,
  52578722775040, 416482297118720, 1981092523409408, -389256637841408
];

test('readSVarint & writeSVarint', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(0));

  for (let i = 0; i < testSigned.length; i++) {
    buf.writeSVarint(testSigned[i]);
  }
  const len = buf.finish().length;
  t.equal(len, 224);
  buf.finish();

  let i = 0;
  while (buf.pos < len) {
    t.equal(buf.readSVarint(), testSigned[i++]);
  }

  t.end();
});

test('writeVarint throws error on a number that is too big', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(0));

  t.throws(function () {
    buf.writeVarint(29234322996241367000012); // eslint-disable-line no-loss-of-precision
  });

  t.throws(function () {
    buf.writeVarint(-29234322996241367000012); // eslint-disable-line no-loss-of-precision
  });

  t.end();
});

test('readVarint throws error on a number that is longer than 10 bytes', function (t) {
  const buf = new Pbf(Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
  t.throws(function () {
    buf.readVarint();
  });
  t.end();
});

test('readBoolean & writeBoolean', function (t) {
  const buf = new Pbf();
  buf.writeBoolean(true);
  buf.writeBoolean(false);
  buf.finish();
  t.equal(buf.readBoolean(), true);
  t.equal(buf.readBoolean(), false);
  t.end();
});

test('readBytes', function (t) {
  const buf = new Pbf([8, 1, 2, 3, 4, 5, 6, 7, 8]);
  t.same(toArray(buf.readBytes()), [1, 2, 3, 4, 5, 6, 7, 8]);
  t.end();
});

test('writeBytes', function (t) {
  const buf = new Pbf();
  buf.writeBytes([1, 2, 3, 4, 5, 6, 7, 8]);
  const bytes = buf.finish();
  t.same(toArray(bytes), [8, 1, 2, 3, 4, 5, 6, 7, 8]);
  t.end();
});

test('readDouble', function (t) {
  const buffer = Buffer.allocUnsafe(8);
  buffer.writeDoubleLE(12345.6789012345, 0);
  const buf = new Pbf(buffer);
  t.equal(Math.round(buf.readDouble() * 1e10) / 1e10, 12345.6789012345);
  t.end();
});

test('readPacked and writePacked', function (t) {
  const testNumbers2 = testNumbers.slice(0, 10);

  function testPacked(type) {
    const buf = new Pbf();
    buf['writePacked' + type](1, testNumbers2);
    buf.finish();
    buf.readFields(function readField(tag) {
      const arr = [];
      buf['readPacked' + type](arr);
      if (tag === 1) t.same(arr, testNumbers2, 'packed ' + type);
      else t.fail('wrong tag encountered: ' + tag);
    });
  }

  function testUnpacked(type) {
    const buf = new Pbf();
    const arr = [];

    testNumbers2.forEach(function (n) {
      buf['write' + type + 'Field'](1, n);
    });

    buf.finish();
    buf.readFields(function readField() {
      buf['readPacked' + type](arr);
    });

    t.same(arr, testNumbers2, 'packed ' + type);
  }

  ['Varint', 'SVarint', 'Float', 'Double', 'Fixed32', 'SFixed32', 'Fixed64', 'SFixed64'].forEach(function (type) {
    testPacked(type);
    testUnpacked(type);
  });

  const buf = new Pbf();
  buf.writePackedBoolean(1, testNumbers2);
  buf.finish();
  buf.readFields(function readField(tag) {
    const arr = [];
    buf.readPackedBoolean(arr);
    if (tag === 1) t.same(arr,
      [true, false, false, true, true, true, true, true, true, true], 'packed Boolean');
    else t.fail('wrong tag encountered: ' + tag);
  });

  t.end();
});

test('writePacked skips empty arrays', function (t) {
  const buf = new Pbf();
  buf.writePackedBoolean(1, []);
  t.equal(buf.length, 0);
  t.end();
});

test('writeDouble', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(8));
  buf.writeDouble(12345.6789012345);
  buf.finish();
  t.equal(Math.round(buf.readDouble() * 1e10) / 1e10, 12345.6789012345);
  t.end();
});

test('readFloat', function (t) {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeFloatLE(123.456, 0);
  const buf = new Pbf(buffer);
  t.equal(Math.round(1000 * buf.readFloat()) / 1000, 123.456);
  t.end();
});

test('writeFloat', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(4));
  buf.writeFloat(123.456);
  buf.finish();
  t.equal(Math.round(1000 * buf.readFloat()) / 1000, 123.456);
  t.end();
});

test('readFixed32', function (t) {
  const buffer = Buffer.allocUnsafe(16);
  buffer.writeUInt32LE(42, 0);
  buffer.writeUInt32LE(24, 4);
  const buf = new Pbf(buffer);
  t.equal(buf.readFixed32(), 42);
  t.equal(buf.readFixed32(), 24);
  t.end();
});

test('writeFixed32', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(16));
  buf.writeFixed32(42);
  buf.writeFixed32(24);
  buf.finish();
  t.equal(buf.readFixed32(), 42);
  t.equal(buf.readFixed32(), 24);
  t.end();
});

test('readFixed64', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(8));
  buf.writeFixed64(102451124123);
  buf.finish();
  t.same(buf.readFixed64(), 102451124123);
  t.end();
});

test('writeFixed64', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(8));
  buf.writeFixed64(102451124123);
  t.same(toArray(buf.buf), [155, 23, 144, 218, 23, 0, 0, 0]);
  t.end();
});

test('readSFixed32', function (t) {
  const buffer = Buffer.allocUnsafe(16);
  buffer.writeInt32LE(4223, 0);
  buffer.writeInt32LE(-1231, 4);
  const buf = new Pbf(buffer);
  t.equal(buf.readSFixed32(), 4223);
  t.equal(buf.readSFixed32(), -1231);
  t.end();
});

test('writeSFixed32', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(16));
  buf.writeSFixed32(4223);
  buf.writeSFixed32(-1231);
  buf.finish();
  t.equal(buf.readSFixed32(), 4223);
  t.equal(buf.readSFixed32(), -1231);
  t.end();
});

test('readSFixed64', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(8));
  buf.writeSFixed64(-102451124123);
  buf.finish();
  t.same(buf.readSFixed64(), -102451124123);
  t.end();
});

test('writeSFixed64', function (t) {
  const buf = new Pbf(Buffer.allocUnsafe(8));
  buf.writeSFixed64(-102451124123);
  t.same(toArray(buf.buf), [101, 232, 111, 37, 232, 255, 255, 255]);
  t.end();
});

test('writeString & readString', function (t) {
  const buf = new Pbf();
  buf.writeString('Привет 李小龙');
  const bytes = buf.finish();
  t.same(bytes, new Uint8Array([22, 208, 159, 209, 128, 208, 184, 208, 178, 208, 181, 209, 130, 32, 230, 157, 142, 229, 176, 143, 233, 190, 153]));
  t.equal(buf.readString(), 'Привет 李小龙');
  t.end();
});

test('writeString & readString longer', function (t) {
  const str = '{"Feature":"http://example.com/vocab#Feature","datetime":{"@id":"http://www.w3.org/2006/time#inXSDDateTime","@type":"http://www.w3.org/2001/XMLSchema#dateTime"},"when":"http://example.com/vocab#when"}';
  const buf = new Pbf();
  buf.writeString(str);
  buf.finish();
  t.equal(buf.readString(), str);
  t.end();
});

test('more complicated utf8', function (t) {
  const buf = new Pbf();
  // crazy test from github.com/mathiasbynens/utf8.js
  const str = '\uDC00\uDC00\uDC00\uDC00A\uDC00\uD834\uDF06\uDC00\uDEEE\uDFFF\uD800\uDC00\uD800\uD800\uD800\uD800A' +
    '\uD800\uD834\uDF06';
  buf.writeString(str);
  buf.finish();
  const str2 = buf.readString();
  t.same(new Uint8Array(str2), new Uint8Array(str));
  t.end();
});

test('readFields', function (t) {
  const buf = new Pbf(fs.readFileSync(path.join(__dirname, '/fixtures/12665.vector.pbf')));
  const layerOffsets = [];
  const foo = {};
  let res;
  let res2;
  let buf2;

  res2 = buf.readFields(function (tag, result, buf) {
    if (tag === 3) layerOffsets.push(buf.pos);
    res = result;
    buf2 = buf;
  }, foo);

  t.equal(res, foo);
  t.equal(res2, foo);
  t.equal(buf2, buf);

  t.ok(buf.pos >= buf.length);
  t.same(layerOffsets, [1, 2490, 2581, 2819, 47298, 47626, 55732, 56022, 56456, 88178, 112554]);

  t.end();
});

test('readMessage', function (t) {
  const buf = new Pbf(fs.readFileSync(path.join(__dirname, '/fixtures/12665.vector.pbf')));
  const layerNames = [];
  const foo = {};

  buf.readFields(function (tag) {
    if (tag === 3) buf.readMessage(readLayer, foo);
  }, foo);

  function readLayer(tag) {
    if (tag === 1) layerNames.push(buf.readString());
  }

  t.same(layerNames, ['landuse', 'water', 'barrier_line', 'building', 'tunnel', 'road',
    'place_label', 'water_label', 'poi_label', 'road_label', 'housenum_label'
  ]);

  t.end();
});

test('field writing methods', function (t) {
  const buf = new Pbf();
  buf.writeFixed32Field(1, 100);
  buf.writeFixed64Field(2, 200);
  buf.writeVarintField(3, 1234);
  buf.writeSVarintField(4, -599);
  buf.writeStringField(5, 'Hello world');
  buf.writeFloatField(6, 123);
  buf.writeDoubleField(7, 123);
  buf.writeBooleanField(8, true);
  buf.writeBytesField(9, [1, 2, 3]);
  buf.writeMessage(10, function () {
    buf.writeBooleanField(1, true);
    buf.writePackedVarint(2, testNumbers);
  });

  buf.writeSFixed32Field(11, -123);
  buf.writeSFixed64Field(12, -256);

  buf.finish();

  buf.readFields(function (tag) {
    if (tag === 1) buf.readFixed32();
    else if (tag === 2) buf.readFixed64();
    else if (tag === 3) buf.readVarint();
    else if (tag === 4) buf.readSVarint();
    else if (tag === 5) buf.readString();
    else if (tag === 6) buf.readFloat();
    else if (tag === 7) buf.readDouble();
    else if (tag === 8) buf.readBoolean();
    else if (tag === 9) buf.readBytes();
    else if (tag === 10) buf.readMessage(function () { /* skip */ });
    else if (tag === 11) buf.readSFixed32();
    else if (tag === 12) buf.readSFixed64();
    else t.fail('unknown tag');
  });
  t.end();
});

test('skip', function (t) {
  const buf = new Pbf();
  buf.writeFixed32Field(1, 100);
  buf.writeFixed64Field(2, 200);
  buf.writeVarintField(3, 1234);
  buf.writeStringField(4, 'Hello world');
  buf.finish();

  buf.readFields(function () { /* skip */ });

  t.equal(buf.pos, buf.length);

  t.throws(function () {
    buf.skip(6);
  });
  t.end();
});

test('write a raw message > 0x10000000', function (t) {
  const buf = new Pbf();
  const marker = 0xdeadbeef;
  const encodedMarker = new Uint8Array([0xef, 0xbe, 0xad, 0xde]);
  const markerSize = encodedMarker.length;
  const rawMessageSize = 0x10000004;
  const encodedSize = new Uint8Array([0x84, 0x80, 0x80, 0x80, 0x01]);

  buf.writeRawMessage(function (_obj, pbf) {
    // Repeatedly fill with the marker until it reaches the size target.
    const n = rawMessageSize / markerSize;
    for (let i = 0; i < n; i++) {
      pbf.writeFixed32(marker);
    }
  }, null);

  const bytes = buf.finish();
  t.equal(bytes.length, rawMessageSize + encodedSize.length);

  // The encoded size in varint should go first
  t.same(bytes.subarray(0, encodedSize.length), encodedSize);

  // Then the message itself. Verify that the first few bytes match the marker.
  t.same(bytes.subarray(encodedSize.length, encodedSize.length + markerSize), encodedMarker);

  t.end();
});
