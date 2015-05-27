var valid_object_id = /^[0-9a-f]{24}$/i;
var valid_url = /^https?:\/\/\S+$/;
var valid_uri = /^\/\S+$/;
var valid_special = /^(tel|mailto):/;

module.exports = {
	"anything"          : function (v){
		return v;
	},
	"string"            : function (v){
		return v + '';
	},
	"url"               : function (v){
		if(valid_url.test(v) || valid_uri.test(v) || valid_special.test(v)){
			return v;
		}
	},
	"JSONString"        : function (v){
		try{
			v = JSON.parse(v);
		} catch(e){
			return;
		}
		return v;
	},
	"JSONDataObject"    : function (v){
		try{
			v = JSON.parse(v);
		} catch(e){
			return;
		}
		if(typeof v === 'object' && !Array.isArray(v)){
			return new AV.InputChecker(v);
		}
	},
	"money"             : function (v){
		v = parseFloat(v);
		if(isNaN(v)){
			return;
		}
		if(parseFloat(v.toFixed(2)) != v){
			return;
		}
		if(v < 0){
			return;
		}
		return v;
	},
	"int"               : function (v){
		var val = parseInt(v);
		if(isNaN(val)){
			return;
		}
		if(val.toString() != v){
			return;
		}
		return val;
	},
	'bool'              : function (v){
		if(typeof v == 'boolean'){
			return v
		}
		if(typeof v == 'number'){
			if(v == 0 || v == -1){
				return false;
			} else if(v == 1){
				return true;
			}
		}
		if(typeof v == 'string'){
			v = v.toLowerCase();
			if(v == 'true' || v == 'on' || v == '1' || v == 'yes'){
				return true
			} else if(v == 'false' || v == 'off' || v == '0' || v == 'no'){
				return false
			}
		}
	},
	"number"            : function (v){
		if(typeof v == 'string'){
			v = parseFloat(v);
		}
		if(isNaN(v)){
			return;
		}
		if(v.toString() != v){
			return;
		}
		return v;
	},
	"phoneNumber"       : function (v){
		if(v[0] == '+'){
			v = v.substr(3);
		}
		v = parseInt(v);
		if(v.toString().length == 11){
			return v;
		}
	},
	"objectId"          : function (v, opt){
		if(!v){
			return opt;
		}
		if(valid_object_id.test(v)){
			return v;
		}
	},
	"time"              : function (v){ // 未来的时间点
		if(!v){
			return;
		}
		if(v.iso){
			return new Date(v.iso);
		}
		var date;
		if(typeof v == "number" || /^[0-9]+$/.test(v)){
			date = new Date(v*1000);
		} else{
			date = new Date(v);
		}
		if(isNaN(date.getTime())){
			return;
		}
		return date;
	},
	"variableDataObject": function (v){
		if(typeof v === 'object' && !Array.isArray(v)){
			return v;
		}
	},
	"dataObject"        : function (v){
		if(typeof v === 'object' && !Array.isArray(v)){
			return new AV.InputChecker(v);
		}
	},
	'geoObject'         : function (v){
		var lat = parseFloat(v.lat || v.latitude);
		var lng = parseFloat(v.lng || v.longitude);
		if(lat && lng){
			return new AV.GeoPoint(lat, lng);
		}
	}
};
