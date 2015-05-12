module.exports = function (what, eqto, includes){
	var query = new AV.Query(this);
	if(includes){
		query.include(includes);
	}
	return query.first().then(function (data){
		if(data){
			return data;
		}
		return AV.Promise.error(AV.E.E_NOT_EXISTS.attach({
			className  : query.className,
			uniqueField: what,
			equalTo    : eqto
		}));
	}, function (){
		return AV.E.E_NOT_EXISTS.attach({className: query.className, uniqueField: what, equalTo: eqto});
	});
};
