if(!global.LeanParams.deploy){
	global.LeanParams.deploy = {};
}
global.LeanParams.deploy.unshift({"src": ["views/**"]});

global.write_package_json();
/*
 global.LeanParams.deploy.unshift({
 "src": [
 "node_modules/**",
 "!node_modules/avoscloud-code/**",
 "!node_modules/chokidar/**",
 "!node_modules/nested_dependence/**",
 "!node_modules/promise/**",
 "!node_modules/request/**"
 ]
 });
 */
