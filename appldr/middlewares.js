module.exports = function (AV, log){
	if(fs.existsSync(AV.ABS_ROOT + AV.CLOUDROOT + 'middlewares')){
		fs.readdirSync(AV.ABS_ROOT + AV.CLOUDROOT + 'middlewares').filter(function (f){
			return !/^\./.test(f) && /\.js/.test(f);
		}).forEach(function (f){
			var middleware = require(AV.CLOUDROOT + '/middlewares/' + f);
			if(middleware.path){
				log('middleware ' + f + ' loaded in path ' + middleware.path);
				AV.server.use(middleware.path, middleware);
			} else{
				log('middleware ' + f + ' loaded');
				AV.server.use(middleware);
			}
		});
	}
};
