/* 触发器 */
var triggers = {};
AV.FS.read_cloud_source_foreach('database',function (dbname){
	var base = APP_PATH + 'cloud/database/' + f + '/';
	var basepath = 'cloud/database/' + f + '/';
	if(!fs.existsSync(base) || !fs.lstatSync(base).isDirectory() || f.indexOf('_') == 0){
		return;
	}
	var database = class_name(basename(f));
	var datadef = read_module_folder(basepath, ['trigger']).trigger;
	if(!datadef){
		return;
	}
	var result = {};
	var map = {
		afterSave  : 'post-insert',
		afterUpdate: 'post-update',
		beforeSave : 'before-insert'
	};
	for(var fn in map){
		var dn = map[fn];
		if(datadef[dn]){
			result[fn] = datadef[dn];
			delete datadef[dn];
		}
	}
	if(Object.keys(datadef).length){
		console.error('未知触发器类型：', Object.keys(datadef).join(''));
		console.log(map);
		throw new Error('未知触发器类型：', Object.keys(datadef).join(''));
	}
	
	if(Object.keys(result).join('')){
		console.log('\t触发器：%s -- %s', database, Object.keys(result).join(','));
		source.push('AV.CLS.' + map_back(database) + '.registerTrigger(' + JSON.stringify(result, null, 8) + ');');
	}
});

if(fs.existsSync(APP_PATH + 'cloud/timers')){
	/* 定时器 */
	source.push('AV.Timer = {};');
	fs.readdirSync(APP_PATH + 'cloud/timers').filter(isJsFile).forEach(function (f){
		console.log('\t定时器：' + basename(f, '.js'));
		source.push('AV.Cloud.define("' + basename(f, '.js') + '", AV.Timer.' + basename(f, '.js') +
		            ' = require("cloud/timers/' + f + '"));');
	});
}
	
