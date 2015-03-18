var console = new LogPrepend('错误高亮');

var server_root = new RegExp(GROOT, 'g');

function colorful_error(s){
	s = s.toString();
	if(/([A-Za-z]*Error:.*)$/m.test(s)){
		return;
	}
	return s.replace(/([A-Za-z]*Error:.*)$/m, '\x1B[38;5;9m$1\x1B[0m')
			.replace(server_root, '')
			.replace(/at (.*) \(native\)/mg, '\x1B[38;5;235mat $1\x1B[0m')
			.replace(/at (.*) \(.+\/lean-g\/(.*\.js[:0-9]*)\)/mg, '\x1B[38;5;244mat $1 (G/$2)\x1B[0m')
			.replace(/at (.*) \(.+\/avoscloud-code\/node_modules\/(.*\.js[:0-9]*)\)/mg, '\x1B[38;5;238mat $1 ($2)\x1B[0m')
			.replace(/at (.*) \(.+\/avoscloud-code\/(.*\.js[:0-9]*)\)/mg, '\x1B[38;5;244mat $1 (AV/$2)\x1B[0m')
			.replace(/at (.*) \(\/cloud/mg, 'at \x1B[38;5;14m$1\x1B[0m (/cloud')
}

function RegExpEscape(s){
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = colorful_error;
