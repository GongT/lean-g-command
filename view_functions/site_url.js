// var AV = Object.AV;
module.exports.modifier = AV.site_url;
module.exports['function'] = function (params){
	return AV.site_url(params.__get(null, null, 0));
};
module.exports.type = 'modifier';
