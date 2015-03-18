var _need_update = {};
var updater = {
	none : function (){
		this.every(false);
	},
	every: function (v){
		for(var i in global.update){
			updater[i] = v || true;
		}
	}
};

function update_config(){
	for(var n in _need_update){
		if(updater[n] === true){
			updater[n] = false;
			global.update[n]();
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
				return global.update[i];
			}
		},
		set         : function (v){
			_need_update[i] = v;
			prepare_update();
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
