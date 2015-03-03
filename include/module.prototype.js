var extend = require('util')._extend;
// var AV = Object.AV;

function DatabaseModel(name, basepath, config){
	var cls = bindAll(name, config['static'] || {}, DatabaseModel._prototype.static);
	var prop = bindAll(name, config['property'] || {}, DatabaseModel._prototype.property);
	
	if(config.constants){
		extend(cls, require(config.constants));
	}
	cls.load = function (path){
		return require(basepath + path + '.js');
	};
	
	var mdl = AV.Object.extend(name, prop, cls);
	mdl.className = name;
	
	for(var n in cls){
		if(mdl.hasOwnProperty(n) && typeof mdl[n] === 'function'){
			mdl[n] = mdl[n].bind(mdl);
		}
	}
	
	mdl.prototype.class = mdl;
	return mdl;
}

module.exports = DatabaseModel;
DatabaseModel._prototype = {
	extend   : function (udef){
		for(var n in udef){
			extend(DatabaseModel._prototype[n], udef[n]);
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
		file = data[fname];
		func = require(file);
		result[fname] = func;
	}
	for(fname in _pt){
		file = _pt[fname];
		if(!result.hasOwnProperty(fname)){
			if(typeof file === 'function'){
				func = file;
			} else{
				func = require(file);
			}
			result[fname] = func;
		}
	}
	return result;
}

