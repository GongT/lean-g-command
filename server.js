var express = require('express');
var chokidar = require('chokidar');
var path = require('path');
var child_process = require('child_process');
var isWindows = process.platform === 'win32';

var app = express();

app.use('/lean-g-command', require('serve-static')('./doc'));
app.use('/lean-g-command', require('serve-static')('./'));
app.get('/', function (req, rsp){
	rsp.location('/lean-g-command');
	// 302=temp  301=perma
	rsp.status(302).send('<h1>redirect to <a href="/lean-g-command">/lean-g-command</a></h1>');
});
var port = parseInt(process.argv[2]) || 8080;

spawn_build();

app.listen(port);
console.log('server listening on %s.', port);

var root = require('fs').realpathSync('./documents');
var watch = chokidar.watch(root, {
	ignored      : /___jb_bak___/,
	ignoreInitial: true
});
watch
		.on('change', function (file){
			file = file.replace(root, '.');
			file = file.replace(/\\/g, '/');
			
			if(/^\.\/include\//.test(file)){
				spawn_build();
			} else{
				spawn_build(file);
			}
		});

function spawn_build(file){
	var options = {
		stdio: 'inherit',
		env  : process.env
	};
	var args;
	
	if(isWindows){
		args = ['/C', 'node', './build.js'];
		if(file){
			args.push(file);
		}
		console.log('spawn build - %s %s', process.env.comspec, args.join(' '));
		return child_process.spawn(process.env.comspec, args, options);
	} else{
		args = [];
		if(file){
			args.push(file);
		}
		console.log('spawn build - ./build.js %s', args.join(' '));
		return child_process.spawn('./build.js', args, options);
	}
}
