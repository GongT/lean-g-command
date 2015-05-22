var _ = require('util');
// var AV = Object.AV;
var console = new AV.Logger('ExpressController');
var express = AV.express;
var expressRoutersDebug = '';

module.exports = ExpressController;

function ExpressController(title){
	this._paths = [];
	this._prepares = [];
	this.method = 'GET';
	if(title){
		this.setTitle(title);
	}
}
ExpressController.prototype.setTitle = function (title){
	this.title = title;
	return this;
};

ExpressController.prototype.route = function (path, router){
	var m = this.method.toLowerCase();
	
	this._paths.forEach(function (name){
		path += '/:' + name;
	});
	
	if(AV.localhost){
		expressRoutersDebug += '\t' + path + '\n';
		console.debug(path + ' => ' + this.file);
	}
	if(this._prepares.length){
		router[m](path, init_runtime.bind(this), runPrepare.bind(this), runMain.bind(this));
	} else{
		router[m](path, init_runtime.bind(this), runMain.bind(this));
	}
};
ExpressController.prototype.prepare = function (name){
	var p = new PrepareFunction(name, this);
	this._prepares.push(p);
	return p;
};
ExpressController.prototype.main = function (){
	this.debug_send('<h1>Not implement</h1>');
};
ExpressController.prototype.__forceRun = function (req, rsp, finish){
	var seq;
	if(this._prepares.length){
		seq = [init_runtime, runPrepare, runMain];
	} else{
		seq = [init_runtime, runMain];
	}
	var self = this;
	next();
	
	function next(e){
		if(e){
			return rsp.runtime.displayError(e);
		}
		var cb = seq.shift();
		var n = seq.length? next : finish;
		cb.call(self, req, rsp, n)
	}
};

/* 程序执行逻辑 */
function runMain(req, rsp, next){
	rsp.runtime.next = next;
	try{
		this.main.call(rsp.runtime, rsp.runtime, req);
	} catch(e){
		// console.error('Main抛出异常: url=%s, error=%s', req.url, e.stack || e.message || e);
		rsp.runtime.displayError(e);
	}
}
function runPrepare(req, rsp, next){
	var rt = rsp.runtime;
	
	var last = this._prepares.length;
	var call_next = function (){
		if(last == 0){
			return next();
		}
	};
	
	this._prepares.forEach(function (prepare){
		prepare.run(rt, function (e){
			last--;
			if(e){
				last = -1; // never call others
				return next(e);
			}
			call_next();
		});
	});
}
/* 程序执行逻辑 END */

/* exports */
module.exports.parse = function (config, root){
	expressRoutersDebug = '';
	var stat = ExpressController;
	if(!stat.parsedConfig){
		stat.parsedConfig = {};
		stat.map = {};
	}
	_._extend(stat.parsedConfig, config);
	
	export_express_router(config, root || '/');
};

if(AV.localhost){
	Object.defineProperty(AV, 'expressRoutersDebug', {
		get: function (){
			process.stdout.write('\r' + expressRoutersDebug);
			global.repl.displayPrompt();
			return undefined;
		}
	});
}

function export_express_router(config, _path){
	var stat = ExpressController;
	var sortedUrlKey = Object.keys(config).sort(function (a, b){ // 依据url的当前part字母顺序排序，index一律放到最后
		if(a == 'index'){
			return 1;
		}
		if(b == 'index'){
			return -1;
		}
		// a = a.replace(/(^|\/)index($|\/)/, '$1$2');
		// b = b.replace(/(^|\/)index($|\/)/, '$1$2');
		if(a > b){
			return 1;
		} else if(a == b){
			return 0;
		} else{
			return -1;
		}
	});
	sortedUrlKey.forEach(function (name){
		var def = config[name];
		if(typeof def === 'string'){
			expressRoutersDebug += '\x1B[38;5;10m/' + def + ':\x1B[0m\n';
			// console.debug('/' + def);
			var cntl = require(def);
			cntl.file = def;
			cntl.path = _path + name;
			cntl.name = name;
			if(cntl instanceof ExpressController){
				if(name == 'index'){
					cntl.route(_path.replace(/\/$/, '') || '/', AV.server);
				}
				cntl.route(_path + name, AV.server);
				stat.map[_path + name] = cntl;
			} else if(AV.localhost){
				expressRoutersDebug += '\t' + _path + name + ' => not implement\n';
				console.warn('%s => not implement', _path + name);
			} else{
				expressRoutersDebug += '\tError: not implement express path ' + +_path + name + '\n';
				console.warn('Error: not implement express path ' + _path + name);
			}
		} else{
			export_express_router(def, _path + (name? name + '/' : ''));
		}
	})
}
/* exports END */

/* 运行环境 */
function InputHanler(rt, req, rsp){ // 输入与请求类型不符（比如get请求里读取post参数）的错误处理
	this.parent = rt;
	Object.defineProperties(this, {
		__req: {
			value     : req,
			enumerable: false
		},
		__rsp: {
			value     : rsp,
			enumerable: false
		}
	});
}
Object.defineProperties(InputHanler.prototype, {
	post  : {
		get: function (){
			if(this.parent.method == 'POST' || this.parent.method == 'ALL' || this.parent.method == 'PUT'){
				if(!this.__post){
					this.__post = new AV.InputChecker(this.__req.body);
				}
				return this.__post;
			} else if(AV.localhost){
				console.trace('试图从`' + this.parent.method + '`请求中获取POST数据');
			}
			throw new ReferenceError('试图从GET请求中获取POST数据');
		}
	},
	path  : {
		get: function (){
			if(this.__path){
				return this.__path;
			}
			if(AV.localhost){
				console.trace('请求path数据，但没有定义任何参数');
			}
			throw new ReferenceError('请求path数据，但没有定义任何参数');
		},
		set: function (v){
			this.__path = v;
		}
	},
	pager : {
		value: function (minCount, maxCount){
			if(this.__pager){
				return this.__pager;
			}
			if(!minCount){
				minCount = 5;
			}
			if(!maxCount){
				maxCount = 50;
			}
			var p = {
				cursor: this.get.optionalNumber('cursor', 0),
				count : this.get.optionalNumber('count', minCount),
				apply : function (avquery){
					avquery.skip(this.cursor);
					avquery.limit(this.count);
				},
				assign: function (data){
					data.cursor = this.cursor;
					data.count = this.count;
					return data;
				}
			};
			if(p.count < minCount && p.count > maxCount){
				throw new AV.E.E_INPUT_INVALID_PAGER;
			}
			return this.__pager = p;
		}
	},
	header: {
		get: function (){
			return this.__header ||
			       (this.__header = {
				       isXhr        : !!this.__req.xhr,
				       method       : this.__req.method,
				       ContentType  : this.__req.headers['content-type'],
				       Origin       : this.__req.headers['origin'],
				       Referer      : this.__req.headers['referer'],
				       UserAgent    : this.__req.headers['user-agent'],
				       Host         : this.__req.headers['host'],
				       url          : this.__req.url,
				       remoteAddress: this.__req.headers['x-real-ip']
			       });
		}
	}
});

function init_runtime(req, rsp, next){ // 初始化 请求环境
	var rt = rsp.runtime = new ExpressControllerRuntime(req, rsp);
	rt.input = new InputHanler(this, req, rsp);
	rt.input.get = new AV.InputChecker(req.query);
	if(this._paths.length){
		rt.input.path = new AV.InputChecker(req.params);
	}
	rt.input.cookie = req.cookies;
	rt.input.scookie = req.signedCookies || {};
	// rt.input.session = req.session;
	return next();
}

function ExpressControllerRuntime(req, rsp){ // 请求环境
	this.__rsp = rsp;
	this.__req = req;
	this._tVar = {status: 0};
}
ExpressControllerRuntime.prototype.localhost = AV.localhost;
ExpressControllerRuntime.prototype.setCookie = function (name, value, expire, path, domain, secure, httponly, signed){
	if(typeof expire === 'number'){
		if(expire < 1000){
			expire = new Date(Date.now() + 1000*60*60*24*expire);
		} else if(expire < 9000000000){
			expire = new Date(expire*1000);
		} else{
			expire = new Date(expire);
		}
	}
	return this.__rsp.cookie(name, value, {
		domain  : domain || AV.CONFIG.cookieDomain || undefined,
		path    : path || AV.CONFIG.cookiePath || '/',
		secure  : secure || false,
		httpOnly: httponly || false,
		expires : expire,
		signed  : signed
	});
};
ExpressControllerRuntime.prototype.setSecureCookie = function (name, value, expire, path, domain, secure, httponly){
	this.setCookie(name, value, expire, path, domain, secure, httponly, true);
};

ExpressControllerRuntime.prototype.displayError = function (e, template){ // 显示一个错误页面
	if(this.__req.xhr){
		if(e instanceof AV.ApiError){
			this._tVar = e.toStrongJSON();
		} else if(e && e.hasOwnProperty('status')){
			this._tVar = e;
		} else if(e instanceof Error){
			this._tVar = {
				status : AV.E.E_SERVER.code,
				message: AV.E.E_SERVER.message,
				name   : AV.E.E_SERVER.name,
				data   : e
			};
			console.error(e.stack);
		} else{
			this._tVar = AV.E.E_SERVER.data(e).toStrongJSON();
		}
		this.json();
	} else{
		if(e instanceof AV.ApiError){
			this.assign('error', e.toStrongJSON());
			this.display(template || AV.CONFIG.template.standardErrorPage);
		} else if(e instanceof Error){
			console.error(e.stack);
			this.assign('error', e);
			this.display(template || AV.CONFIG.template.internalErrorPage);
		} else{
			this.assign('error', e);
			this.display(template || AV.CONFIG.template.userErrorPage);
		}
	}
};
ExpressControllerRuntime.prototype.assign = function (name, value){ // 变量赋值
	if(arguments.length == 1){
		if(name instanceof AV.Object){
			_._extend(this._tVar, name.toJSON());
		} else{
			for(var n in name){
				this.assign(n, name[n])
			}
		}
	} else{
		if(value instanceof AV.Object){
			this._tVar[name] = value.toJSON();
		} else if(Array.isArray(value) && value[0] instanceof AV.Object){
			this._tVar[name] = value.map(function (value){
				return value instanceof AV.Object? value.toJSON() : value;
			});
		} else{
			this._tVar[name] = value;
		}
	}
	return this;
};
ExpressControllerRuntime.prototype.display = function (template){ // 显示指定模板
	if(this._templateName){
		delete this._templateName;
		throw AV.E.E_SERVER.data('Call runtime.display(' + template + ') twice in single request. Last call: ' +
		                         this._templateName + '\n' + this._last_call_stack + '\n=============');
	}
	this._templateName = template;
	this._last_call_stack = (new Error).stack;
	
	var self = this;
	var response = self.__rsp;
	self._tVar.runtime = this;
	self._tVar['SCOOKIE'] = self.input.scookie;
	self._tVar['COOKIE'] = self.input.cookie;
	self._tVar['_beforeTemplate'] = Date.now();
	
	response.render(template, self._tVar, function (err, body){
		if(err){
			console.error('模板错误：' + err.stack);
			self._tVar.error = err;
			response.render(AV.CONFIG.template.internalErrorPage, self._tVar, function (err2, body){
				if(err2){
					console.error('致命错误：无法渲染并显示内部错误页面\n' + err2.stack);
					response.send('<h1>' + err.message + '</h1>');
				} else{
					response.send(404, body.trim().replace(/\[__reqEndTime__\]/, Date.now()));
				}
			});
		} else{
			response.send(body.trim().replace(/\[__reqEndTime__\]/, Date.now()));
		}
	});
};

ExpressControllerRuntime.prototype.json = function (){
	if(!this._tVar['status']){
		this._tVar['status'] = 0;
	}
	this.__rsp.send(this._tVar);
	return this;
};
ExpressControllerRuntime.prototype.redirect = function (path, status){
	if(!~path.indexOf('://') && 0 != path.indexOf('//')){
		path = AV.site_url(path);
	}
	console.debug('重定向到：%s', path);
	this.__rsp.location(path);
	// 302=temp  301=perma
	this.__rsp.status(status || 302).send('<h1>redirect to <a href="' + path + '">' + path + '</a></h1>');
	return this;
};
ExpressControllerRuntime.prototype.debug_send = function (data, contentType){
	this.__rsp.set('Content-Type', (contentType || 'text/html; charset=utf-8'));
	this.__rsp.send(data);
	return this;
};
_._extend(ExpressControllerRuntime.prototype, AV.InputChecker.prototype); // 这一行似乎想多了
Object.defineProperty(ExpressControllerRuntime.prototype, 'defaultError', {
	get: function (){
		return this._defaultError || (this.defaultError = this._defaultError = function (e){
					this.displayError(e);
				}.bind(this));
	}
});
/* 运行环境 END */

/* 读取参数并处理 */
function PrepareFunction(name, controller){
	this._functions = [];
	this.name = name;
	this._controller = controller;
}
PrepareFunction.prototype.from = function (method, name, type){ // get, post, cookie, path, scookie
	var method_name = method.toLowerCase();
	if(method_name == 'path'){
		this._controller._paths.push(name);
	} else if(method_name == 'cookie' || method_name == 'scookie'){
		var cookie = method_name;
		method_name = null;
	} else if(method_name != 'get' && method_name != 'post'){
		if(arguments.length == 2){
			type = name;
			name = method;
			method_name = this._controller.method.toLowerCase();
		} else{
			AV.fatal('未知的输入源：' + method_name);
		}
	}
	if(method_name){
		if(type){
			var uctype = 'require' + type.replace(/^./, function (m){
						return m.toUpperCase();
					});
			if(!AV.InputChecker.prototype[uctype]){
				AV.fatal('未知的输入类型：' + this._controller.file + ' -> ' + uctype);
			}
		} else{
			uctype = 'requireAnything';
		}
		this._functions.push(function (){
			// console.info('this.input.%s.%s(%s)', method_name, uctype, name);
			return this.input[method_name][uctype](name);
		});
	} else{
		this._functions.push(function (){
			// console.debug('this.input.%s[%s]', cookie, name);
			return this.input[cookie][name];
		});
	}
	return this;
};
PrepareFunction.prototype.by = function (fn){
	this._functions.push(fn);
	return this;
};
PrepareFunction.prototype.process = function (fn){
	this._functions.push(fn);
	return this;
};
PrepareFunction.prototype.error_callback = function (ret){
	return this.displayError(ret);
};
PrepareFunction.prototype.els = function (fn){
	this.error_callback = fn;
	return this;
};
PrepareFunction.prototype.run = function (runtime, next){
	var i = 0;
	var list = this._functions;
	var commit = this.name;
	var error_callback = this.error_callback;
	var memory = [runtime.__rsp];
	real_run(i);
	function real_run(i){
		var fn = list[i];
		if(!fn){
			if(memory.length > 1){
				throw new Error('controller.prepare 返回超过一个对象');
			}
			var data = memory[0];
			if(undefined === data){
				data = AV.E.E_NOT_EXISTS;
			}
			if(data instanceof AV.ApiError){
				data = error_callback.call(runtime, data);
				if(!data){
					return;
				}
			}
			runtime[commit] = data;
			return next();
		}
		try{
			var ret = fn.apply(runtime, memory);
		} catch(e){
			runtime[commit] = error_callback.call(runtime, e);
			if(runtime[commit]){
				return next();
			} else{
				return;
			}
		}
		if(undefined === ret){
			ret = AV.E.E_NOT_EXISTS;
		}
		if(typeof ret == 'object' && ret instanceof AV.ApiError){
			runtime[commit] = error_callback.call(runtime, ret);
			if(runtime[commit]){
				return next();
			} else{
				return;
			}
		}
		if(Array.isArray(ret) && AV.Promise.is(ret[0])){
			ret = AV.Promise.when(ret);
		}
		if(AV.Promise.is(ret)){
			ret.then(function (){
				memory = arguments;
				real_run(i + 1);
			}, function (e){
				runtime[commit] = error_callback.call(runtime, e);
				if(runtime[commit]){
					next();
				} else{
					return e;
				}
			});
		} else{
			memory = [ret];
			real_run(i + 1);
		}
	}
};
/* 读取参数并处理 END */
