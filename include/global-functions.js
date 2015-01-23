var AV = Object.AV;
var slash_start = /^\//;
var CONSTANT = AV.CONSTANTS;

AV.site_url = site_url;
site_url.slash_start = slash_start;

function site_url(path){
	if(slash_start.test(path)){
		return CONSTANT.BASE_URL + path.replace(slash_start, '');
	} else{
		return CONSTANT.BASE_URL + path;
	}
}
site_url.toString = function (){
	return 'var slash_start = ' + slash_start.toString() + ';' +
	       site_url.constructor.prototype.toString.call(site_url);
};
