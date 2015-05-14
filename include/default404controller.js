module.exports = function (page){
	var ctl = new AV.ExpressController;
	ctl.method = 'GET';
	ctl.main = function (){
		this.display(page);
	};
	return ctl;
};
