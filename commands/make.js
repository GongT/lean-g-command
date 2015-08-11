/**
 * @title: 生成配置文件（然后可以运行 avoscloud 命令）
 * @windowTitle: 生成配置文件
 */

installer.require('lean-g-loader').createServerConfig();

var fs = require('fs');
var s = fs.readFileSync(APP_PATH + 'server.js', 'utf-8');
fs.writeFileSync(APP_PATH + 'server.js',
		'process.env.LC_APP_ID="' + APP_CONFIG.applicationId + '"\n' +
		'process.env.LC_APP_KEY="' + APP_CONFIG.applicationKey + '"\n' +
		'process.env.LC_APP_MASTER_KEY="' + APP_CONFIG.masterKey + '"\n' +
		'process.env.LC_APP_PORT="' + APP_CONFIG.lean.debug + '"\n' +
		'process.env.LEANG_FAKE_SERVER="yes"\n' +
		'\n' + s);

process.removeAllListeners('exit');
console.log('make complete!');
process.exit(0);
