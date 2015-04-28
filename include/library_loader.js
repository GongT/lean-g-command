// var AV = Object.AV;
var console = new AV.Logger('LibraryLoader');

function Library(){
}

function assign_object_path(object, path, value){
	path = path.split(/\//);
	var name = path.pop();
	
	var itr = object;
	path.forEach(function (name){
		if(!itr[name]){
			itr[name] = {};
		}
		itr = itr[name];
	});
	return itr[name] = value;
}

function define_prototype(libraryObj, name, file){
	if(typeof file == 'string'){
		if(libraryObj[name]){
			console.warn('[LibraryLoader]重名覆盖：' + file);
			delete libraryObj[name];
		}
		Object.defineProperty(libraryObj, name, {
			get         : function (){
				delete libraryObj[name];
				var lib = require(file);
				lib.parent = this;
				return this[name] = lib;
			},
			enumerable  : true,
			configurable: true
		});
	} else{
		var self = libraryObj[name];
		var data = file;
		if(!self){
			self = {};
			Object.defineProperty(libraryObj, name, {
				value       : self,
				enumerable  : true,
				configurable: true
			});
		}
		
		Object.keys(data).forEach(function (iname){
			define_prototype(self, iname, data[iname]);
		});
	}
}

Library.prototype.load = function (name){
	if(name == 'load' || name == 'autoload'){
		throw new Error('[LibraryLoader]库文件的名字因被内部占用而无法使用，请换一个别的：' + name);
	}
	try{
		console.debug('load library %s', name);
		return assign_object_path(this, name, require("cloud/library/" + name + ".js"));
	} catch(e){
		console.error('[LibraryLoader]请求的库文件不存在：cloud/library/' + name + '.js');
		return undefined;
	}
};
Library.prototype.autoload = function (data){
	var self = this;
	for(var name in data){
		if(name == 'load' || name == 'autoload'){
			throw new Error('[LibraryLoader]库文件的名字因被内部占用而无法使用，请换一个别的：' + name);
		}
		(function (name, file){
			define_prototype(self, name, file);
		})(name, data[name]);
	}
};

module.exports = Library;
