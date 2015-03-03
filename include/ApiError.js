var extend = require('util')._extend;

var ApiError = function (){
	this._data = undefined;
	this._extend = undefined;
	Error.apply(this, arguments);
};
ApiError.prototype = {};
for(var x in Error.prototype){
	ApiError.prototype[x] = Error.prototype[x];
}

ApiError.prototype.toJSON = function (){
	return extend({status: this.code, message: this.message, data: this._data}, this._extend);
};
ApiError.prototype.toStrongJSON = function (){
	return JSON.parse(this.stringify());
};
ApiError.prototype.response = function (resp){ // 主动调用，和throw的区别是 这个HTTP 200
	resp.send(this.toStrongJSON());
	resp.end();
};
ApiError.prototype.toString = function (){ // 在被throw的时候会被调用
	return '[ApiError ' + this.name + ']'; // 返回给客户端（不能避免HTTP 500）
};

ApiError.prototype.stringify = function (){
	return JSON.stringify(this.toJSON(), function (k, v){
		if(v === undefined){
			return null;
		}
		return v;
	});
};

ApiError.prototype.data = function (data){
	var ne = new ApiError;
	ne.name = this.name;
	ne.code = this.code;
	ne.message = this.message;
	ne._data = data;
	ne._extend = this._extend;
	return ne;
};
ApiError.prototype.attach = function (data){
	var ne = new ApiError;
	ne.name = this.name;
	ne.code = this.code;
	ne.message = this.message;
	ne._data = this.data;
	ne._extend = data;
	return ne;
};

module.exports = ApiError;
module.exports.create = function (code, name, message){
	var ne = new ApiError;
	ne.name = name;
	ne.code = code;
	ne.message = message;
	return ne;
};
