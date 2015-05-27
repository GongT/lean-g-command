AV.FS.read_cloud_source_foreach('middlewares/', function (module, abs, rel,req){
	var middleware = require(req);
	if(middleware.path){
		global.appLoaderLog += 'middleware ' + module + ' loaded on uri ' + middleware.path + '\n';
		AV.server.use(middleware.path, middleware);
	} else{
		global.appLoaderLog += 'middleware ' + module + ' loaded on /\n';
		AV.server.use(middleware);
	}
});
