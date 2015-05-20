// var AV = Object.AV;
var minjs = AV.CONSTANTS.isDebugEnv? 'js' : 'min.js';
var mincss = AV.CONSTANTS.isDebugEnv? 'css' : 'min.css';
var librarys = {
	'jquery'     : ['jquery.' + minjs, 'jquery.cookie.js'],
	'bootstrap'  : ['bootstrap.' + minjs, 'bootstrap.' + mincss],
	'jquery-only': ['jquery.' + minjs],
	'artDialog'  : ['artDialog.js', 'iframeTools.source.js', 'artdialog/default.css']
};

var plugins = {
	'bootstrap' : {
		root      : 'bootstrap',
		files     : ['bootstrap.' + minjs, 'bootstrap.' + mincss],
		dependence: ['jquery-only']
	},
	'bs-style' : {
		root      : 'bootstrap',
		files     : ['bootstrap.' + mincss],
		dependence: []
	},
	'artDialog' : {
		root      : 'artdialog',
		files     : ['ui-dialog.css', 'dialog.' + minjs, 'dialog-plus.' + minjs, 'artdialog.extend.js'],
		dependence: ['jquery-only']
	},
	'dataTables': {
		root      : 'datatable',
		files     : ['jquery.dataTables.js', 'jquery.dataTables.css', 'jquery.dataTables.extend.js'],
		dependence: ['jquery-only', 'ajax-form.js', 'date.js', 'datePicker']
	},
	'datePicker': {
		root      : 'datepicker',
		files     : [
			'bootstrap-datepicker.' + minjs,
			'bootstrap-datepicker3.' + mincss,
			'/locales/bootstrap-datepicker.zh-CN.min.js'
		],
		dependence: ['jquery-only', 'bootstrap']
	}
};

var isJs = /\.js$/;
var isCss = /\.css$/;

function no_duplicate_append(data, file){
	if(!data._static_dup){
		data._static_dup = {};
	}
	if(data._static_dup[file]){
		return;
	}
	data._static_dup[file] = true;
	if(isJs.test(file)){
		data._head.ascripts.push(wrapjs(file));
	} else if(isCss.test(file)){
		data._head.astyles.push(wrapcss(file));
	} else{
		data._head.ascripts.push(js_alert_error('没有找到引入的静态文件：' + file));
	}
}
function no_duplicate_prepend(data, file){
	if(!data._static_dup){
		data._static_dup = {};
	}
	if(data._static_dup[file]){
		return;
	}
	data._static_dup[file] = true;
	if(isJs.test(file)){
		data._head.pscripts.push(wrapjs(file));
	} else if(isCss.test(file)){
		data._head.pstyles.push(wrapcss(file));
	} else{
		data._head.pscripts.push(js_alert_error('没有找到引入的静态文件：' + file));
	}
}

function insert_static(params, data){
	var file = params.__get('file', '', 0);
	var external = params.__get('external');
	var library = params.__get('library');
	var plugin = params.__get('plugin');
	if(file){
		if(isJs.test(file)){
			no_duplicate_append(data, 'scripts/' + file);
		} else if(isCss.test(file)){
			no_duplicate_append(data, 'styles/' + file);
		} else if(librarys[file]){
			library = file;
			file = null;
		} else if(plugins[file]){
			plugin = file;
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
	if(plugin){
		if(plugins[plugin]){
			use_plugin_dependence(plugins[plugin], data);
		} else{
			return js_alert_error('未知的插件：' + plugin);
		}
	}
	if(external){
		if(isJs.test(external) || isCss.test(external)){
			no_duplicate_append(data, external);
		} else{
			return js_alert_error('没有找到引入的静态文件：' + external);
		}
	}
	return '';
}
function use_library(list, data){
	list.forEach(function (file){
		if(isJs.test(file)){
			no_duplicate_prepend(data, 'js/' + file);
		} else{
			no_duplicate_prepend(data, 'css/' + file);
		}
	});
}
function use_plugin(name, list, data){
	list.forEach(function (file){
		var fp;
		if(/^\//.test(file)){
			if(isJs.test(file)){
				fp = 'plugin/' + name + file;
			} else{
				fp = 'plugin/' + name + file;
			}
		} else if(isJs.test(file)){
			fp = 'plugin/' + name + '/js/' + file;
		} else{
			fp = 'plugin/' + name + '/css/' + file;
		}
		no_duplicate_append(data, fp);
	});
}
function use_plugin_dependence(plugin, data){
	use_plugin(plugin.root, plugin.files, data);
	if(plugin.dependence){
		plugin.dependence.forEach(function (library){
			if(librarys[library]){
				use_library(librarys[library], data);
			} else if(plugins[library]){
				use_plugin_dependence(plugins[library], data);
			} else if(isJs.test(library) || isCss.test(library)){
				use_library([library], data);
			}
		});
	}
}

function wrapjs(file){
	file = file.replace(/^\//g, '');
	return '<script type="text/javascript" crossorigin="anonymous" src="' + AV.CONSTANTS.STATIC_URL + file + '?v=' +
	       AV.CONSTANTS.STATIC_VERSION + '"></script>';
}
function wrapcss(file){
	file = file.replace(/^\//g, '');
	return '<link type="text/css" rel="stylesheet" href="' + AV.CONSTANTS.STATIC_URL + file + '?v=' +
	       AV.CONSTANTS.STATIC_VERSION + '">';
}
function js_alert_error(text){
	text = JSON.stringify(text);
	return '<script type="text/javascript">alert(' + text + ');console.error(' + text + ');</script>';
}

module.exports = insert_static;
