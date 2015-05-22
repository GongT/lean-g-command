var replacer = require(AV.GROOT + 'include/view_function_public/default_template.js');

module.exports = function (params, data){
	// var name = params.__get('name', false, 0);
	return replacer.getSingleInstance(data);
};
