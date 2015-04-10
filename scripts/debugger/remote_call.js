process.stdout.on('resize', function (){
	if(client){
		client.write('process.stdout.columns = ' + process.stdout.columns + ';');
	}
});
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
		client = global.debugClient = c;
		client.write('process.stdout.columns = ' + process.stdout.columns + ';');
		if(scriptQueue){
			runner(scriptQueue);
			scriptQueue = '';
		}
	});
	
	tcpserver.listen(0, function (){ //'listening' listener
		process.env.LEANG_DEBUG_PORT = tcpserver.address().port;
		console.log('debug port is ', process.env.LEANG_DEBUG_PORT);
		cb();
	});
}

function runner(code){
	if(!client){
		scriptQueue += code;
		return;
	}
	try{
		client.write(code.toString());
	} catch(e){
		console.error(e);
	}
}

module.exports.init = function (cb){
	createServer(cb);
	return {
		run: runner
	}
};
