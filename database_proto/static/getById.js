module.exports = function (id, includes){
	var query = new AV.Query(this);
	if(includes){
		includes.forEach(query.include, query)
	}
	return query.get(id);
};
