var Schema, parse_string_block;

Schema = require('./schema');

parse_string_block = function(buf, file) {
  var byte, current_string, j, len, ptr, strings;
  strings = {};
  ptr = 0;
  current_string = '';
  for (j = 0, len = buf.length; j < len; j++) {
    byte = buf[j];
    if (byte === 0) {
      strings[ptr - current_string.length] = current_string;
      current_string = '';
    } else {
      current_string += String.fromCharCode(byte);
    }
    ptr++;
  }
  return strings;
};

module.exports = function(buf, file_type) {
  var field, file, i, ptr, record, record_block, record_data, string_block_position, type;
  if (!(Schema[file_type] || file_type === 'debug')) {
    throw "Unknown schema " + file_type;
  }
  if (buf.readUInt32LE(0) !== Schema.MAGIC_NUMBER) {
    throw "File isn't valid DBC (missing magic number)";
  }
  file = {
    record_count: buf.readUInt32LE(4),
    field_count: buf.readUInt32LE(8),
    record_size: buf.readUInt32LE(12)
  };
  if (file_type === 'debug') {
    return file;
  }
  string_block_position = buf.length - buf.readUInt32LE(16);
  file.strings = parse_string_block(buf.slice(string_block_position), file);
  record_block = buf.slice(20, string_block_position);
  file.records = (function() {
    var j, k, len, ref, ref1, ref2, results;
    results = [];
    for (i = j = 0, ref = file.record_count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      record_data = record_block.slice(i * file.record_size, (i + 1) * file.record_size);
      ptr = 0;
      record = {};
      ref1 = Schema[file_type];
      for (k = 0, len = ref1.length; k < len; k++) {
        ref2 = ref1[k], type = ref2[0], field = ref2[1];
        if (type === 'int') {
          record[field] = record_data.readInt32LE(ptr);
          ptr += 4;
        } else if (type === 'uint') {
          record[field] = record_data.readUInt32LE(ptr);
          ptr += 4;
        } else if (type === 'byte') {
          record[field] = record_data.readInt8(ptr);
          ptr += 1;
        } else if (type === 'string') {
          record[field] = file.strings[record_data.readInt32LE(ptr)];
          ptr += 4;
        } else if (type === 'localization') {
          record['localization_mask'] = record_data.readInt32LE(ptr + 4 * 7);
          ptr += 4 * 8;
        } else if (type === 'float') {
          record[field] = record_data.readFloatLE(ptr);
          ptr += 4;
        } else {
          throw "Unknown field type '" + type + "' for field '" + field + "'";
        }
      }
      results.push(record);
    }
    return results;
  })();
  return file;
};