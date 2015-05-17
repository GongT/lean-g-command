console.log('Lean-G: resolve dependence -> run npm install');

global.deploySettings.commit();


var p = require('../avrun.js').external('npm', ['install']);
