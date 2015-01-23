module.exports = function (s, split){
	return s.join(split || '');
};

module.exports.type = 'modifier';
