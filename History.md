
#### 3.2.1 (Oct 11, 2019)

- Significantly improved performance when decoding large strings in the browser.

#### 3.2.0 (Mar 11, 2019)

- Improved decoding to be able to parse repeated fields even if they were specified as packed, and vise versa.
- Improved packed encoding to skip empty arrays (previously, it would write a tag).
- Fixed an off-by-one data corruption bug when writing a message larger than 0x10000000 bytes.

#### 3.1.0 (Sep 27, 2017)

- Added support for Protocol Buffer 3 [maps](https://developers.google.com/protocol-buffers/docs/proto3#maps) to proto compiler.

#### 3.0.5 (Nov 30, 2016)

- Fixed an error appearing in some versions of IE11 and old Android browsers.

#### 3.0.4 (Nov 14, 2016)

- Fixed compiling repeated packed enum fields.

#### 3.0.3 (Nov 14, 2016)

- Fixed a regression that broke compiling repeated enum fields with defaults.

#### 3.0.2 (Sep 30, 2016)

- Fixed a regression that broke decoding of packed fields with a tag that didn't fit into one byte.

#### 3.0.1 (Sep 20, 2016)

- Fixed a regression that broke encoding of long strings.

#### 3.0.0 (Aug 30, 2016)

This release include tons of compatibility/robustness fixes, and a more reliable Node implementation. Decoding performance is expected to get up to ~15% slower than v2.0 in Node (browsers are unaffected), but encoding got faster by ~15% in return.

##### Encoder/decoder

- **Breaking**: changed Node implementation to use `Uint8Array` instead of `Buffer` internally (and produce corresponding result on `finish()`), making it fully match the browser implementation for consistency and simplicity.
- Fixed `writeVarint` to write `0` when given `NaN` or other non-number to avoid producing a broken Protobuf message.
- Changed `readPacked*` methods signature to accept an optional `arr` argument to append the results to (to support messages with repeated fields that mix packed/non-packed encoding).
- Added an optional `isSigned` argument to `readVarint` that enables proper reading of negative varints.
- Deprecated `readVarint64()` (it still works, but it's recommended to be changed to `readVarint(true)`).
- Faster string encoding.

##### Proto compiler

- **Breaking:** Full support for defaults field values (both implicit and explicit); they're now included in the decoded JSON objects.
- Fixed reading of repeated fields with mixed packed/non-packed encoding for compatibility.
- Fixed proto3 compiler to use packed by default for repeated scalar fields.
- Fixed reading of negative varint types.
- Fixed packed fields to decode into `[]` if they're not present.
- Fixed nested message references handling.
- Fixed `packed=false` being interpreted as packed.
- Added a comment to generated code with pbf version number.

#### 2.0.1 (May 28, 2016)

- Fixed a regression with `writeVarint` that affected certain numbers.

#### 2.0.0 (May 28, 2016)

- Significantly improved the proto compiler, which now produces a much safer reading/writing code.
- Added the ability to compile a read/write module from a protobuf schema directly in the code.
- Proto compiler: fixed name resolutions and collisions in schemas with nested messages.
- Proto compiler: fixed broken top-level enums.

#### 1.3.7 (May 28, 2016)

- Fixed a regression with `writeVarint` that affected certain numbers.

#### 1.3.6 (May 27, 2016)

- Improved read and write performance (both ~15% faster).
- Improved generated code for default values.

#### 1.3.5 (Oct 5, 2015)

- Added support for `syntax` keyword proto files (by updating `resolve-protobuf-schema` dependency).

#### 1.3.4 (Jul 31, 2015)

- Added `writeRawMessage` method for writing a message without a tag, useful for creating pbfs with multiple top-level messages.

#### 1.3.2 (Mar 5, 2015)

- Added `readVarint64` method for proper decoding of negative `int64`-encoded values.

#### 1.3.1 (Feb 20, 2015)

- Fixed pbf proto compile tool generating broken writing code.

#### 1.3.0 (Feb 5, 2015)

- Added `pbf` binary that compiles `.proto` files into `Pbf`-based JavaScript modules.

#### 1.2.0 (Jan 5, 2015)

##### Breaking API changes

- Changed `writeMessage` signature to `(tag, fn, obj)` (see example in the docs)
  for a huge encoding performance improvement.
- Replaced `readPacked` and `writePacked` methods that accept type as a string
  with `readPackedVarint`, etc. for each type (better performance and simpler API).

##### Improvements

- 5x faster encoding in Node (vector tile benchmark).
- 40x faster encoding and 3x faster decoding in the browser (vector tile benchmark).

#### 1.1.4 (Jan 2, 2015)

- Significantly improved `readPacked` and `writePacked` performance (the tile reading benchmark is now 70% faster).

#### 1.1.3 (Dec 26, 2014)

Brings tons of improvements and fixes over the previous version (`0.0.2`).
Basically makes the library complete.

##### Improvements

- Improved performance of both reading and writing.
- Made the browser build 3 times smaller.
- Added convenience `readFields` and `readMessage` methods for a much easier reading API.
- Added reading methods: `readFloat`, `readBoolean`, `readSFixed32`, `readSFixed64`.
- Added writing methods: `writeUInt64`, `writeSFixed32`, `writeSFixed64`.
- Improved `readDouble` and `readString` to use native Buffer methods under Node.
- Improved `readString` and `writeString` to use HTML5 `TextEncoder` and `TextDecoder` where available.
- Made `Pbf` `buffer` argument optional.
- Added extensive docs and examples in the readme.
- Added an extensive test suite that brings test coverage up to 100%.

##### Breaking API changes

- Renamed `readBuffer`/`writeBuffer` to `readBytes`/`writeBytes`.
- Renamed `readUInt32`/`writeUInt32` to `readFixed32`/`writeFixed32`, etc.
- Renamed `writeTaggedVarint` to `writeVarintField`, etc.
- Changed `writePacked` signature from `(type, tag, items)` to `(tag, type, items)`.

##### Bugfixes

- Fixed `readVarint` to handle varints bigger than 6 bytes.
- Fixed `readSVarint` to handle number bigger than `2^30`.
- Fixed `writeVarint` failing on some integers.
- Fixed `writeVarint` not throwing an error on numbers that are too big.
- Fixed `readUInt64` always failing.
- Fixed writing to an empty buffer always failing.
