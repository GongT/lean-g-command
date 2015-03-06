module.exports = function (id){
	return AV.Object.createWithoutData(this.className, id);
};
