console.log('run npm install');
var p = require('child_process').spawn('npm',['install'],{stdio:"inherit"});
