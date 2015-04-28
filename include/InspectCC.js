var cc = new AV.CloudCodeWrapper(module);
var fs = require('fs');
var path = require('path');

var console = new AV.Logger('InspectCC');

cc.process(function (){
	var script = '', dup = {'AV': AV};
	
	dump('AV', AV);
	
	function dump(pp, data, sub){
		if(typeof data != 'object' && typeof data != 'function'){
			console.error('dump: %s not an object or function', typeof data);
			return;
		}
		for(var name in data){
			var vname = pp + '.' + name;
			if(parseInt(name).toString() == name){
				vname = pp + '[' + name + ']';
			}
			if(/[\-\s\/\\]/.test(name)){
				vname = pp + '[' + JSON.stringify(name) + ']';
			}
			if(isSkip(vname)){
				script += '// ' + vname + ' -> skip\n';
				continue;
			}
			
			try{
				if(!data.hasOwnProperty(name)){
					continue;
				}
				var obj = data[name];
			} catch(e){
				console.error('dump (%s in data) error: ', vname, e);
			}
			
			if(typeof obj == 'function' || typeof obj == 'object'){
				var k = search(obj, dup);
				if(k){
					append(vname, k);
					continue;
				}
			}
			
			dup[vname] = obj;
			
			if(typeof obj == 'function'){
				if(!sub){
					script += '\n/* 函数或类 */\n';
				}
				append(vname, obj.toString().trim().split('{', 1) + '{}');
				if(!sub){
					script += '/* 静态成员 */\n';
				}
				dump(vname, obj, true);
				if(obj.prototype){
					if(!sub){
						script += '/* 类成员 */\n';
					}
					dump(vname + '.prototype', obj.prototype, true);
				}
				if(!sub){
					script += '/* 函数或类结束 */\n\n';
				}
			} else if(typeof obj == 'object'){
				if(!sub){
					script += '\n/* 对象定义 */\n';
				}
				append(vname, '{}');
				dump(vname, obj, true);
				if(!sub){
					script += '/* 对象定义结束 */\n\n';
				}
			} else{
				append(vname, JSON.stringify(obj), false);
				if(sub){
					script += '\n';
				} else{
					script += ' // 静态变量\n';
				}
			}
		}
	}
	
	function append(varname, value, br){
		// console.warn(varname + ' = xxx;');
		script += varname + ' = ' + value + ';' + (br === false? '' : '\n');
	}
	
	var f = path.resolve('cloud/__gen/inspect.js');
	fs.writeFileSync(f, script.trim());
	console.log('dump inspect file to cloud/__gen/inspect.js');
	return f;
});

function search(obj, arr){
	for(var n in arr){
		if(obj === arr[n]){
			return n;
		}
	}
}

var skipNames = [
	'AV.require',
	'AV.E',
	'AV.CLS',
	'AV.Logger',
	'AV.lib',
	'AV.Timer',
	'AV.site_url',
	'AV.lib.inputChecker',
	'AV.CloudCodeWrapper',
	'AV.Object._classMap',
	'AV.express.mime',
	'AV.express.static',
	'AV.Role._classMap',
	'AV.User._classMap',
	'AV.Installation._classMap',
	'AV.express.request',
	'AV.ExpressController.map'
];
function isSkip(vname){
	if(/^AV\.Cloud\..*\.setTitle/.test(vname)){
		return true;
	}
	if(skipNames.indexOf(vname) >= 0){
		return true;
	}
}
