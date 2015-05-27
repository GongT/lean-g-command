// less-constants
var extend = require('util')._extend;
var PUB_CONST = {
	IS_DEBUG_ENV  : AV.CONFIG.isDebugEnv,
	isDebugEnv    : AV.CONFIG.isDebugEnv,
	ENVIRONMENT   : AV.CONFIG.APP_ENVIRONMENT,
	APP_SERVER    : AV.CONFIG.APP_SERVER,
	STATIC_URL    : AV.CONFIG.staticUrl,
	BASE_URL      : AV.CONFIG.baseUrl,
	STATIC_VERSION: AV.CONFIG.staticVersion
};

if(AV.CONFIG.scriptConstant){
	extend(PUB_CONST, AV.CONFIG.scriptConstant);
}

module.exports = PUB_CONST;
