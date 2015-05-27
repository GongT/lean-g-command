console.log('生成HTTP服务...');
var controllers = read_tree('cloud/controllers/');
source.push('AV.ExpressController.parse(' + JSON.stringify(controllers, null, 8) + ');');
	
