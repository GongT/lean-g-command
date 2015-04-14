if(AV.isDebugEnv){
	module.exports = function (params){
		var data = params.__get(false, null, 0);
		// console.log('call %s(%s)', fn, args.join(', '));
		return JSON.stringify(data, null, 8);
	};
}else{
	module.exports = function (params){
		var data = params.__get(false, null, 0);
		// console.log('call %s(%s)', fn, args.join(', '));
		return JSON.stringify(data);
	};
}
