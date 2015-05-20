module.exports = function (params, data){
	var dump = require('util')._extend({}, data);
	delete dump.runtime;
	delete dump.smarty;
	delete dump.__get;
	delete dump.settings;
	delete dump.$this;
	delete dump.site_url;
	var result = jsonToHTML(dump);
	
	var ret = '';
	ret += get_static();
	ret += result;
	return ret;
};
function htmlEncode(t){
	return t !=
	       null? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
}

function decorateWithSpan(value, className){
	return '<span class="' + className + '">' + htmlEncode(value) + '</span>';
}

function valueToHTML(value){
	var valueType = typeof value, output = "";
	if(value == null){
		output += decorateWithSpan("null", "type-null");
	} else if(value && value.constructor == Array){
		output += arrayToHTML(value);
	} else if(valueType == "object"){
		output += objectToHTML(value);
	} else if(valueType == "number"){
		output += decorateWithSpan(value, "type-number");
	} else if(valueType == "string"){
		if(/^(http|https):\/\/[^\s]+$/.test(value)){
			output += decorateWithSpan('"', "type-string") + '<a href="' + value + '">' + htmlEncode(value) + '</a>' +
			          decorateWithSpan('"', "type-string");
		} else{
			output += decorateWithSpan('"' + value + '"', "type-string");
		}
	} else if(valueType == "boolean"){
		output += decorateWithSpan(value, "type-boolean");
	}
	
	return output;
}

function arrayToHTML(json){
	var i, length, output = '<div class="collapser"></div>[<ul class="array collapsible">', hasContents = false;
	for(i = 0, length = json.length; i < length; i++){
		hasContents = true;
		output += '<li><div class="hoverable">';
		output += valueToHTML(json[i]);
		if(i < length - 1){
			output += ',';
		}
		output += '</div></li>';
	}
	output += '</ul>]';
	if(!hasContents){
		output = "[ ]";
	}
	return output;
}

function objectToHTML(json){
	var i, key, length, keys = Object.keys(json), output = '<div class="collapser"></div>{<span class="ellipsis"></span><ul class="obj collapsible">', hasContents = false;
	for(i = 0, length = keys.length; i < length; i++){
		key = keys[i];
		hasContents = true;
		output += '<li><div class="hoverable">';
		output += '<span class="property">' + htmlEncode(key) + '</span>: ';
		output += valueToHTML(json[key]);
		if(i < length - 1){
			output += ',';
		}
		output += '</div></li>';
	}
	output += '</ul>}';
	if(!hasContents){
		output = "{ }";
	}
	return output;
}

function jsonToHTML(json, fnName){
	var output = '';
	if(fnName){
		output += '<div class="callback-function">' + fnName + '(</div>';
	}
	output += '<div id="DebugLocalVar">';
	output += valueToHTML(json);
	output += '</div>';
	if(fnName){
		output += '<div class="callback-function">)</div>';
	}
	return output;
}

function get_static(){
	return get_static.toString().replace(/[\s\S]+\/\*([\s\S]+)\*\/[\s\S]+/, '$1');
	/*
	 <script type="text/javascript">
	 document.addEventListener('keyup',function(e){
	 if(e.keyCode==88)switchDebugDiv();
	 });
	 function switchDebugDiv(){
	 var e = document.querySelector('#DebugLocalVar');
	 if(getComputedStyle(e).display=='block'){
	 e.style.display='none';
	 }else{
	 e.style.display='block';
	 }
	 }
	 </script>
	 <style type="text/css">
	 #DebugLocalVar{
	 text-align:left;white-space:pre;font-family:monospace;
	 font-size:small;
	 background:white;
	 display:none;
	 }
	 #DebugLocalVar .property {
	 font-weight: bold;
	 }
	
	 #DebugLocalVar .type-null {
	 color: gray;
	 }
	
	 #DebugLocalVar .type-boolean {
	 color: firebrick;
	 }
	
	 #DebugLocalVar .type-number {
	 color: blue;
	 }
	
	 #DebugLocalVar .type-string {
	 color: green;
	 }
	
	 #DebugLocalVar .callback-function {
	 color: gray;
	 }
	
	 #DebugLocalVar .collapsible {
	 margin-left: 2em;
	 }
	
	 #DebugLocalVar .hoverable {
	 padding-top: 1px;
	 padding-bottom: 1px;
	 padding-left: 2px;
	 padding-right: 2px;
	 border-radius: 2px;
	 }
	
	 #DebugLocalVar .hovered {
	 background-color: rgba(235, 238, 249, 1);  
	 }
	 ul {
	 list-style-type: none;
	 padding: 0px;
	 margin: 0px 0px 0px 26px;
	 }
	 li {
	 position: relative;
	 }
	 #DebugLocalVar .collapser {
	 padding-right: 6px;
	 padding-left: 6px;
	 }
	 #DebugLocalVar .hoverable {
	 transition: background-color .2s ease-out 0s;
	 -webkit-transition: background-color .2s ease-out 0s;
	 display: inline-block;
	 }
	
	 #DebugLocalVar .hovered {
	 transition-delay: .2s;
	 -webkit-transition-delay: .2s;
	 }
	 </style>
	 */
}
