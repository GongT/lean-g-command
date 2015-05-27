AV.ExpressController.getRawBody = function (){
	var req = this.__req;
	return new AV.Promise(function (resolve, reject){
		var data = '';
		req.setEncoding('utf8');
		req.on('data', function (chunk){
			data += chunk;
		});
		req.on('end', function (){
			resolve(data);
		});
		req.on('error', function (e){
			reject(e);
		});
	});
};
