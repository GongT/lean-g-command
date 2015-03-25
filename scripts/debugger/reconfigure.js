var _need_update = {};
var updater = {
	none: function (){
		_need_update = {};
	},
	all : function (){
		global.update.everything();
	}
};

function update_config(){
	ppTir = false;
	for(var n in _need_update){
		if(_need_update[n] === true){
			updater[n]();
		}
	}
}

Object.keys(global.update).forEach(function (i){
	Object.defineProperty(updater, i, {
		enumerable  : true,
		configurable: false,
		get         : function (){
			return function (){
				_need_update[i] = false;
				return global.update[i]();
			}
		},
		set         : function (v){
			_need_update[i] = v;
			if(v){
				prepare_update();
			}
		}
	});
});

updater.none();

var ppTir;
function prepare_update(){
	if(ppTir){
		return;
	}
	ppTir = setImmediate(update_config)
}

module.exports = updater;
