module.exports = function (page){
	var ctl = new AV.ExpressController;
	ctl.method = 'GET';
	ctl.main = function (rt){
		this.assign('input', rt.input);
		this.display(page);
	};
	return ctl;
};
