// var AV = Object.AV;

module.exports = function (params, template, data, repeat){
	if(repeat.value){
		return;
	}
	var options = {};
	var source = options.source = data.site_url(params.__get('source', null, 1));
	options.count = params.__get('pager', 10);
	options.init = params.__get('init', false);
	options.tagName = params.__get('tag', 'DIV').toUpperCase();
	options.pagerId = params.__get('pagerId');
	options.totalPageKnown = params.__get('count');
	if(options.totalPageKnown){
		options.totalPageKnown = options.totalPageKnown/options.count;
	}
	if(!options.totalPageKnown){
		options.totalPageKnown = false;
	}
	
	var id = options.id = params.__get('id', '') || ('ajaxpaging' + data.guid);
	options.cls = params.__get('class', '');
	
	var ret = '';
	ret += replacer.getSingleInstance(data);
	if(!data.__pplloaded){
		data.__pplloaded = true;
		ret += '<script type="text/javascript" title="ajax paging list init">"use strict";';
		ret += '\n(' + request_init + ')\n(window.$, ' + replacer.getInstance(data) + ');\n';
		ret += '</script>\n';
	}
	ret += '<script type="text/javascript" title="ajax pageing ' + id + '">"use strict";';
	ret += '\ndocument.addEventListener("DOMContentLoaded", ajax_paging_init.bind(this,' + JSON.stringify(options) +
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
		window.ajax_paging_init = function (options){
			setTimeout(function (){
				init(options);
			}, 0);
		};
	} else{
		var request = [];
		window.ajax_paging_init = function (options){
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
		options.$container = $('#' + options.id);
		var $tpl = options.$container.find('.TEMPLATE').remove();
		options.tpl = $tpl.html();
		options.currentPage = 0;
		options.$pager = $('#' + options.pagerId);
		if(!options.$pager.length){
			options.$pager = build_pager_dom(options).attr('id', options.id + 'Pager').insertAfter(options.$container);
		}
		
		create_pager(options.$pager, options.$container);
		
		var locked;
		Object.defineProperty(options, 'lock', {
			get: function (){
				return locked;
			},
			set: function (v){
				locked = v;
				if(locked){
					options.$container.addClass('busy');
					options.$container.trigger('busy', [true]);
				} else{
					options.$container.removeClass('busy');
					options.$container.trigger('busy', [false]);
				}
			}
		});
		
		options.$container.on('page', function (e, page){
			if(options.lock){
				return;
			}
			if(page == 'first'){
				page = 1;
			} else if(page == 'last'){
				page = options.totalPageKnown;
			} else if(page == 'prev'){
				page = options.currentPage - 1;
			} else if(page == 'next'){
				page = options.currentPage + 1;
			}
			if(page <= 0){
				alert('没有前一页啦');
				return;
			}
			if(options.totalPageKnown !== false && page > options.totalPageKnown){
				alert('没有后一页啦');
				return;
			}
			options.nextPage = page;
			ajax(options);
		});
		if(options.init){
			options.$container.trigger('page', [1]);
		}
	}
	
	function ajax(options){
		if(options.nextPage == options.currentPage){
			return new $.Deferred(function (d){
				d.resolve();
			});
		}
		var e = new $.Event('beforeAjax', {
			ajax: {
				type    : 'get',
				url     : options.source,
				data    : {cursor: (options.nextPage - 1)*options.count, count: options.count},
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
				
				if(json.hasOwnProperty('count')){
					options.totalPageKnown = Math.ceil(json.count/options.count);
					console.log('PagingList: got total page is "%s"', options.totalPageKnown);
				}
				if(json.list.length != 0){
					options.$container.empty();
					options.currentPage = options.nextPage;
				}
				
				console.log('AjaxPagingList请求结果: %O', json);
				var e = new $.Event('data', json);
				options.$container.trigger(e);
				
				var domarr = json.list.map(function (data){
					return replacer(options.tpl, data);
				});
				options.$container.append(domarr);
			} else{
				handle_error(json);
			}
			options.lock = false;
		}).fail(function (e){
			handle_error(e);
			options.lock = false;
		});
	}
	
	function create_pager($parent, eroot){
		var $in = $parent.find('input.data');
		if($in.length){
			eroot.on('change', function (e, opt){
				$in.removeAttr('disabled').val(opt.currentPage);
			});
			eroot.on('beforeAjax', function (){
				$in.attr('disabled', 'disabled');
			});
		}
		
		$parent.on('click', '[data-page]', function (){
			var target = $(this).data('page');
			if(target == 'input'){
				target = $in.val();
			}
			eroot.trigger('page', [target]);
		});
	}
	
	function build_pager_dom(options){
		var $page_parent = $('<div class="row"/>');
		
		var inp = $('<div class="input-group">').appendTo($('<div class="col-xs-6">').appendTo($page_parent));
		$('<input type="number" min="1" class="form-control data" placeholder="跳到" class="page"/>')
				.attr('max', options.totalPageKnown)
				.appendTo(inp);
		$('<button class="btn btn-default" type="button" data-page="input">跳转</button>').appendTo($('<span class="input-group-btn">').appendTo(inp));
		
		$('<div class="col-xs-6 text-right">')
				.append('<button class="btn btn-default btn-sm" data-page="prev">更早</button>')
				.append('<button class="btn btn-default btn-sm" data-page="next">更晚</button>')
				.appendTo($page_parent);
		
		return $page_parent;
	}
	
	function handle_error(e){
		var msg = e.message;
		alert('发生错误：' + msg);
	}
}.toString();

var replacer = require(AV.GROOT + 'include/view_function_public/default_template.js');
var uglify = require(AV.GROOT + 'include/view_function_public/uglify.js');
if(!AV.isDebugEnv){
	request_init = uglify(request_init);
}
