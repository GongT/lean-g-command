var fs = require('fs');

var args = process.argv.slice();
var cmdfile = CGROOT + 'scripts/commands/' + args[3] + '.js';

if(fs.existsSync(cmdfile)){
	var cfgfile = APPPATH + 'config/' + args[2] + '.json';
	
	if(fs.existsSync(cfgfile)){
		if(!fs.existsSync(APPPATH + 'config/environment')){
			fs.mkdirSync(APPPATH + 'config/environment');
		}
		if(!fs.existsSync(APPPATH + 'config/server')){
			fs.mkdirSync(APPPATH + 'config/server');
		}
		fs.readdirSync(APPPATH + 'config').forEach(function (f){
			if(/^\./.test(f)){
				return;
			}
			if(!/\.json$/.test(f)){
				return;
			}
			if(f == 'global.json'){
				return;
			}
			var source = APPPATH + 'config/' + f;
			var dist_ser = APPPATH + 'config/server/' + f;
			var dist_env = APPPATH + 'config/environment/' + f;
			
			var CONFIG = JSON.parse(fs.readFileSync(source, 'utf8'));
			
			var sConfig = {
				serverName    : CONFIG.applicationName,
				applicationId : CONFIG.applicationId,
				applicationKey: CONFIG.applicationKey,
				masterKey     : CONFIG.masterKey,
			};
			CONFIG.environmentName = CONFIG.applicationName;
			
			delete CONFIG.applicationName;
			delete CONFIG.applicationId;
			delete CONFIG.applicationKey;
			delete CONFIG.masterKey;
			
			fs.writeFileSync(dist_env, JSON.stringify(CONFIG, null, 8));
			fs.writeFileSync(dist_ser, JSON.stringify(sConfig, null, 8));
		});
	} else{
		console.log('no file %s', cfgfile);
	}
	
	setTimeout(function (){
		console.log('===================================\n' +
		            '\x1B[38;5;10mLEAN-G 更新了，请使用新方法调用\x1B[0m' +
		            '\n===================================');
	}, 5000);
	
	process.argv[3] = args[2];
	process.argv[4] = args[2];
	process.argv[2] = args[3];
}

