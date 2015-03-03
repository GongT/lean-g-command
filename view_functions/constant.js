// var AV = Object.AV;
var CONSTANTS = AV.CONSTANTS;

module.exports = function (params){
	return CONSTANTS[params[0]];
};
