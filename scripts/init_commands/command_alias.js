var fs = require('fs');

var file = require('path').resolve('.avoscloud/alias.json');
var alias = {};
try{
	alias = JSON.parse(fs.readFileSync(file));
	console.log('alias: ', alias[input].join(' '))
} catch(E){
}

module.exports.load = function (){
	"use strict";
	var input = process.argv[2];
	if(alias[input]){
		process.argv = [process.argv[0], process.argv[1]].concat(alias[input]);
		console.log('alias: ', alias[input].join(' '))
	}
};
module.exports.save = function (){
	"use strict";
	var input = process.argv[3];
	var m = input.split('=', 2);
	var name = m[0];
	var value = m[1];
	
	alias[name] = value.split(/\s+/g);
	
	fs.writeFileSync(file, JSON.stringify(alias, null, 8));
	
	console.log('OK!! saved to %s.', file);
};
