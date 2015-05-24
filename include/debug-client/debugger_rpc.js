module.exports = function script_runner(port){
	var sock = global.debugServer = require('net').connect(port);
	require('../../scripts/rpcvm')(sock);
};
