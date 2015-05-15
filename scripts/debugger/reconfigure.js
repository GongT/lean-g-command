var need_update = {};

function update_config(){
	ppTir = false;
	for(var n in need_update){
		if(need_update[n] === true){
			global.update[n]();
			need_update[n] = false;
		}
	}
}

var ppTir;
function prepare_update(){
	if(ppTir){
		return;
	}
	ppTir = setImmediate(update_config)
}

module.exports = function (name){
	if(name == 'none'){
		need_update = {};
		return clearImmediate(ppTir);
	}
	if(name == 'all'){
		name = 'everything';
	}
	
	need_update[name] = true;
	prepare_update();
};

module.exports.none = function (){
	need_update = {};
};
module.exports.all = function (){
	global.update.everything();
};
