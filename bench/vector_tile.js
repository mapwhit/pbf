// Tile ========================================

const Tile = (exports.Tile = {});

Tile.read = (pbf, end) => pbf.readFields(Tile._readField, { layers: [] }, end);
Tile._readField = (tag, obj, pbf) => {
  if (tag === 3) obj.layers.push(Tile.Layer.read(pbf, pbf.readVarint() + pbf.pos));
};
Tile.write = (obj, pbf) => {
  if (obj.layers) for (let i = 0; i < obj.layers.length; i++) pbf.writeMessage(3, Tile.Layer.write, obj.layers[i]);
};

Tile.GeomType = {
  UNKNOWN: 0,
  POINT: 1,
  LINESTRING: 2,
  POLYGON: 3
};

// Tile.Value ========================================

Tile.Value = {};

Tile.Value.read = (pbf, end) =>
  pbf.readFields(
    Tile.Value._readField,
    {
      string_value: '',
      float_value: 0,
      double_value: 0,
      int_value: 0,
      uint_value: 0,
      sint_value: 0,
      bool_value: false
    },
    end
  );
Tile.Value._readField = (tag, obj, pbf) => {
  if (tag === 1) obj.string_value = pbf.readString();
  else if (tag === 2) obj.float_value = pbf.readFloat();
  else if (tag === 3) obj.double_value = pbf.readDouble();
  else if (tag === 4) obj.int_value = pbf.readVarint(true);
  else if (tag === 5) obj.uint_value = pbf.readVarint();
  else if (tag === 6) obj.sint_value = pbf.readSVarint();
  else if (tag === 7) obj.bool_value = pbf.readBoolean();
};
Tile.Value.write = (obj, pbf) => {
  if (obj.string_value) pbf.writeStringField(1, obj.string_value);
  if (obj.float_value) pbf.writeFloatField(2, obj.float_value);
  if (obj.double_value) pbf.writeDoubleField(3, obj.double_value);
  if (obj.int_value) pbf.writeVarintField(4, obj.int_value);
  if (obj.uint_value) pbf.writeVarintField(5, obj.uint_value);
  if (obj.sint_value) pbf.writeSVarintField(6, obj.sint_value);
  if (obj.bool_value) pbf.writeBooleanField(7, obj.bool_value);
};

// Tile.Feature ========================================

Tile.Feature = {};

Tile.Feature.read = (pbf, end) =>
  pbf.readFields(Tile.Feature._readField, { id: 0, tags: [], type: 0, geometry: [] }, end);
Tile.Feature._readField = (tag, obj, pbf) => {
  if (tag === 1) obj.id = pbf.readVarint();
  else if (tag === 2) pbf.readPackedVarint(obj.tags);
  else if (tag === 3) obj.type = pbf.readVarint();
  else if (tag === 4) pbf.readPackedVarint(obj.geometry);
};
Tile.Feature.write = (obj, pbf) => {
  if (obj.id) pbf.writeVarintField(1, obj.id);
  if (obj.tags) pbf.writePackedVarint(2, obj.tags);
  if (obj.type) pbf.writeVarintField(3, obj.type);
  if (obj.geometry) pbf.writePackedVarint(4, obj.geometry);
};

// Tile.Layer ========================================

Tile.Layer = {};

Tile.Layer.read = (pbf, end) =>
  pbf.readFields(
    Tile.Layer._readField,
    { version: 1, name: '', features: [], keys: [], values: [], extent: 4096 },
    end
  );
Tile.Layer._readField = (tag, obj, pbf) => {
  if (tag === 15) obj.version = pbf.readVarint();
  else if (tag === 1) obj.name = pbf.readString();
  else if (tag === 2) obj.features.push(Tile.Feature.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 3) obj.keys.push(pbf.readString());
  else if (tag === 4) obj.values.push(Tile.Value.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 5) obj.extent = pbf.readVarint();
};
Tile.Layer.write = (obj, pbf) => {
  if (obj.version !== undefined && obj.version !== 1) pbf.writeVarintField(15, obj.version);
  if (obj.name) pbf.writeStringField(1, obj.name);
  if (obj.features)
    for (let i = 0; i < obj.features.length; i++) pbf.writeMessage(2, Tile.Feature.write, obj.features[i]);
  if (obj.keys) for (let i = 0; i < obj.keys.length; i++) pbf.writeStringField(3, obj.keys[i]);
  if (obj.values) for (let i = 0; i < obj.values.length; i++) pbf.writeMessage(4, Tile.Value.write, obj.values[i]);
  if (obj.extent !== undefined && obj.extent !== 4096) pbf.writeVarintField(5, obj.extent);
};
