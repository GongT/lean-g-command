// var AV = Object.AV;

module.exports = Checker;
var checker_types = {};

function Checker(params){
	this[this._pname] = params;
}
Checker.prototype._pname = 'params';

Checker.prototype.get = function (name, opt){
	return this[this._pname].hasOwnProperty(name)? this[this._pname][name] : opt;
};

Checker.InputCheckFailError = InputCheckFailError;
function InputCheckFailError(field, type, gotten){
	this._data = {field: field, type: type, gotten: gotten};
}
InputCheckFailError.prototype = AV.E.E_INPUT_INVALID;

Checker.register = registType;

function registType(type, checker){
	checker_types[type] = checker;
	var uctype = type.replace(/^./, function (m){
		return m.toUpperCase();
	});

	Checker.prototype['require' + uctype] = function (name){
		var data = this.get(name, undefined);
		if(data === undefined){
			throw new InputCheckFailError(name, 'require' + uctype, '{not-set}');
		}
		var ret = checker.call(this, data);
		if(ret === undefined){
			throw new InputCheckFailError(name, 'require' + uctype, data);
		}
		return ret;
	};
	Checker.prototype['requireNullable' + uctype] = function (name){
		var data = this.get(name, undefined);
		if(data === undefined){
			throw new InputCheckFailError(name, 'requireNullable' + uctype, '{not-set}');
		}
		if(data === null){
			return data;
		}
		var ret = checker.call(this, data);
		if(ret === undefined){
			throw new InputCheckFailError(name, 'requireNullable' + uctype, data);
		}
		return ret;
	};
	Checker.prototype['require' + uctype + 'Array'] = function (name){
		var data = this.get(name, undefined);
		if(data === undefined){
			throw new InputCheckFailError(name, 'require' + uctype + 'Array', '{not-set}');
		}
		if(!Array.isArray(data)){
			data = this[this._pname][name] = [data];
		}
		return data.map(function (v, i){
			var ret = checker.call(this, v);
			if(ret === undefined){
				throw new InputCheckFailError(name, 'require' + uctype + 'Array', [i, v]);
			}
			return ret;
		}, this);
	};
	Checker.prototype['optional' + uctype] = function (name, opt){
		var data = this.get(name, opt);
		if(data === opt){
			return data;
		}
		var ret = checker.call(this, data, opt);
		if(ret === undefined){
			throw new InputCheckFailError(name, 'optional' + uctype, this[this._pname][name])
		}
		return ret;
	};
	Checker.prototype['optional' + uctype + 'Array'] = function (name, opt){
		var data = this.get(name, []);
		if(!Array.isArray(data)){
			data = this[this._pname][name] = [data];
		}
		if(!data.length){
			return opt;
		}
		return data.map(function (v, i){
			var ret = checker.call(this, v, opt);
			if(ret === undefined){
				throw new InputCheckFailError(name, 'optional' + uctype + 'Array', [i, v]);
			}
			return ret;
		}, this);
	};
}
