"use strict";

var functions = {};

functions.help = function (){
	var msg = '这里是一个完整的nodejs终端。\n';
	msg += '输入函数调用并回车可在代码环境中执行函数。';
	msg += '输入变量名可查看内容。';
	msg += '输入promise可查看其最终结果。\n\n';
	
	msg += '可用命令：\n';
	msg += '\trs - 重新生成并重启服务器\n';
	msg += '\texit - 退出，也可以通过按两次Ctrl+C实现\n';
	msg += '\tinspect - 生成最新的代码提示文件\n';
	msg += '\tdebug level/text level_or_message on/off - 还没写好\n';
	msg += '\tdebug grep `regexp`/off - 还没写好\n';
	
	console.log(msg);
};

functions.rs = function (){
	debug_shutdown(100);
};

functions.exit = function (){
	debug_shutdown(0);
};
functions.inspect = function (){
	AV.Cloud.run('__create_inspect', {}, {
		success : function (){
			console.log('\r生成成功！！！');
			repl.displayPrompt();
		}, error: function (){
			console.log('\r生成失败。。。。');
			repl.displayPrompt();
		}
	})
};

// ----- finish -----
for(var n in functions){
	functions[n] = {
		get       : functions[n],
		enumerable: false
	}
}
Object.defineProperties(global, functions);	
