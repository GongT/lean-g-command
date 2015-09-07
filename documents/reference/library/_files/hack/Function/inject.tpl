module.exports = function (this_arg){
	var fn = this;
	var before, after;
	var injector = function (){
		if(!this_arg){
			this_arg = this;
		}
		if(before){
			before.forEach(function (before){
				before.apply(this_arg, arguments);
			});
		}
		var ret = fn.apply(this_arg, arguments);
		
		if(after){
			var l = Array.prototype.push.call(arguments, ret) - 1;
			after.forEach(function (after){
				ret = after.apply(this_arg, arguments);
				if(ret !== undefined){
					arguments[l] = ret;
				}
			});
			return arguments[l];
		}
		return ret;
	};
	injector.before = function (fn){
		if(!before){
			before = [];
		}
		before.unshift(fn);
		return injector;
	};
	injector.after = function (fn){
		if(!after){
			after = [];
		}
		after.push(fn);
		return injector;
	};
	
	return injector;
};
