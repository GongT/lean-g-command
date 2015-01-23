module.exports = function (params, data){
	return '<!-- /* -->\n<pre style="text-align: left;background:white;color:black;font-size:small!important;overflow:scroll">' +
	       JSON.stringify(params[0] || undefined, null, 8) + '</pre>\n<!-- */ -->';
};
// module.exports.type = 'modifier';
