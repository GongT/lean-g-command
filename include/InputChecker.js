var console = new AV.Logger('INPUT');
var debug = console[AV.localhost? 'error' : 'debug'].bind(console);
var warn = console[AV.localhost? 'warn' : 'debug'].bind(console);

var hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = Checker;
var checker_types = {};

function Checker(params){
	this[this._pname] = params;
}
Checker.prototype._pname = 'params';

Checker.prototype.raw = function (){
	return this[this._pname];
};
Checker.prototype.get = function (name, opt){
	return hasOwnProperty.call(this[this._pname], name)? this[this._pname][name] : opt;
};
Checker.prototype.has = function (name){
	return this[this._pname].hasOwnProperty(name);
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
			debug('必选 参数 %s 缺少', name);
			throw new InputCheckFailError(name, 'require' + uctype, '{not-set}');
		}
		var ret = checker.call(this, data);
		if(ret === undefined){
			debug('必选 参数 %s 的类型、内容错误（需要 %s）实际是 %s', name, uctype, data);
			throw new InputCheckFailError(name, 'require' + uctype, data);
		}
		return ret;
	};
	Checker.prototype['requireNullable' + uctype] = function (name){
		if(!this.has(name, undefined)){
			debug('必选可空 参数 %s 没有传入', name);
			throw new InputCheckFailError(name, 'requireNullable' + uctype, '{not-set}');
		}
		var data = this.get(name, undefined);
		if(data === null || data === undefined || data === ''){
			return data;
		}
		var ret = checker.call(this, data);
		if(ret === undefined){
			debug('必选可空 参数 %s 的类型、内容错误（需要 %s）实际是 %s', name, uctype, data);
			throw new InputCheckFailError(name, 'requireNullable' + uctype, data);
		}
		return ret;
	};
	Checker.prototype['require' + uctype + 'Array'] = function (name){
		var data = this.get(name, undefined);
		if(data === undefined){
			debug('必选数组 参数 %s 缺少', name);
			throw new InputCheckFailError(name, 'require' + uctype + 'Array', '{not-set}');
		}
		if(!Array.isArray(data)){
			data = this[this._pname][name] = [data];
		}
		return data.map(function (v, i){
			var ret = checker.call(this, v);
			if(ret === undefined){
				debug('必选数组 参数 %s 的第 %s 项类型、内容错误（需要 %s）实际是 %s', name, i, uctype, v);
				throw new InputCheckFailError(name, 'require' + uctype + 'Array', [i, v]);
			}
			return ret;
		}, this);
	};
	Checker.prototype['optional' + uctype] = function (name, opt){
		var data = this.get(name, opt);
		if(data === opt){
			warn('可选参数 参数 %s 缺少，使用了默认值', name);
			return data;
		}
		var ret = checker.call(this, data, opt);
		if(ret === undefined){
			debug('可选参数 参数 %s 的类型、内容错误（需要 %s）实际是 %s', name, uctype, data);
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
			warn('可选数组 参数 %s 缺少，使用了默认值', name);
			return opt;
		}
		return data.map(function (v, i){
			var ret = checker.call(this, v, opt);
			if(ret === undefined){
				debug('必选数组 参数 %s 的第 %s 项类型、内容错误（需要 %s）实际是 %s', name, i, uctype, v);
				throw new InputCheckFailError(name, 'optional' + uctype + 'Array', [i, v]);
			}
			return ret;
		}, this);
	};
}
