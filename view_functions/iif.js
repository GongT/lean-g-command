module.exports = function (param){
	var b = param.__get('condition', null, 0);
	var th = param.__get('then', '', 1);
	var el = param.__get('else', '', 2);
	return b? th : el;
};
