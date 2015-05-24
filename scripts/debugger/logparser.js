var console = new LogPrepend('错误高亮');

var APPPATH;
try{
	APPPATH = AV.APP_PATH;
} catch(e){
	APPPATH = global.APP_PATH;
}

var server_root = new RegExp(APPPATH, 'g');

var COLOR_NATIVE = '238';
var COLOR_SYSTEM = '240';
var COLOR_LEANG = '3';
var COLOR_ERROR = '9';
var COLOR_SUCCESS = '10';
var COLOR_MODULES = '240';
var COLOR_AVCLOUD = '3';
var COLOR_INTREST = '13';

var errorSign = /([A-Za-z]*Error:?.*)$/m;
function colorful_error(s){
	s = s.toString().replace(server_root, '').replace(/\\/g, '/');
	if(!errorSign.test(s)){
		return s;
	}
	return s.replace(errorSign, '\x1B[38;5;' + COLOR_ERROR + 'm$1\x1B[0m')
			.replace(/at (.*) \(native\)/mg, '\x1B[38;5;' + COLOR_NATIVE + 'mat $1\x1B[0m')
			.replace(/at ([a-zA-Z\-_]+\.js[:0-9]*)/mg, '\x1B[38;5;' + COLOR_SYSTEM + 'mat $1\x1B[0m')
			.replace(/at (.* \([a-zA-Z\-_]+\.js[:0-9]*\))/mg, '\x1B[38;5;' + COLOR_SYSTEM + 'mat $1\x1B[0m')
			.replace(/at (.*) \(.+\/lean-g\/(.*[:0-9]*)\)/mg, '\x1B[38;5;' + COLOR_LEANG + 'mat $1 (LEANG/$2)\x1B[0m')
			.replace(/at (.*) \(.+\/avoscloud-code\/node_modules\/(.*\.js[:0-9]*)\)/mg,
			'\x1B[38;5;' + COLOR_MODULES + 'mat $1 (AV::$2)\x1B[0m')
			.replace(/at (.*) \(.+\/avoscloud-code\/(.*\.js[:0-9]*)\)/mg,
			'\x1B[38;5;' + COLOR_AVCLOUD + 'mat $1 (AV/$2)\x1B[0m')
			.replace(/at (.*) \((.*\/)?cloud\/(.*)\)/m, 'at \x1B[38;5;' + COLOR_INTREST + 'm$1\x1B[0m (\x1B[38;5;' +
	                                                    COLOR_ERROR + 'm$3\x1B[0m)')
			.replace(/at (.*) \((.*\/)?cloud\/(.*)\)/mg, 'at \x1B[38;5;' + COLOR_INTREST + 'm$1\x1B[0m (\x1B[38;5;' +
	                                                     COLOR_SUCCESS + 'm$3\x1B[0m)')
			.replace(/at ([a-zA-Z\-_]+\/[a-zA-Z\-_\/]+\.js[:0-9]*)/mg, 'at \x1B[38;5;' + COLOR_SUCCESS + 'm$1\x1B[0m')
			.replace(/\/node_modules\//g, '::')
}

function RegExpEscape(s){
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = colorful_error;
