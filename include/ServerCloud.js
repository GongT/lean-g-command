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

ServerCloud.prototype.run = function (name, data, options){
	var config = this.config;
	data = JSON.stringify(data);
	console.debug('请求云代码 %s 在 %s\n\n', name, config.name || config.id);
	var promise = new AV.Promise;
	AV.Cloud.httpRequest({
		url    : config.url + name,
		method : "POST",
		headers: {
			'X-AVOSCloud-Application-Id' : config.id,
			'X-AVOSCloud-Application-Key': config.key,
			'Content-Type'               : 'application/json'
		},
		json   : true,
		body   : data
	}, function (err, res, body){
		if(err){
			if(options.error){
				options.error(err);
				promise.reject(err);
			}
			return;
		}
		if(res.statusCode == 200){
			body = body.result;
			if('status' in body && body.status == 0){
				if(options.success){
					options.success(body);
					promise.resolve(body);
				}
			} else if(options.error){
				options.error(body);
				promise.reject(body);
			}
		} else{
			if(options.error){
				options.error(body);
				promise.reject(body);
			}
		}
	});
	return promise;
};
