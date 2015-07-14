/**
 * @title: 开启本地调试服务器，可以在本地浏览器里调试所有代码逻辑。
 * @windowTitle: 调试
 */

installer.require('lean-g-loader').createServerConfig();
installer.require('lean-g-debugger-client').createServer();
