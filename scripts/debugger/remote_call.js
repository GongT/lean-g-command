process.stdout.on('resize', function (){
	if(client){
		client.write('process.stdout.columns = ' + process.stdout.columns + ';');
	}
});
var DEBUG_PORT = 3099;
var tcpserver, client;
var scriptQueue = '';
var console = new LogPrepend('远程过程调用');

function createServer(cb){
	if(tcpserver){
		return cb();
	}
	tcpserver = require('net').createServer(function (c){
		if(client){
			console.log('replace current client');
			client.destroy();
		}
		console.debug('client connected');
		c.on('end', function (){
			console.debug('client disconnected');
			c.destroy();
		});
		require('../rpcvm')(c);
		client = c;
		client.write('process.stdout.columns = ' + process.stdout.columns + ';');
		if(scriptQueue){
			runner(scriptQueue);
			scriptQueue = '';
		}
	});
	tcpserver.listen(DEBUG_PORT, function (){ //'listening' listener
		cb();
	});
}

function runner(code){
	if(!client){
		scriptQueue += code;
		return;
	}
	client.write(code.toString());
}

module.exports.init = function (cb){
	process.env.LEANG_DEBUG_PORT = DEBUG_PORT;
	createServer(cb);
	return {
		run: runner
	}
};
