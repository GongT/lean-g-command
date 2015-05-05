var fs = require('fs');

var file = require('path').resolve('.avoscloud/alias.json');
var alias = {};
try{
	alias = JSON.parse(fs.readFileSync(file));
	console.log('alias: ', alias[input].join(' '))
} catch(E){
}

if(process.argv.length == 3 && process.argv[2] == 'alias'){
	console.log('Alias:');
	for(var i in alias){
		console.log('\t%s="leang %s"', i, alias[i].join(' '));
	}
	process.exit(0);
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
	
	if(!value){
		if(alias[name]){
			console.log('Alias:\n\t%s="leang %s"', name, alias[name].join(' '));
		} else{
			console.log('Alias:\n\tno alias for "%s"', name);
		}
		process.exit(0);
	}
	
	alias[name] = value.split(/\s+/g);
	
	fs.writeFileSync(file, JSON.stringify(alias, null, 8));
	
	console.log('OK!! saved to %s.', file);
};
