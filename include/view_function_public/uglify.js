module.exports = function uglify(script){
	return script
			.replace(/\s*\n\s*/gm, '')
			.replace(/\s+(\}|\{|=|,)\s+/gm, '$1');
};
