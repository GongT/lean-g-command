var CONSTANTS = Object.AV.CONSTANTS;
var CONSTANTS_STR;

module.exports = function (){
	if(!CONSTANTS_STR){
		CONSTANTS_STR = 'window.CONSTANT = ' + JSON.stringify(CONSTANTS, null, 8) + ';\n';
		CONSTANTS_STR += Object.AV.site_url.toString();
	}
	
	return CONSTANTS_STR;
};
