/**
 * @title: 生成配置文件（然后可以运行 avoscloud 命令）
 * @windowTitle: 生成配置文件
 */

var confirm_module = require('../lib/npm_installer').confirm;
console.assert(confirm_module('lean-g-template-nsmarty', LEAN_G_INSTALL_FROM + 'lean-g-template-nsmarty.git'),
		'安装失败，请尝试手动安装');
console.assert(confirm_module('lean-g-debugger-client', LEAN_G_INSTALL_FROM + 'lean-g-debugger-client.git'),
		'安装失败，请尝试手动安装');
console.assert(confirm_module('lean-g-loader', LEAN_G_INSTALL_FROM + 'lean-g-loader.git'),
		'安装失败，请尝试手动安装');

require('lean-g-loader').createServerConfig();
process.removeAllListeners('exit');
console.log('make complete!');
process.exit(0);
