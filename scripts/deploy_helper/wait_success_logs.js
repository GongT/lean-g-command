var avosrun = require('../avrun');

module.exports = function (){
	avosrun.external_stdout_eachline(['logs', '-t'], function (line){
		console.log('\x1B[2m%s', line);
	});
};
