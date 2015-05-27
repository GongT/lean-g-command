module.exports = function uglify(script){
	return script
			.replace(/\/\/.*$/gm, '')
			.replace(/\s*\n\s*/gm, '')
			.replace(/\s+(\}|\{|=|,)\s+/gm, '$1');
};
