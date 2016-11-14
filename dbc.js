var DBC, ach;

DBC = require('./dbceditor.js');

spell = new DBC('Spell.dbc', 'spell');

var fs = require('fs');

var Guildobjs = [];

var fileContents = fs.readFileSync('guildhouse.csv');
var lines = fileContents.toString().split('\n');

function Guildobject(name, id, cast) {
	this.name = name;
	this.gameobj = id;
	this.cast = cast;
}

for (var i = 1; i < lines.length; i++) {
	var arr = lines[i].split(';');
	Guildobjs.push(new Guildobject(arr[0], Number(arr[1]), Number(arr[2])));
}

for (var i = 0; i < Guildobjs.length; i++) {
	console.log("name: " + Guildobjs[i].name + " gameobject: " + Guildobjs[i].gameobj + " cast:" + Guildobjs[i].cast);
}

spell.data.records[0]['Attributes'] = 5306;

spell.save("spellnew.dbc");

/*ach.data.records[53] = {};
ach.data.records[53]['id'] = 15069;
ach.data.records[53]['parentid'] = 95;
ach.data.records[53]['name1'] = "New row";
ach.data.records[53][undefined] = 0;

ach.data.records[53]['name_flags'] = 16712190;
ach.data.records[53]['sortOrder'] = 1;

ach.save('asd.dbc');

//console.log(ach.data.records[53]);*/