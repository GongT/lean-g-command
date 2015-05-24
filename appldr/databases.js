var extend = require('util')._extend;
var basename = require('path').basename;
var AV = global.AV;

function DatabaseModel(className, basePath, config){
	var cls = bindAll(className, config['static'] || {}, DatabaseModel._prototype.static);
	var prop = bindAll(className, config['property'] || {}, DatabaseModel._prototype.property);
	
	if(config.constants){
		extend(cls, require(config.constants));
	}
	
	var mdl = AV.Object.extend(className, prop, cls);
	mdl.className = className;
	mdl.basePath = basePath;
	
	for(var n in cls){
		if(mdl.hasOwnProperty(n) && typeof mdl[n] === 'function'){
			mdl[n] = mdl[n].bind(mdl);
		}
	}
	
	mdl.prototype.class = mdl;
	mdl.prototype.className = className;
	mdl.prototype.basePath = basePath;
	return mdl;
}

module.exports = DatabaseModel;
DatabaseModel._prototype = {
	extend   : function (udef){
		for(var n in udef){
			if(typeof udef[n] !== 'object'){
				console.error('cannot resolve module proto', udef);
				continue;
			}
			if(!this[n]){
				console.error('unknown module proto type', n);
				continue;
			}
			for(var name in udef[n]){
				this[n][name] = require(udef[n][name]);
			}
		}
	},
	static   : {
		registerTrigger: function (def){
			for(var ttype in def){
				AV.Cloud[ttype](this.className, require(def[ttype]));
			}
		}
	},
	property : {},
	constants: ""
};

function bindAll(name, data, _pt){
	var result = {className: name};
	var fname, file, func;
	for(fname in data){
		if(!_pt.hasOwnProperty(fname)){
			continue;
		}
		file = data[fname];
		func = require(file);
		result[fname] = func;
	}
	for(fname in _pt){
		file = _pt[fname];
		if(!_pt.hasOwnProperty(fname) || result.hasOwnProperty(fname)){
			continue;
		}
		if(typeof file === 'function'){
			func = file;
		} else{
			func = require(file);
		}
		result[fname] = func;
	}
	return result;
}

module.exports.parseDatabaseDefine = function (){
	global.appLoaderLog += '\tbase proto...\n';
	AV.CLS._prototype.extend(AV.FS.read_core_source_tree('database_proto'));
	
	/* 数据模型、基本组件 */
	var databases = AV.FS.read_source_tree('cloud/database');
	
	if(databases._proto_){
		global.appLoaderLog += '\tuser proto...\n';
		AV.CLS._prototype.extend(databases._proto_);
		delete databases._proto_;
	}
	
	Object.keys(databases).forEach(function (dbname){
		var basepath = 'cloud/database/' + dbname + '/';
		var database = class_name(dbname);
		global.appLoaderLog += '\tdatabase：' + database+'\n';
		var datadef = databases[dbname];
		if(datadef[dbname]){
			datadef.constants = datadef[dbname];
		}
		DatabaseModel[map_back(database)] = DatabaseModel(database, basepath, datadef);
	});
};

var avosInternalDataBase = ['user', 'cloudlog', 'file', 'followee', 'follower', 'installation', 'notification', 'role'];
var avosInternalDataBaseMap = {'cloudlog': 'cloud_log'};

function class_name(name){
	if(avosInternalDataBase.indexOf(name.toLowerCase()) == -1){
		return ucfirst(windows_style(name));
	} else{
		if(avosInternalDataBaseMap[name.toLowerCase()]){
			name = avosInternalDataBaseMap[name.toLowerCase()];
		}
		return '_' + ucfirst(windows_style(name));
	}
}

function map_back(name){
	return name.replace(/^_/, '');
}

function ucfirst(s){
	return s.replace(/^[a-z]/, function (a){
		return a.toUpperCase();
	});
}

function windows_style(name){
	return name.replace(/_[a-z]/g, function (v){
		return v.substr(1).toUpperCase();
	});
}
