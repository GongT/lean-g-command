var uglify = require('../../include/view_function_public/uglify');

var replacer = function (template, data){
	var n;
	var _c = {};
	while(n = /\[([a-z\._]*)(.*?)\]/ig.exec(template)){
		var r1 = n[0];
		var result = _c[r1];
		if(result === undefined){
			var name = n[1];
			var config = n[2].trim();
			result = data_path(name);
			if(config){
				if(config[0] == '='){
					var eqiif = config.split(/\?/, 2);
					if(result == eqiif[0].substr(1)){
						result = eval('true?' + eqiif[1]);
					} else{
						result = eval('false?' + eqiif[1]);
					}
				} else if(config[0] == '?'){
					if(result){
						result = eval('true' + config);
					} else{
						result = eval('false' + config);
					}
				} else if(config.substr(0, 2) == '||'){
					result = eval('result' + config);
				} else{
					console.error('Unknown replace config %s in %s', config, r1);
				}
			} else if(typeof result === 'undefined'){
				result = 'undefined';
			} else if(typeof result === 'number'){
				result = result.toString();
			}
		}
		template = template.replace(r1, result);
	}
	return template;
	
	function data_path(name){
		var itr = data;
		name = name.split('.');
		name.every(function (name){
			return itr = itr[name];
		});
		return itr;
	}
}.toString();

if(!AV.isDebugEnv){
	replacer = uglify(replacer);
}

module.exports.getSingleInstance = function (data, name){
	if(!name){
		name = 'TPL_REPLACE_FUNCTION';
	}
	if(data.__replacer_loaded){
		if(name == data.__replacer_loaded){
			return '';
		} else{
			return '<script type="text/javascript" title="TPL_REPLACE_FUNCTION">var ' + name + '= ' +
			       data.__replacer_loaded + ';</script>';
		}
	}
	data.__replacer_loaded = name;
	return '<script type="text/javascript" title="TPL_REPLACE_FUNCTION">\n' +
	       replacer.replace('function', 'function ' + name) + '\n</script>\n';
};
module.exports.getInstance = function (data){
	return data.__replacer_loaded || 'alert("replacer.getSingleInstance not been called");';
};
