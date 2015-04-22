module.exports = function (params, data){
	var cls = params.__get('class', '');
	return '<!-- /* -->\n<pre class="' + cls +
	       '" style="text-align:left;background:white;color:black;font-size:small!important;overflow:scroll">' +
	       JSON.stringify(params[0] || undefined, null, 8) + '</pre>\n<!-- */ -->';
};
// module.exports.type = 'modifier';
