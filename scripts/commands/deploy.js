/**
 * @title: 部署当前代码到测试和发布环境
 */
var avosrun = require('../avrun.js');
var fs = require('fs');

/*
 var PackageJson = global.PackageJson;
 if(!PackageJson.leancloud){
 PackageJson.leancloud = {};
 }
 if(!PackageJson.leancloud.deploy){
 PackageJson.leancloud.deploy = [];
 }

 var local_dep = {src: []};
 Object.keys(PackageJson.dependencies || {}).forEach(function (key){
 if(fs.existsSync('node_modules/' + key)){
 local_dep.src.push('node_modules/' + key + '/**');
 delete PackageJson.dependencies[key];
 }
 });
 if(local_dep.src.length){
 PackageJson.leancloud.deploy.push(local_dep);
 }
 global.write_package_json();
 */

avosrun('app').then(function (){
	return avosrun('deploy');
}).then(function (){
	return avosrun('publish');
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
