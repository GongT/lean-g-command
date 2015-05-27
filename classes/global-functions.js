// var AV = Object.AV;
var slash_start = /^\//;
var CONSTANT = AV.CONSTANTS;

AV.site_url = site_url;
AV.butify_encode_json = butify_encode_json;

function site_url(path){
	if(slash_start.test(path)){
		return CONSTANT.BASE_URL + path.replace(slash_start, '');
	} else{
		return CONSTANT.BASE_URL + path;
	}
}
site_url.slash_start = slash_start;
site_url.toString = function (){
	return 'var slash_start = ' + slash_start.toString() + ';' +
	       site_url.constructor.prototype.toString.call(site_url);
};

function butify_encode_json(obj){
	return JSON.stringify(obj, null, 8).replace(/^        /mg, '\t')
}
