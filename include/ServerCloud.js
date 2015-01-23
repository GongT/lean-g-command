var AV = Object.AV;
var config = AV.CONFIG.dataApplication;
var request = require('request');

module.exports.run = function (name, data, options){
	data = JSON.stringify(data);
	if(AV.localhost){
		console.log('O: 请求云代码 %s 在 %s\n\n', name, config.applicationName)
	}
	return request.post({
		url    : config.cloudUrl + name,
		headers: {
			'X-AVOSCloud-Application-Id' : config.applicationId,
			'X-AVOSCloud-Application-Key': config.applicationKey
		},
		json   : true,
		body   : data
	}, function (err, res, body){
		if(err){
			if(options.error){
				options.error(err);
			}
			return;
		}
		if(res.statusCode == 200){
			body = body.result;
			if('status' in body && body.status == 0){
				if(options.success){
					options.success(body);
				}
			} else if(options.error){
				options.error(body);
			}
		} else{
			if(options.error){
				options.error(body);
			}
		}
	});
};
