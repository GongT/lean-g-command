module.exports = function (page){
	var ctl = new AV.ExpressController;
	ctl.method = 'GET';
	ctl.main = function (rt){
		if(rt.input.header.isXhr){
			this.assign('status', 1);
			this.assign('message', '页面不存在~');
			this.json();
		} else{
			this.assign('input', rt.input);
			this.display(page);
		}
	};
	return ctl;
};
