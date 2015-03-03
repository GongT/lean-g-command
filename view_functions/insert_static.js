// var AV = Object.AV;
var CONSTANTS = AV.CONSTANTS;

var librarys = {
	'jquery': ['jquery' + (CONSTANTS.isDebugEnv? '.min' : '') + '.js', 'jquery.cookie.js']
};

var isJs = /\.js$/;
var isCss = /\.css$/;

function insert_static(params, data){
	var file = params.__get('file', '', 0);
	var library = params.__get('library');
	if(file){
		if(isJs.test(file)){
			data._head.ascripts.push(wrapjs('scripts/' + file));
		} else if(isCss.test(file)){
			data._head.astyles.push(wrapcss('styles/' + file));
		} else if(librarys[file]){
			library = file;
			file = null;
		} else{
			return js_alert_error('没有找到引入的静态文件：' + file);
		}
	}
	if(library){
		if(librarys[library]){
			use_library(librarys[library], data);
		} else if(isJs.test(library) || isCss.test(library)){
			use_library([library], data);
		} else{
			return js_alert_error('未知的静态文件库：' + library);
		}
	}
	return '';
}
function use_library(list, data){
	list.forEach(function (file){
		if(isJs.test(file)){
			data._head.pscripts.push(wrapjs('js/' + file));
		} else{
			data._head.pstyles.push(wrapcss('css/' + file));
		}
	});
}

function wrapjs(file){
	return '<script type="text/javascript" crossorigin="anonymous" src="' + CONSTANTS.STATIC_URL + file + '?v=' +
	       CONSTANTS.STATIC_VERSION + '"></script>';
}
function wrapcss(file){
	return '<link type="text/css" rel="stylesheet" href="' + CONSTANTS.STATIC_URL + file + '?v=' +
	       CONSTANTS.STATIC_VERSION + '">';
}
function js_alert_error(text){
	text = JSON.stringify(text);
	return '<script type="text/javascript">alert(' + text + ');console.error(' + text + ');</script>';
}

module.exports = insert_static;
