module.exports.modifier = Object.AV.site_url;
module.exports['function'] = function (params){
	return Object.AV.site_url(params.__get(null, null, 0));
};
module.exports.type = 'modifier';
