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
		body   : data
	}).then(function (body){
		return body.data.result;
	});
};
