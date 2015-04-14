module.exports = function (params){
	var data = params.__get('data', null, 0);
	var keys = params.__get('keys', []);
	
	if(keys){
		var cdata = {};
		keys.forEach(function (key){
			cdata[key] = data[key];
		});
		return parse(data);
	} else{
		return parse(data);
	}
};

var valid = /([^\t\n\f \/>"'=]+)/;
function parse(data, pp){
	var str = '';
	Object.keys(data).forEach(function (key){
		if(!valid.test(key)){
			str += 'data-not-valid="' + key + '" ';
			return;
		}
		var prepend = pp? pp + '-' : '';
		var value = data[key];
		if(typeof value == 'object'){
			str += parse(value, prepend + key);
		} else if(typeof value == 'function'){
			str += 'data-' + prepend + key + '="{function}" '
		} else{
			str += 'data-' + prepend + key + '="' + value + '"';
		}
	});
	return str;
}
