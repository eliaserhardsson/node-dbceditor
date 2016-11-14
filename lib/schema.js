var Schema, file, fs, i, len, name, path, ref;

path = require('path');

fs = require('fs');

Schema = {
  MAGIC_NUMBER: 1128416343,
  HEADER_SIZE: 20
};

ref = fs.readdirSync(__dirname + "/schema");
for (i = 0, len = ref.length; i < len; i++) {
  file = ref[i];
  name = path.basename(file, '.js');
  Schema[name] = require("./schema/" + name);
}

module.exports = Schema;