process.stdout.on('resize', function (){
	remote_call('process.stdout.columns = ' + process.stdout.columns + ';');
});
var DEBUG_PORT = 3099;
var tcpserver, client;
var scriptQueue = '';

function createServer(cb){
	if(tcpserver){
		return cb();
	}
	tcpserver = require('net').createServer(function (c){
		if(client){
			console.error('replace current client');
			client.close();
			client.destroy();
		}
		// console.log('client connected');
		c.on('end', function (){
			// console.log('client disconnected');
			c.destroy();
		});
		require('../rpcvm')(c);
		client = c;
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
