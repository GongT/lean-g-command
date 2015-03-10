console.log('Lean-G: resolve dependence -> run npm install');
var p = require('./avrun.js').spawn('npm', ['install'], {stdio: "inherit"});
