console.log('Lean-G: resolve dependence -> run npm install');
var p = require('child_process').spawn('npm', ['install'], {stdio: "inherit"});
