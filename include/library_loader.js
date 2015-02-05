var AV = Object.AV;

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
		var self = {}, data = file;
		Object.defineProperty(prototype, name, {
			value       : self,
			enumerable  : true,
			configurable: true
		});
		
		for(name in data){
			if(self[name]){
				continue;
			}
			(function (name, file){
				define_prototype(self, name, file);
			})(name, data[name]);
		}
	}
}

Library.prototype.load = function (name){
	assign_object_path(this, name, require(AV.CloudCodeRoot + "library/" + name + ".js"));
};
Library.prototype.autoload = function (data){
	this.autoload = function (){
		throw new Error('do not call auto twice');
	};
	for(var name in data){
		if(this[name]){
			continue;
		}
		(function (name, file){
			define_prototype(Library.prototype, name, file);
		})(name, data[name]);
	}
};

module.exports = new Library;
