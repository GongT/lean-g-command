// var AV = Object.AV;
var request = require('request');
var console = new AV.Logger('云代码RPC');

function ServerCloud(config){
	if(typeof config === 'string'){
		if(!AV.CONFIG.servers || !AV.CONFIG.servers[config]){
			throw new Error('No such server in config: ' + config);
		}
		config = AV.CONFIG.servers[config];
	}
	this.config = config;
}

module.exports = ServerCloud;

ServerCloud.prototype.run = function (name, data){
	var config = this.config;
	data.source = AV.CONFIG.AppSource;
	console.debug('请求云代码 %s 在 %s', config.url + name, config.name || config.id);
	
	return AV.Cloud.httpRequest({
		url    : config.url + name,
		method : "POST",
		headers: {
			'X-AVOSCloud-Application-Id' : config.id,
			'X-AVOSCloud-Application-Key': config.key,
			'Content-Type'               : 'application/json'
		},
		json   : true,
		body   : new Buffer(JSON.stringify(data))
	}).then(function (body){
		if(body.data.code){
			return AV.Promise.error(AV.E.E_SERVER.attach(body.data));
		}
		if(!body.data.result.hasOwnProperty('status')){
			return AV.Promise.error(AV.E.E_SERVER.attach('empty response'));
		}
		if(body.data.result.status != 0){
			return AV.Promise.error(body.data.result);
		}
		return body.data.result;
	}, function (response){
		return response.text;
	});
};
