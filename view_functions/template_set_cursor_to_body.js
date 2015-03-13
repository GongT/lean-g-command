var nsmarty = require('nsmarty');
// var AV = Object.AV;

module.exports = function (params, data){
	data._head = {
		ascripts: [],
		pscripts: [],
		astyles : [],
		pstyles : []
	};
	return '';
};
