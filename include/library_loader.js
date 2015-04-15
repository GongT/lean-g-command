// var AV = Object.AV;

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

function define_prototype(prototype, name, file){
	if(typeof file == 'string'){
		if(prototype.hasOwnProperty(name)){
			console.error('[LibraryLoader]重名覆盖：' + file);
			delete prototype[name];
		}
		Object.defineProperty(prototype, name, {
			get         : function (){
				delete prototype[name];
				var lib = require(file);
				lib.parent = this;
				return this[name] = lib;
			},
			enumerable  : true,
			configurable: true
		});
	} else{
		var self = prototype[name];
		var data = file;
		if(!self){
			self = {};
			Object.defineProperty(prototype, name, {
				value       : self,
				enumerable  : true,
				configurable: true
			});
		}
		
		for(name in data){
			(function (name, file){
				define_prototype(self, name, file);
			})(name, data[name]);
		}
	}
}

Library.prototype.load = function (name){
	if(name == 'load' || name == 'autoload'){
		throw new Error('[LibraryLoader]库文件的名字因被内部占用而无法使用，请换一个别的：' + name);
	}
	try{
		return assign_object_path(this, name, require("cloud/library/" + name + ".js"));
	} catch(e){
		console.error('[LibraryLoader]请求的库文件不存在：cloud/library/' + name + '.js');
		return undefined;
	}
};
Library.prototype.autoload = function (data){
	console.log(data)
	for(var name in data){
		if(name == 'load' || name == 'autoload'){
			throw new Error('[LibraryLoader]库文件的名字因被内部占用而无法使用，请换一个别的：' + name);
		}
		(function (name, file){
			define_prototype(Library.prototype, name, file);
		})(name, data[name]);
	}
};

module.exports = Library;
