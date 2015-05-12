module.exports = function (id, includes){
	var query = new AV.Query(this);
	if(includes){
		query.include(includes);
	}
	return query.get(id).then(undefined, function (){
		return AV.E.E_NOT_EXISTS.attach({className: query.className, objectId: id});
	});
};
