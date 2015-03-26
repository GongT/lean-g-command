// var AV = Object.AV;
module.exports = CloudClodeWrapper;
module.exports.CallbackList = CallbackList;
module.exports.Arguments = ArgumentsWrapper;
var console = new AV.Logger('CloudCodeWrapper');

var define_fn = AV.Cloud.define;
AV.Cloud.define = function (name, fn){
	if(fn.setTitle){
		fn.setTitle(name);
	} else{
		console.error('云代码%s没有用CloudClodeWrapper', name);
	}
	return define_fn(name, fn);
};

function ArgumentsWrapper(args){
	if(this instanceof ArgumentsWrapper){
		this.args = args;
	} else{
		return new ArgumentsWrapper(args);
	}
}

function CallbackList(){
	this.fnList = [];
}
CallbackList.prototype.process = function (fn){
	assert(fn);
	this.fnList.push(function (data){
		var ret;
		try{
			if(data instanceof ArgumentsWrapper){
				ret = fn.apply(this, data.args);
			} else{
				ret = fn.apply(this, arguments);
			}
		} catch(e){
			return AV.Promise.error(e);
		}
		if(ret instanceof Error || ret instanceof AV.ApiError){
			return AV.Promise.error(ret);
		}
		return ret;
	});
	this.lastcallback = undefined;
	return this;
};
CallbackList.prototype.next = function (fn){
	assert(fn);
	this.fnList.push(function (data){
		var ret;
		try{
			if(data instanceof ArgumentsWrapper){
				ret = fn.apply(this, data.args);
			} else{
				ret = fn.apply(this, arguments);
			}
		} catch(e){
			return AV.Promise.error(e);
		}
		if(fn.hasNext && ret === undefined){
			return AV.Promise.error(AV.E.E_EMPTY_RETURN);
		}
		if(AV.Promise.is(ret)){
			if(selfFunction._on_error){
				var self = this;
				ret = ret.then(undefined, function (){
					return selfFunction._on_error.apply(self, arguments);
				});
			}
		}
		if(ret instanceof Error || ret instanceof AV.ApiError){
			return AV.Promise.error(ret);
		}
		return ret;
	});
	if(this.lastcallback){
		this.lastcallback.hasNext = true;
	}
	var selfFunction = this.lastcallback = this.fnList[this.fnList.length - 1];
	return this;
};

CallbackList.prototype.on_error = function (fn){
	if(!this.lastcallback){
		throw new Error("[" + this.__title__ + "]fail_trigger_error() 必须在 next() 或 check() 后立刻调用");
	}
	if(typeof fn != 'function'){
		throw new TypeError("[" + this.__title__ + "]error_handler() 需要一个函数");
	}
	this.lastcallback._on_error = fn;
	return this;
};
CallbackList.prototype.fail_trigger_error = function (e){
	if(!this.lastcallback){
		throw new Error("[" + this.__title__ + "]fail_trigger_error() 必须在 next() 或 check() 后立刻调用");
	}
	if(!(e instanceof AV.ApiError)){
		throw new TypeError("[" + this.__title__ + "]error_handler() 需要一个ApiError");
	}
	this.lastcallback._t_error = e;
	return this;
};

function _check_helper(ret, args, error_value, stack){
	if(ret === true){
		return args;
	} else if(ret instanceof Error || ret instanceof AV.ApiError){
		return AV.Promise.error(ret);
	} else{
		if(error_value){
			return AV.Promise.error(error_value);
		}
		console.error('没有正确编写checker函数，只能返回true/false/ApiError，而实际返回了：' + ret + '\n\t\t这个函数定义在了 ' + stack);
		return AV.Promise.error(AV.E.E_CHECK_FAIL);
	}
}
CallbackList.prototype.check = function (fn){
	assert(fn);
	if(AV.localhost){
		var stack = (new Error).stack.split(/\n/g)[2];
		if(stack){
			if(/\/.+\.js/.test(stack)){
				stack = /\/.+\.js([0-9:]+)?/.exec(stack)[0]
			}
		}
		if(!stack){
			stack = '';
		}
	}
	this.fnList.push(function (data){
		var ret, saveArg;
		if(arguments.length > 1){
			saveArg = new ArgumentsWrapper(arguments);
		} else{
			saveArg = data;
		}
		if(data instanceof ArgumentsWrapper){
			ret = fn.apply(this, data.args);
		} else{
			ret = fn.apply(this, arguments);
		}
		if(AV.Promise.is(ret)){
			return ret.then(function (ret){
				return _check_helper(ret, saveArg, selfFunction._t_error, stack);
			});
		} else{
			return _check_helper(ret, saveArg, selfFunction._t_error, stack);
		}
	});
	var selfFunction = this.lastcallback = this.fnList[this.fnList.length - 1];
	return this;
};
CallbackList.prototype.fork = function (testFn){
	assert(testFn);
	this.fnList.push(function (data){
		var args;
		if(data instanceof ArgumentsWrapper){
			args = data.args;
		} else{
			args = arguments;
		}
		try{
			var tree = testFn.apply(this, args);
		} catch(e){
			return AV.Promise.error(e);
		}
		if(tree instanceof Error || tree instanceof AV.ApiError){
			return AV.Promise.error(tree);
		}
		if(!tree){
			if(args.length > 1){
				return new ArgumentsWrapper(args);
			} else{
				return data;
			}
		}
		return CallbackList.create_instance(tree, args, this).then(function (e){ // 无视所有参数，恢复以前的
			if(e instanceof Error || e instanceof AV.ApiError){
				return AV.Promise.error(e);
			}
			if(args.length > 1){
				return new ArgumentsWrapper(args);
			} else{
				return data;
			}
		});
	});
	this.lastcallback = undefined;
	return this
};
CallbackList.create_instance = function (clist, args, runtime){
	if(!clist.fnList){
		console.error('CallbackList.create_instance 错误', clist);
		return AV.Promise.error(AV.E.E_SERVER);
	}
	var p = new AV.Promise;
	p.resolve.apply(p, args);
	
	if(!runtime){
		runtime = {};
	}
	
	clist.fnList.forEach(function (cb){
		p = p.then(cb.bind(runtime));
	});
	
	return p;
};
CallbackList.prototype.create_instance = function (args, runtime){
	return CallbackList.create_instance(this, args, runtime);
};
CallbackList.prototype.getFunction = function (){
	var self = this;
	return function (){
		return CallbackList.create_instance(self, arguments, this);
	};
};

function CloudClodeWrapper(module){
	this._call_list = new CallbackList();
	this.fnList = this._call_list.fnList;
	if(module && module.exports){
		this.exports(module);
	}
	this.__title__ = '';
}
CloudClodeWrapper.prototype = CallbackList.prototype;
CloudClodeWrapper.prototype.exports = function (module){
	if(arguments.length == 1){
		arguments[1] = 'exports';
	}
	module[arguments[1]] = this.runner.bind(this);
	module[arguments[1]].setTitle = (function (title){
		this.__title__ = title;
	}).bind(this);
};
CloudClodeWrapper.prototype.runner = function (req, rsp){
	var self = this;
	var title = self.__title__;
	// console.log('getTitle(%s)', title);
	var chk = new AV.InputChecker(req.params);
	var runtime = new CloudCodeRuntime;
	var p = CallbackList.create_instance(this._call_list, [chk], runtime);
	
	p.then(function (data){
		if(data instanceof ArgumentsWrapper || arguments.length > 1){
			rsp.error('[' + title + '] 处理链没有正确结束');
		} else if(data){
			if(runtime._return){
				runtime.standard_return_data_array(data);
				rsp.success(runtime._return);
			} else{
				if(!data.hasOwnProperty('status')){
					data.status = 0;
				}
				rsp.success(data);
			}
		} else if(runtime._return){
			rsp.success(runtime._return);
		} else{
			rsp.error('[' + title + ']没有返回任何数据');
		}
	}, function (e){
		if(Array.isArray(e)){
			for(var i = 0; i < e.length; i++){
				if(e[i]){
					e = e[i];
					break;
				}
			}
		}
		if(e instanceof AV.ApiError){
			if(e.status != AV.E.E_SUCCESS.code){
				console.warn('云代码[' + title + ']返回非0状态 - ' + e.stringify());
			}
			e.response(rsp);
		} else if(e instanceof Error){
			console.error('编程错误：云代码[' + title + ']抛出异常 - ' + e.stack);
			rsp.error('编程错误：云代码[' + title + ']抛出异常 - ' + e.message);
		} else{
			console.error('云代码[' + title + ']返回字符串错误 - ' + (e.stack || e.message || e));
			rsp.error(e);
		}
	});
};

function CloudCodeRuntime(){
}
CloudCodeRuntime.prototype._return = false;
CloudCodeRuntime.prototype.standard_return_status = function (status){
	if(this._return){
		this._return.status = status;
	} else{
		this._return = {status: status};
	}
};
CloudCodeRuntime.prototype.standard_return_data = function (name, value){
	if(!this._return){
		this._return = {status: 0};
	}
	this._return[name] = value;
};
CloudCodeRuntime.prototype.standard_return_data_array = function (data){
	if(!this._return){
		this._return = {status: 0};
	}
	if(data instanceof AV.Object){
		data = data.toJSON();
	}
	for(var i in data){
		if(data.hasOwnProperty(i)){
			this._return[i] = data[i];
		}
	}
};

function assert(bool){
	if(typeof bool != 'function'){
		throw new TypeError('CallbackList 参数不是函数');
	}
}
