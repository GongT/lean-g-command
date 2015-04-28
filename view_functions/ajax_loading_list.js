// var AV = Object.AV;

module.exports = function (params, template, data, repeat){
	if(repeat.value){
		return;
	}
	var options = {};
	var type = options.type = params.__get('type', null, 0);
	var source = options.source = data.site_url(params.__get('source', null, 1));
	options.$loading = params.__get('loading', '');
	options.$nomore = params.__get('nomore', '');
	options.count = params.__get('pager', 10);
	options.init = params.__get('init', false);
	options.tagName = params.__get('tag', 'DIV').toUpperCase();
	
	if(type == 'pull'){
		options.parent = params.__get('parent', 'window');
		options.direction = params.__get('direction', 'down');
		if(options.direction == 'up' || options.direction == 'left'){
			options.pendding = params.__get('pendding', 'before');
		} else{
			options.pendding = params.__get('pendding', 'after');
		}
	} else if(type == 'click'){
		options.click = params.__get('click', null);
		options.pendding = params.__get('pendding', 'after');
	} else if(type == 'manual'){
		// 只允许手动触发
	} else{
		return js_alert_error('Unknown ajax loading type: ' + type);
	}
	
	var id = options.id = params.__get('id', '') || ('ajaxloading' + data.guid);
	options.cls = params.__get('class', '');
	
	var ret = '';
	ret += replacer.getSingleInstance(data);
	ret += '<script type="text/javascript" debug="ajax loading list">';
	if(!data.__pllloaded){
		data.__pllloaded = true;
		ret += '<script type="text/javascript" title="ajax loading list init">"use strict";';
		ret += '\n(' + request_init + ')\n(window.$, ' + replacer.getInstance(data) + ');\n';
		ret += '</script>\n';
	}
	ret += '<script type="text/javascript" title="ajax loading ' + id + '">"use strict";';
	ret += '\ndocument.addEventListener("DOMContentLoaded", ajax_loading_init.bind(this,' + JSON.stringify(options) +
	       '), false );\n';
	ret += '</script>\n';
	
	ret += '<' + options.tagName + ' id="' + id + '"';
	if(options.cls){
		ret += ' class="' + options.cls + '"';
	}
	ret += '>\n';
	ret += '<script type="text/html" class="TEMPLATE">' + template + '</script>\n';
	ret += '</' + options.tagName + '>\n';
	
	return ret;
};
module.exports.type = 'block';

var request_init = function ($, replacer){
	if($){
		window.ajax_loading_init = function (options){
			setTimeout(function (){
				init(options);
			}, 0);
		};
	} else{
		var request = [];
		window.ajax_loading_init = function (options){
			request.push(options);
			if(request.length == 1){
				window.use_jquery(function (jQuery){
					$ = jQuery;
					window.ajax_loading_init = init;
					request.forEach(function (options){
						init(options);
					});
				});
			}
		};
	}
	function init(options){
		options.$loading = $(options.$loading);
		options.$nomore = $(options.$nomore);
		options.$container = $('#' + options.id);
		var $tpl = options.$container.find('.TEMPLATE').remove();
		options.tpl = $tpl.html();
		options.cursor = 0;
		
		if(options.type == 'pull'){
			init_pull(options);
		} else if(options.type == 'click'){
			var $click = $(options.click);
			
		} else if(options.type == 'manual'){
		} else{
			throw new Error('Unknown ajax loading type: ' + options.type);
		}
		var locked;
		Object.defineProperty(options, 'lock', {
			get: function (){
				return locked;
			},
			set: function (v){
				locked = v;
				if(locked){
					options.$container.addClass('busy');
					this.$loading.show();
				} else{
					options.$container.removeClass('busy');
					this.$loading.hide();
				}
			}
		});
		var nomore;
		Object.defineProperty(options, 'nomore', {
			get: function (){
				return nomore;
			},
			set: function (v){
				nomore = v;
				if(nomore){
					this.lock = false;
					options.$container.addClass('finished').removeClass('have-more');
					this.$nomore.show();
					var e = new $.Event('finish', {options: options});
					options.$container.trigger(e);
				} else{
					options.$container.addClass('have-more');
					this.$nomore.hide();
				}
			}
		});
		options.nomore = false;
		options.$container.triggerHandler('ready', [options]);
		if(options.init){
			ajax(options);
		}
	}
	
	function ajax(options){
		var e = new $.Event('beforeAjax', {
			ajax: {
				type    : 'get',
				url     : options.source,
				data    : {cursor: options.cursor, count: options.count},
				dataType: 'json'
			}
		});
		options.$container.trigger(e);
		if(e.isDefaultPrevented()){
			return;
		}
		options.lock = true;
		return $.ajax(e.ajax).done(function (json){
			if(json.status == 0){
				setTimeout(function (){
					e = new $.Event('change', json);
					options.$container.trigger(e, [options]);
				}, 0);
				
				if(json.list.length == 0){
					options.nomore = true;
					return;
				}
				
				console.log('AjaxLoadingList请求结果: %O', json);
				var e = new $.Event('data', json);
				options.$container.trigger(e);
				
				var domarr = json.list.map(function (data){
					return replacer(options.tpl, data);
				});
				if(options.pendding == 'before'){
					options.$container.prepend(domarr.reverse());
				} else{
					options.$container.append(domarr);
				}
				options.cursor += options.pager;
			} else{
				handle_error(json);
			}
			options.lock = false;
		}).fail(function (e){
			handle_error(e);
			options.lock = false;
		});
	}
	
	function handle_error(e){
		var msg = e.message;
		alert('发生错误：' + msg);
	}
	
	function init_pull(options){
		var isWindow = options.parent == 'window';
		var self = $(isWindow? document : options.parent);
		var lastTouch = 0;
		var test, mouseVar, touchVar, dir;
		switch(options.direction){
		case 'up':
			test = isWindow? function (){
				return window.scrollY == 0;
			} : function (){
				return self[0].scrollTop == 0;
			};
			dir = -1;
			mouseVar = 'deltaY';
			touchVar = 'clientY';
			break;
		case 'down':
			test = isWindow? function (){
				return self.height() == window.scrollY + window.innerHeight;
			} : function (){
				return self[0].scrollTop == self[0].scrollHeight - self[0].offsetHeight;
			};
			dir = 1;
			mouseVar = 'deltaY';
			touchVar = 'clientY';
			break;
		case 'left':
		case 'right':
			break;
		default :
			throw new Error('Unkown ajax pull direction: ' + options.direction);
		}
		function mouseHandler(e){
			if(options.lock){
				return;
			}
			if(e.originalEvent[mouseVar]*dir > 0 && test()){ // down
				ajax(options);
			}
		}
		
		function touchHandler(e){
			if(options.lock){
				return;
			}
			if(lastTouch && lastTouch - e.originalEvent.touches[0][touchVar]*dir > 3 && test()){
				lastTouch = false;
				ajax(options);
			} else{
				lastTouch = e.originalEvent.touches[0][touchVar];
			}
		}
		
		function detach(){
			self.off('mousewheel', mouseHandler).off('touchmove', touchHandler);
		}
		
		options.$container.on('finish', detach);
		self.on('mousewheel', mouseHandler).on('touchmove', touchHandler);
	}
}.toString();

var replacer = require(AV.GROOT + 'include/view_function_public/default_template.js');
var uglify = require(AV.GROOT + 'include/view_function_public/uglify.js');
if(!AV.isDebugEnv){
	request_init = uglify(request_init);
}

function js_alert_error(text){
	text = JSON.stringify(text);
	return '<script type="text/javascript">alert(' + text + ');console.error(' + text + ');</script>';
}
