var fs = require('fs');

var deploySettings = global.deploySettings;

deploySettings.upload('views');

var local_dep = {src: []};
Object.keys(PackageJson.dependencies || {}).forEach(function (key){
	if(fs.existsSync('node_modules/' + key)){
		local_dep.src.push('node_modules/' + key + '/**');
	}
});

if(local_dep.src.length){
	deploySettings.upload(local_dep);
}
deploySettings.commit();
deploySettings.delete_package_json();
