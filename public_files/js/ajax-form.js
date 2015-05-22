"use strict";
$.fn.ajaxSubmit = function (){
	if(this.get(0).nodeName != 'FORM'){
		return false;
	}
	
	var that = this;
	
	var bindFormPart = this.data('bind');
	
	var target = this.attr('target');
	if(target){
		target = target == '_blank';
	} else{
		target = false;
	}
	var act = this.data('action');
	if(!act){
		act = this.attr('action');
		this.data('action', act);
	}
	var mtd = this.attr('method');
	
	function mute(){
		return false;
	}
	
	var data = this.serializeArray();
	var e = new $.Event('beforeAjax.ajax-form', {
		ajax: {
			url     : act,
			dataType: 'json',
			method  : mtd,
			data    : data,
			context : this
		}
	});
	this.trigger(e);
	if(e.isDefaultPrevented()){
		return;
	}
	if(Array.isArray(e.ajax.data)){
		e.ajax.data = $.param(e.ajax.data);
	}
	
	var disabled_controls = this.on('click', $.fn.ajaxSubmit.mute_click_controls, mute)
			.find($.fn.ajaxSubmit.mute_edit_controls).filter(':not(.disabled):not([disabled])').attr('disabled', 'disabled');
	if(bindFormPart){
		var disabled_controls_binding = bindFormPart.on('click', $.fn.ajaxSubmit.mute_click_controls, mute)
				.find($.fn.ajaxSubmit.mute_edit_controls).filter(':not(.disabled):not([disabled])').attr('disabled', 'disabled');
	}
	
	if(this.find('input[type=file]').length){
		alert('has-file');
		return upload_file(this, function (err, data){
			handle_result_json(data);
			finish();
		});
	}
	
	console.log('ajax form post: %O %s to %s', that[0], mtd, act);
	var r = $.ajax(e.ajax);
	
	var callback_error = null;
	r.done(handle_result_json).fail(function (e){
		alert('网络出错');
		if(e.responseText && e.responseText.trim().substr(0, 1) == '<'){
			console.error('请求返回了html而不是预期的json');
		} else{
			console.error(e);
		}
		finish();
	});
	return r;
	
	function finish(){
		disabled_controls.removeAttr('disabled');
		that.off('click', $.fn.ajaxSubmit.mute_click_controls, mute);
		
		if(bindFormPart){
			disabled_controls_binding.removeAttr('disabled');
			bindFormPart.off('click', $.fn.ajaxSubmit.mute_click_controls, mute);
		}
		
		if(callback_error){
			throw callback_error;
		}
	}
	
	function handle_result_json(json){
		var e = new $.Event(json.status == 0? 'success.ajax-form' : 'fail.ajax-form');
		try{
			that.trigger(e, [json]);
		} catch(e){
			callback_error = e;
			return;
		}
		if(!e.isDefaultPrevented()){
			finish();
		}
		
		if(e.isPropagationStopped() || e.isImmediatePropagationStopped()){
			return;
		}
		
		console.log('AjaxFormResult: ', json);
		if(json.status == 0){
			alert('请求成功' + (json.message? ': ' + json.message : ''));
		} else{
			alert('错误：' + json.message);
		}
	}
};

$.fn.ajaxSubmit.mute_click_controls = 'a,input,button,select,textarea';
$.fn.ajaxSubmit.mute_edit_controls = 'input,button,select,textarea';

$(function (){
	if(window.disableAutoAjax){
		console.error('document.ready trigger twice');
		return;
	}
	
	var no_ajax_submit = false;
	$(document).on('submit', 'form[type=ajax]', function (e){
		if(no_ajax_submit){
			return true;
		}
		var ask = $(this).data('ask');
		if(ask){
			var that = $(this);
			if(confirm(ask)){
				that.ajaxSubmit();
			}
		} else{
			$(this).ajaxSubmit();
		}
		e.preventDefault();
	});
	window.disableAutoAjax = function (arg){
		// debug!
		no_ajax_submit = arg !== false;
	};
	$('form[type=ask]').removeAttr('type').submit(function (){
		var that = $(this);
		var ask = that.data('ask');
		if(confirm(ask)){
			that[0].submit();
		}
		return false;
	});
});

function upload_file($form){
	var $iframe = $('<iframe data-title="datatable-target" style="display:block!important;" id="DTX' +
	                parseInt(Math.random()*1000) + '">').appendTo('body');
	var id = $iframe.attr('id');
	$form.append($iframe);
}
