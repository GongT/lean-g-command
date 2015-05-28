/**
 * @title: 开启本地调试服务器，可以在本地浏览器里调试所有代码逻辑。
 * @windowTitle: 调试
 */
var confirm_module = require('../lib/npm_installer').confirm;
console.assert(confirm_module('leanengine-template-nsmarty', LEAN_G_INSTALL_FROM + 'leanengine-template-nsmarty.git'),
		'安装失败，请尝试手动安装');
console.assert(confirm_module('lean-g-debugger-client', LEAN_G_INSTALL_FROM + 'lean-g-debugger-client.git'),
		'安装失败，请尝试手动安装');
console.assert(confirm_module('lean-g-loader', LEAN_G_INSTALL_FROM + 'lean-g-loader.git'),
		'安装失败，请尝试手动安装');

require('lean-g-loader').createServerConfig();
require('lean-g-debugger-client').createServer();
