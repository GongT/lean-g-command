global.appLoaderLog += '\tload config loader...\n';
var configure = new (require('../include/ConfigLoader'))(AV.APP_PATH + 'config/');
global.appLoaderLog += '\tread files...\n';
configure.load_global();

global.appLoaderLog += '\tnormalize ...\n';
AV.isDebugEnv = configure.isDebugEnv;
AV.isTestEnv = configure.isTestEnv;
normalize_config(configure);
module.exports = configure;

function normalize_config(CONFIG){
	if(!CONFIG.template){
		CONFIG.template = {};
	}
	if(!CONFIG.template.standardErrorPage){
		CONFIG.template.standardErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/standard_error.tpl';
	}
	if(!CONFIG.template.internalErrorPage){
		CONFIG.template.internalErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/internal_error.tpl';
	}
	if(!CONFIG.template.userErrorPage){
		CONFIG.template.userErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/user_error.tpl';
	}
	if(!CONFIG.template.notFoundErrorPage){
		CONFIG.template.notFoundErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/404_not_found.tpl';
	}
	
	if(!CONFIG.cookie){
		CONFIG.cookie = {};
	}
	var baseInfo = require('url').parse(CONFIG.baseUrl || '/');
	
	var COOKIE = CONFIG.cookie;
	if(COOKIE.hasOwnProperty('expire')){
		COOKIE.maxAge = COOKIE.expire;
		delete COOKIE.expire;
	} else{
		COOKIE.maxAge = 86400000;
	}
	if(!COOKIE.hasOwnProperty('path')){
		COOKIE.path = baseInfo.pathname || '/';
	}
	if(!COOKIE.hasOwnProperty('domain')){
		COOKIE.domain = baseInfo.hostname || undefined;
	}
	if(!COOKIE.hasOwnProperty('signed')){
		COOKIE.signed = false;
	}
	if(!COOKIE.hasOwnProperty('secure')){
		COOKIE.secure = false;
	}
	if(CONFIG.forceSSL){
		COOKIE.secure = true;
	}
	if(!COOKIE.signKey){
		COOKIE.signKey = 'leang*' + CONFIG.applicationKey;
	}
	
	COOKIE.overwrite = true;
	
	/* SESSION */
	var extend = require('util')._extend;
	if(!CONFIG.session){
		CONFIG.session = {};
	}
	var SESSION = CONFIG.session;
	if(!SESSION.cookie){
		SESSION.cookie = {};
	}
	SESSION.cookie = extend(extend({}, COOKIE), SESSION.cookie);
	SESSION.cookie.httpOnly = true;
	SESSION.cookie.signed = false;
	if(!SESSION.hasOwnProperty('fetchUser')){
		SESSION.fetchUser = false;
	}
	if(!SESSION.hasOwnProperty('key')){
		SESSION.key = 'NODESESSID';
	}
	
	CONFIG.avsession = extend({}, SESSION);
	CONFIG.avsession.key = CONFIG.avsession.userKey || 'AVOSSESSID';
	
	delete SESSION.fetchUser;
}
