module.exports = function (id){
	return AV.Object.createWithoutData(exports.className, id);
};
