var cc = new AV.CloudCodeWrapper(module);
var fs = require('fs');
var path = require('path');

var console = new AV.Logger('TEST');

cc.process(function (){
	var script = '', dup = {'AV': AV};
	
	dump('AV', AV);
	
	function dump(pp, data, sub){
		if(typeof data != 'object' && typeof data != 'function'){
			console.error('dump: %s not an object or function', typeof data);
			return;
		}
		for(var name in data){
			try{
				if(!data.hasOwnProperty(name)){
					continue;
				}
				var obj = data[name];
			} catch(e){
				console.error(e);
				console.log(name);
			}
			
			var vname = pp + '.' + name;
			if(parseInt(name).toString() == name){
				vname = pp + '[' + name + ']';
			}
			
			if([
				   'AV.require',
				   'AV.E',
				   'AV.CLS',
				   'AV.library',
				   'AV.Logger',
				   'AV.lib',
				   'AV.Timer',
				   'AV.lib.inputChecker',
				   'AV.CloudCodeWrapper',
				   'AV.Object._classMap',
				   'AV.express.mime',
				   'AV.express.static'
			   ].indexOf(vname) >= 0){
				continue;
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
		console.warn(varname + ' = xxx;');
		script += varname + ' = ' + value + ';' + (br === false? '' : '\n');
	}
	
	var f = path.resolve('cloud/__gen/inspect.js');
	fs.writeFileSync(f, script.trim());
	return f;
});

function search(obj, arr){
	for(var n in arr){
		if(obj === arr[n]){
			return n;
		}
	}
}
