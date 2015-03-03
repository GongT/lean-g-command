var nsmarty = require('nsmarty');
// var AV = Object.AV;
var phpjs = AV.phpjs = nsmarty.Parser._phpjs = require('phpjs');

module.exports = function (params){
	var fn = params.__get(false, null, 0);
	var args = [];
	for(var i = 1; params.hasOwnProperty(i); i++){
		args.push(params[i]);
	}
	// console.log('call %s(%s)', fn, args);
	return phpjs[fn].apply(phpjs, args);
};
