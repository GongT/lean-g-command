module.exports = function (params, template, data, repeat){
	if(repeat.value){
		return;
	}
	var beforeKey = params.__get('insertBefore');
	var title = params.__get('title', null, 0);
	var className = params.__get('className', null);
	
	if(!data._extendDataTableExtraColumn){
		data._extendDataTableExtraColumn = [];
	}
	var def = {
		"title"         : title,
		"name"          : title,
		"config"        : {beforeKey: beforeKey},
		"data"          : null,
		"className"     : className,
		"defaultContent": template
	};
	data._extendDataTableExtraColumn.push(def);
	return '';
};
module.exports.type = 'block';
