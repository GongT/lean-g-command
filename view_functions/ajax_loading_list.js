module.exports = function (params, template, data, repeat){
	if(repeat.value){
		return;
	}
	var options = {};
	var type = options.type = params.__get('type', null, 0);
	var source = options.source = data.site_url(params.__get('source', null, 1));
	options.$loading = params.__get('loading', '');
	options.$nomore = params.__get('nomore', '');
	options.pager = params.__get('pager', 10);
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
	} else{
		return js_alert_error('Unknown ajax loading type: ' + type);
	}
	
	var id = options.id = params.__get('id', '') || ('ajaxloading' + data.guid);
	
	var ret = '<script type="text/javascript" debug="ajax loading list">';
	if(!data.__pllloaded){
		data.__pllloaded = true;
		ret += '(' + request_init + ')(window.$, ' + replacer + ');';
	}
	ret += 'document.addEventListener("DOMContentLoaded", ajax_loading_init.bind(this,' + JSON.stringify(options) +
	       '), false );';
	ret += '</script>';
	ret += '<script type="text/html" id="TPL_' + id + '">' + template + '</script>';
	
	return ret;
};
module.exports.type = 'block';

var request_init = function ($, replacer){
	if($){
		window.ajax_loading_init = init;
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
		var $tpl = $('#TPL_' + options.id);
		options.$container = $(document.createElement(options.tagName)).attr('id', options.id).insertAfter($tpl);
		options.tpl = $tpl.html();
		options.cursor = 0;
		options.count = options.pager || 10;
		
		if(options.type == 'pull'){
			init_pull(options);
		} else if(options.type == 'click'){
			var $click = $(options.click);
			
		} else{
			throw new Error('Unknown ajax loading type: ' + options.type);
		}
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
				if(json.list.length == 0){
					options.nomore = true;
					return;
				}
				
				var e = new $.Event('data', json);
				options.$container.trigger(e);
				
				if(json.list.length != options.count){ // this is the last page
					options.nomore = true;
				}
				
				var domarr = json.list.map(function (data){
					return replacer(options.tpl, data);
				});
				if(options.pendding == 'before'){
					options.$container.prepend(domarr.reverse());
				} else{
					options.$container.append(domarr);
				}
				options.cursor += json.list.length;
				
				setTimeout(function (){
					e = new $.Event('change', json);
					options.$container.trigger(e);
				}, 0);
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
		var locked = false;
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
			if(locked){
				return;
			}
			if(e.originalEvent[mouseVar]*dir > 0 && test()){ // down
				ajax(options);
			}
		}
		
		function touchHandler(e){
			if(locked){
				return;
			}
			if(lastTouch && lastTouch - e.originalEvent.touches[0][touchVar]*dir > 600 && test()){
				lastTouch = false;
				ajax(options);
			} else{
				lastTouch = e.originalEvent.touches[0][touchVar];
			}
		}
		
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
					options.$container.addClass('finished');
					this.$nomore.show();
					this.detach();
					var e = new $.Event('finish', {options: options});
					options.$container.trigger(e);
				} else{
					options.$container.addClass('have-more');
					this.$nomore.hide();
					this.attach();
				}
			}
		});
		var attached = false;
		options.attach = function (){
			if(attached){
				return;
			}
			attached = true;
			self.on('mousewheel', mouseHandler).on('touchmove', touchHandler);
		};
		options.detach = function (){
			attached = false;
			self.off('mousewheel', mouseHandler).off('touchmove', touchHandler);
		};
		options.nomore = false;
	}
}.toString();

var replacer = function (template, data){
	var n;
	var _c = {};
	while(n = /\[([a-z\.]*)(.*?)\]/ig.exec(template)){
		var r1 = n[0];
		var result = _c[r1];
		if(result === undefined){
			var name = n[1];
			var config = n[2].trim();
			result = data_path(name);
			if(config){
				if(config[0] == '='){
					var eqiif = config.split(/\?/, 2);
					if(result == eqiif[0]){
						result = eval('true?' + eqiif[1]);
					} else{
						result = eval('false?' + eqiif[1]);
					}
				} else if(config[0] == '?'){
					if(result){
						result = eval('true' + config);
					} else{
						result = eval('false' + config);
					}
				} else if(config.substr(0, 2) == '||'){
					result = eval('result' + config);
				} else{
					console.error('Unknown replace config %s in %s', config, r1);
				}
			}
		}
		template = template.replace(r1, result);
	}
	return template;
	
	function data_path(name){
		var itr = data;
		name = name.split('.');
		name.every(function (name){
			return itr = itr[name];
		});
		return itr || '';
	}
}.toString();

if(!Object.AV.isDebugEnv){
	request_init = uglify(request_init);
	replacer = uglify(replacer);
}
function uglify(script){
	return script
			.replace(/\s*\n\s*/gm, '')
			.replace(/\s+(\}|\{|=|,)\s+/gm, '$1');
}

function js_alert_error(text){
	text = JSON.stringify(text);
	return '<script type="text/javascript">alert(' + text + ');console.error(' + text + ');</script>';
}
