var APPPATH = global.APPPATH;
var pkg = false;
var fs = require('fs');

/* settings json */
if(fs.existsSync(APPPATH + 'settings.json')){
	global.LeanParams = require(APPPATH + 'settings.json');
} else{
	global.LeanParams = {};
}
if(!LeanParams.deploy){
	LeanParams.deploy = [];
}

module.exports.set = function (name, value){
	LeanParams[name] = value;
};
module.exports.upload = function (data){
	if(typeof data === 'string'){
		data = {
			"src"     : [data + "/**"],
			"symlinks": [data]
		};
	}
	LeanParams.deploy.push(data);
};

/* package json */
if(fs.existsSync(APPPATH + 'package.proto.json')){
	pkg = fs.readFileSync(APPPATH + 'package.proto.json', 'utf-8');
	try{
		eval('pkg=' + pkg);
	} catch(e){
		console.error('无法解析package.proto.json:\n\n' + e.stack);
		process.exit(-1);
	}
	fs.writeFileSync(APPPATH + 'package.json', JSON.stringify(pkg, null, 8).replace(/^        /mg, '\t'));
	pkg = true;
}

if(fs.existsSync(APPPATH + 'package.json')){
	global.PackageJson = fs.readFileSync(APPPATH + 'package.json', 'utf-8');
	try{
		eval('PackageJson=' + PackageJson);
	} catch(e){
		console.error('无法解析package.json:\n\n' + e.stack);
		process.exit(-1);
	}
} else{
	global.PackageJson = {};
}

module.exports.commit = function (){
	fs.writeFileSync(APPPATH + '/.avoscloud/deploy.json', JSON.stringify(LeanParams, null, 8));
	if(pkg){
		fs.writeFileSync(APPPATH + 'package.json', JSON.stringify(PackageJson, null, 8).replace(/^        /mg, '\t'));
	}
};

module.exports.delete_package_json = function (){
	if(pkg && fs.existsSync(APPPATH + 'package.json')){
		fs.unlinkSync(APPPATH + 'package.json');
	}
};

module.exports.configure = function (config){
	config.package = PackageJson;
	config.lean = LeanParams;
};
