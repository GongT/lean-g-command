/**
 * @title: 生成配置文件（然后可以运行 avoscloud 命令）
 * @windowTitle: 生成配置文件
 */

installer.require('lean-g-loader').createServerConfig();
process.removeAllListeners('exit');
console.log('make complete!');
process.exit(0);
