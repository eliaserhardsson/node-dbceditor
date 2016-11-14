var DBC, fs, path;

path = require('path');

fs = require('fs');

DBC = (function() {
  function DBC(filename1, schema, auto_parse) {
    var file;
    this.filename = filename1;
    this.schema = schema;
    if (auto_parse == null) {
      auto_parse = true;
    }
    if (this.schema == null) {
      this.schema = path.basename(this.filename, '.dbc');
    }
    file = fs.readFileSync(this.filename);
    if (auto_parse) {
      this.data = this.parse(file, this.schema);
    }
  }

  DBC.prototype.save = function(filename) {
    if (filename == null) {
      filename = this.filename;
    }
    return fs.writeFileSync(filename, this.dump(this.data, this.schema));
  };

  DBC.prototype.parse = require('./lib/parse');

  DBC.prototype.dump = require('./lib/dump');

  return DBC;

})();

module.exports = DBC;