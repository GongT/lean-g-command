// var AV = Object.AV;

module.exports = function (params, data){
	var type = params.__get('type', null, 0);
	var ajax = params.__get('ajax', null);
	if(!AV.CLS[type]){
		return '<script type="text/javascript">alert("未知数据库名：' + type + '");</script>';
	}
	try{
		var config = AV.CLS[type].dataTable;
		var columns = config.columnDefine;
		var search = config.search;
		var order = config.defaultOrder;
		var hId = config.humanReadableId || 'objectId';
		var updateRequestUrl = config.updateRequestUrl || undefined;
		
		var test = columns[0];
	} catch(e){
		return '<script type="text/javascript">alert("没有定义：\n' +
		       'AV.CLS.' + type + '.dataTable.columnDefine\n' +
		       'AV.CLS.' + type + '.dataTable.defaultOrder");' +
		       '</script>';
	}
	
	var id = 'DT' + data.guid;
	
	var columnsConfig = [];
	Object.keys(columns).forEach(function (key){
		var COL = columns[key];
		COL.key = key;
		
		var column = {
			"title"         : COL.title,
			"name"          : COL.title,
			"config"        : COL,
			"key"           : key,
			"data"          : key,
			"className"     : key,
			"defaultContent": "-"
		};
		
		columnsConfig.push(column);
	});
	columns = null;
	
	if(data._extendDataTableExtraColumn){
		data._extendDataTableExtraColumn.forEach(function (def){
			def.isStatic = def.className;
			def.data = null;
			def.className = '_static';
			var targets = -1;
			if(def.config.beforeKey){
				columnsConfig.some(function (d, i){
					if(d.className == def.config.beforeKey){
						targets = i;
						return true;
					}
				});
			}
			if(targets == -1){
				columnsConfig.push(def);
			} else{
				columnsConfig.splice(targets, 0, def);
			}
		});
		
		data._extendDataTableExtraColumn = undefined;
	}
	
	var columnKeyList = columnsConfig.map(function (column){
		return column.key || column.isStatic;
	});
	
	var DATA = {
		"id"               : id,
		"stateSave"        : true,
		"stateDuration"    : -1,
		"scrollX"          : true,
		"language"         : AV.CONSTANTS.DATA_TABLE_LANGUAGE_DATA,
		"processing"       : true,
		"serverSide"       : true,
		"destroy"          : true,
		"ajax"             : ajax,
		"updateRequestUrl" : updateRequestUrl,
		"columns"          : columnsConfig,
		"columnList"       : columnKeyList,
		"searchPlaceholder": search.placeholder,
		"humanReadableId"  : hId
	};
	
	if(order){
		var orderColumnIndex = DATA.columnList.indexOf(order[0]);
		if(orderColumnIndex){
			DATA.order = [orderColumnIndex, order[1]];
		} else{
			console.error('默认排序没有生效！！');
		}
	}
	
	var th = '';
	var tf = '';
	columnsConfig.forEach(function (column){
		th += '<th class="' + column.className + (column.isStatic? ' static' : '') + '">' + column.title + '</th>';
		var search;
		if(column.config && column.config.searchable){
			search = '<input style="width:100%" type="text" data-key="' + column.key +
			         '" placeholder="' + column.title + '">';
		} else{
			search = column.title;
		}
		tf += '<th class="' + column.className + (column.isStatic? ' static' : '') + '">' + search + '</th>';
	});
	return '<thead>' + th + '</thead>\n' +
	       '<tbody id="' + id + '">\n' +
	       '</tbody>\n' +
	       '<tfoot>' + tf + '</tfoot>\n' +
	       '<script type="text/javascript">\n' +
	       '    DataTableInit(' + JSON.stringify(DATA) + ');\n' +
	       '</script>\n' +
	       '<style type="text/css">.objectId{font-family: monospace, monospace}</style>';
};
