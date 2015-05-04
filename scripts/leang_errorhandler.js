function exitHandler(options, err){
	if(global.preventExit){
		global.preventExit = false;
		return;
	}
	if(options.error){
		console.error('LEAN-G 底层捕获了异常: ');
		console.error(err.stack || err.message || err);
		process.exit(1);
	}
	if(options.cleanup){
		singleInstance.stop();
		deploySettings.delete_package_json();
	}
	if(options.exit){
		process.exit(err);
	}
}
exitHandler.exit = exitHandler.bind(null, {exit: true});
exitHandler.clean_exit = exitHandler.bind(null, {cleanup: true});

process.on('uncaughtException', exitHandler.bind(null, {error: true}));
process.on('exit', exitHandler.clean_exit);
process.on('SIGINT', exitHandler.exit);
setImmediate(function (){ // 初始化过程结束后，把清理环境监听器放到最后
	process.removeListener('exit', exitHandler.clean_exit);
	process.removeListener('SIGINT', exitHandler.exit);
	process.on('exit', exitHandler.clean_exit);
	process.on('SIGINT', exitHandler.exit);
});
