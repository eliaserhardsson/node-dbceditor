var Schema;

Schema = require('./schema');

module.exports = function(file, file_type) {
  var buf, field, i, j, k, l, len, len1, len2, length, ptr, record, record_block, ref, ref1, ref2, ref3, string_block, string_block_size, string_ptr, type, value;
  if (!Schema[file_type]) {
    throw "Unknown schema " + file_type;
  }
  //console.log(file.records);
  string_block_size = 1;
  ref = file.records;
  for (j = 0, len = ref.length; j < len; j++) {
    record = ref[j];
    for (field in record) {
      value = record[field];
      if (typeof value === 'string') {
        string_block_size += value.length + 1;
      }
    }
  }
  length = Schema.HEADER_SIZE + file.records.length * file.record_size + string_block_size;
  buf = new Buffer(length);
  buf.writeUInt32LE(Schema.MAGIC_NUMBER, 0);
  buf.writeUInt32LE(file.records.length, 4);
  buf.writeUInt32LE(file.field_count, 8);
  buf.writeUInt32LE(file.record_size, 12);
  buf.writeUInt32LE(string_block_size, 16);
  if (string_block_size > 1) {
    string_block = buf.slice(buf.length - string_block_size);
    string_ptr = 1;
    string_block.writeInt32LE(0, 0);
  }
  record_block = buf.slice(Schema.HEADER_SIZE, buf.length - string_block_size);
  ptr = 0;
  ref1 = file.records;
  for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
    record = ref1[i];
    ref2 = Schema[file_type];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      ref3 = ref2[l], type = ref3[0], field = ref3[1];
      if (type === 'int') {
        record_block.writeInt32LE(record[field], ptr);
        ptr += 4;
      } else if (type === 'uint') {
        record_block.writeUInt32LE(record[field], ptr);
        ptr += 4;
      } else if (type === 'byte') {
        record_block.writeInt8(record[field], ptr);
        ptr += 1;
      } else if (type === 'string') {
        string_block.write(record[field] + "\u0000", string_ptr, record[field].length + 1);
        record_block.writeInt32LE(string_ptr, ptr);
        ptr += 4;
        string_ptr += record[field].length + 1;
      } else if (type === 'localization') {
        record_block.writeInt32LE(0, ptr);
        record_block.writeInt32LE(0, ptr + 4);
        record_block.writeInt32LE(0, ptr + 8);
        record_block.writeInt32LE(0, ptr + 12);
        record_block.writeInt32LE(0, ptr + 16);
        record_block.writeInt32LE(0, ptr + 20);
        record_block.writeInt32LE(0, ptr + 24);
        record_block.writeInt32LE(record['localization_mask'], ptr + 28);
        ptr += 32;
      } else if (type === 'float') {
        record_block.writeFloatLE(record[field], ptr);
        ptr += 4;
      } else if (type === 'null') {
        record_block.writeInt32LE(0, ptr);
        ptr += 4;
      } else {
        throw "Unknown field type '" + type + "' for field '" + field + "'";
      }
    }
  }
  return buf;
};