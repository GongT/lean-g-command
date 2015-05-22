module.exports = function (app){
	/*app.use(function (req,rsp,next){
		console.log(req)
		next();
	});*/
	var extraMenu = [];
	for(var x in AV.ExpressController.map){
		var d = AV.ExpressController.map[x];
		if(d && d.path && d.title && /^\/avos\/n/.test(d.path)){
			extraMenu.push({
				path : d.path,
				title: d.title
			});
		}
	}
	
	var ctl;
	
	// 首页信息展示
	ctl = new AV.ExpressController;
	ctl.method = 'GET';
	ctl.main = function (){
		this.assign('extraMenuList', extraMenu);
		this.display(AV.INTERNAL_TEMPLATE + 'debugger/index.tpl');
	};
	ctl.route('/avos/n', app);
	
	// 云代码调试
	ctl = new AV.ExpressController;
	ctl.method = 'GET';
	ctl.main = function (){
		this.assign('extraMenuList', extraMenu);
		this.display(AV.INTERNAL_TEMPLATE + 'debugger/cloudcode.tpl');
	};
	ctl.route('/avos/n/cloudcode', app);
	
	// 触发器调试
	ctl = new AV.ExpressController;
	ctl.method = 'GET';
	ctl.main = function (){
		this.assign('extraMenuList', extraMenu);
		this.display(AV.INTERNAL_TEMPLATE + 'debugger/trigger.tpl');
	};
	ctl.route('/avos/n/trigger', app);
};
