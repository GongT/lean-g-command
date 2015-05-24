AV.FS.read_cloud_source_each('middlewares/', function (module, abs, rel){
	var middleware = require(rel);
	if(middleware.path){
		global.appLoaderLog += 'middleware ' + module + ' loaded on uri ' + middleware.path + '\n';
		AV.server.use(middleware.path, middleware);
	} else{
		global.appLoaderLog += 'middleware ' + module + ' loaded on /\n';
		AV.server.use(middleware);
	}
});
