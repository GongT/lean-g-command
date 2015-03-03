var nsmarty = require('nsmarty');
// var AV = Object.AV;
var CONSTANTS = AV.CONSTANTS;

module.exports = function (params, data){
	var $ua = data.runtime.__req.headers['user-agent'].toLowerCase();
	data._ua = $ua;
	
	var $class = params['class'] || '';
	if(/iphone/.test($ua)){
		$class += ' iOs iphone';
	} else if(/ipad/.test($ua)){
		$class += ' iOs ipad';
	} else if(/ipod/.test($ua)){
		$class += ' iOs ipod';
	}
	if(/os 8_/.test($ua)){
		$class += ' iOs8';
	}
	if(/micromessenger/.test($ua)){
		$class += ' weixin';
	}
	data._class = $class;
	
	data._title = params.__get('title', '功夫熊', 0);
	
	data._head = {
		ascripts: [],
		pscripts: [],
		astyles : [],
		pstyles : []
	};
	data.IS_DEBUG_ENV = CONSTANTS.isDebugEnv;
	
	var guid = 0;
	Object.defineProperty(data, 'guid', {
		get         : function (){
			return guid++;
		},
		configurable: false
	});
	
	data.site_url = nsmarty['modifier'].site_url;
	return '';
};
