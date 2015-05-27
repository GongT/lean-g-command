var fs = require('fs'), path = require('path');
var local;
module.exports = DEPLOY;
/*var require = function (){
 global.require
 };*/

function DEPLOY(AV, _require, mainjs_dirname){
	try{
		if(process.env.LEANG_LOCALHOST){
			local = true;
			process.env.TZ = 'UTC';
			console.log('start deploy on localhost.');
		} else{
			local = false;
			console.log('start deploy on leancloud server.');
		}
	} catch(e){
		local = false;
		console.log('start deploy on old leancloud server.');
	}
	
	var savedAv = global.AV;
	if(savedAv){
		console.error('have saved AV object');
	}
	try{
		global._require = _require;
		global.AV = AV;
	} catch(e){
		fatal('Can\'t access global variable');
	}
	
	AV.APP_PATH = path.resolve(mainjs_dirname, '..') + '/';
	console.log('APP_PATH = %s.', AV.APP_PATH);
	
	AV.localhost = local;
	AV.LEANG_PATH = path.resolve(__dirname, '..') + '/';
	AV.CLOUD_DIR = 'cloud/';
	AV.CLOUD_PATH = AV.APP_PATH + 'cloud/';
	AV.INTERNAL_TEMPLATE_PATH = AV.LEANG_PATH + 'include/debug-client/html/';
	AV.GEN_PATH = AV.CLOUD_PATH + '__gen/';
	
	global.appLoaderLog = '';
	try{
		var app = require('./app_init.js');
		var listen = app.listen;
		var call_listen = setTimeout(function (){
			fatal('app.listen() never beem called.');
		}, 0);
		app.listen = function (){
			clearTimeout(call_listen);
			try{
				listen.call(app);
			} catch(e){
				fatal(e.stack || e.message || e);
			}
			AV.loaded = true;
			flush(true);
		};
		return app;
	} catch(e){
		fatal(e.stack || e.message || e);
	}
}

function flush(success){
	if(flush.ok){
		return;
	}
	flush.ok = true;
	if(success){
		if(AV.isDebugEnv || AV.isTestEnv){
			console.log(global.appLoaderLog);
		}
	} else{
		console.error(global.appLoaderLog);
	}
	delete global.appLoaderLog;
	Object.defineProperty(global, 'appLoaderLog', {
		get: function (){
			return '';
		},
		set: function (v){
			console.error(v.trim());
		}
	});
}

function fatal(errormessage){
	flush(false);
	errormessage = errormessage || '';
	if(local){
		process.stderr.write('调试启动失败:\n' + errormessage.trim() + '\n');
		process.exit(10);
	} else{
		throw new Error('部署失败:\n' + errormessage.trim());
	}
}

/*function masked_require(request){
 var Module = module.constructor;
 var filename = Module._resolveFilename(request, module);
 module.paths = Module._nodeModulePaths(path.dirname(filename));
 module.require(request);
 }*/
function masked_requirexx(request){
	var filename = Module._resolveFilename(request, module);
	var cachedModule = Module._cache[filename];
	if(cachedModule){
		return cachedModule.exports;
	}
	
	var m = new Module(filename, module);
	Module._cache[filename] = m;
	
	m.filename = filename;
	m.paths = Module._nodeModulePaths(filename.dirname(filename));
	
	var content = fs.readFileSync(filename, 'utf-8');
	
	// remove shebang
	content = content.replace(/^\#\!.*/, '');
	
	function require(path){
		return m.require(path);
	}
	
	require.resolve = function (request){
		return Module._resolveFilename(request, m);
	};
	
	require.main = module.main;
	require.extensions = Module._extensions;
	require.cache = Module._cache;
	
	var sandbox = {};
	sandbox.require = require;
	sandbox.AV = AV;
	sandbox._require = _require;
	sandbox.exports = m.exports;
	sandbox.__filename = request;
	sandbox.__dirname = filename.dirname(request);
	sandbox.setTimeout = setTimeout;
	sandbox.setInterval = setInterval;
	sandbox.module = m;
	sandbox.global = sandbox;
	sandbox.root = global;
	
	runInNewContext(content, sandbox, {filename: request});
	
	this.loaded = true;
	return m.exports;
}
