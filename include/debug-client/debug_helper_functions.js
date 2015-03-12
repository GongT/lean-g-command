var functions = {};

functions.rs = function (){
	console.error('restarting server');
	process.graceful_exit(100);
};

functions.help = function (){
	var msg = '这里是一个完整的nodejs终端。\n';
	msg += '输入函数调用并回车可在代码环境中执行函数。';
	msg += '输入变量名可查看内容。';
	msg += '输入promise可查看其最终结果。\n\n';
	
	msg += '可用命令：\n';
	msg += '\trs - 重新生成并重启服务器\n';
	msg += '\texit - 退出，也可以通过按两次Ctrl+C实现\n';
	msg += '\tdebug [on|off|show] [level] - 退出，也可以通过按两次Ctrl+C实现\n';
	
	console.log(msg);
};

functions.exit = function (){
	process.stdout.write('/\ueeee\r退出调试…………');
	process.graceful_exit(0);
};

// ----- finish -----
for(var n in functions){
	functions[n] = {
		get       : functions[n],
		enumerable: false
	}
}
Object.defineProperties(global, functions);	
