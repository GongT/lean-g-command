function DataTableInit(CONFIG){
	function fnCreatedCell(nTd, sData, oData, iRow, iCol){
		$(nTd).data('columnKey', CONFIG.columnList[iCol]);
	}
	
	var id = CONFIG.id;
	var $p = $('#' + id).parent();
	console.log('创建DataTables: %O', CONFIG);
	var fieldKeyMap = {};
	
	CONFIG.columns.forEach(function (data){
		if(data.isStatic){
			return;
		}
		
		var CFG = data.config;
		var lKeyName = CFG.key.toLowerCase();
		var fnName = 'render_' + lKeyName;
		if(window[fnName]){
			data.render = window[fnName];
		} else if(CFG.type){
			if(DataTableInit.renders[CFG.type]){
				data.render = DataTableInit.renders[CFG.type].bind(undefined, CFG.typeConfig);
			} else{
				console.error('未知类型：%s，列名：%s - %s', CFG.type, CFG.key, CFG.title);
			}
		}
		data.fnCreatedCell = fnCreatedCell;
		fieldKeyMap[lKeyName] = data;
	});
	$p.trigger('config', [CONFIG]);
	
	CONFIG.fnInitComplete = function (dt){
		var $sinput = $(dt.nTableWrapper).find('.dataTables_filter input[type=search]').attr("placeholder", CONFIG.searchPlaceholder).unbind().on('keyup', function (e){
			if(e.keyCode == 13){
				$p.fnFilter(this.value);
				return false;
			}
		});
		var $clear = $('<button class="btn btn-info btn-sm" style="margin-right: 5px">').text('取消筛选').click(function (){
			api.search('');
			$sinput.val('');
			
			api.order(CONFIG.order);
			
			api.columns()[0].forEach(function (columnIndex){
				var column = api.column(columnIndex);
				column.search('');
				$(column.footer()).find('input').val('');
			});
			api.draw();
		});
		$(dt.nTableWrapper).find('.dataTables_filter').prepend($clear);
		$(dt.nTableWrapper).find('.dataTables_scrollFoot th> input').on('keyup', function (e){
			var columnClass = '.' + $(this).data('key');
			// console.debug('dataTable: search column %s value %s.', columnClass, this.value);
			api.column(columnClass).search(this.value);
			
			if(e.keyCode == 13){
				api.draw();
			}
		});
		
		restore.dt = dt;
		restore();
	};
	CONFIG.fnStateSaveParams = function (s, oData){
		if(!lastHasData){
			oData.search.search = '';
		}
	};
	CONFIG.stateLoaded = function (settings, data){
		restore.stateLoaded = true;
		restore();
	};
	function restore(){
		if(restore.dt && restore.stateLoaded){
			$(restore.dt.nTableWrapper).find('.dataTables_scrollFoot th').each(function (i, e){
				var a = api.column(i);
				var s = a.search();
				if(s){
					$(a.footer()).find('input').val(s);
				}
			});
		}
	}
	
	CONFIG.createdRow = function (row, data){
		$(row).data(data).data('hName', data[CONFIG.humanReadableId]);
	};
	
	var lastHasData;
	$p = $p.dataTable(CONFIG);
	var api = $p.api();
	$p.on('xhr.dt', function (e, settings, json, xhr){
		lastHasData = json.data.length;
		if(CONSTANT.isDebugEnv){
			console.log('DataTables获取数据: %O', json);
		} else{
			console.log('DataTables获取数据: %s', json.data.length);
		}
	});
	
	$p.on('click touchstart', 'tbody td:not(._static)', function (){
		var key = $(this).data('columnKey');
		if(key){
			var range = document.createRange();
			range.selectNodeContents(this);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	});
	$p.on('dblclick', 'tbody td:not(._static)', function (){
		var $td = $(this);
		var key = $td.data('columnKey');
		if(!key){
			return;
		}
		var lKeyName = key.toLowerCase();
		var $row = $td.parent();
		var rData = $row.data();
		var value = rData[key];
		
		var config = fieldKeyMap[lKeyName] || {};
		$td.render = config.mRender || $td.html;
		var url;
		if(config.updateUrl){
			url = config.updateUrl;
		} else if(CONFIG.updateRequestUrl){
			url = CONFIG.updateRequestUrl;
		} else{
			url = CONFIG.ajax;
		}
		
		if(config){
			config = config.config;
		}
		
		var e = new $.Event('edit', {
			ajax    : url,
			config  : config,
			objectId: rData.id,
			key     : key,
			lkey    : lKeyName,
			value   : value,
			rData   : rData
		});
		$td.trigger(e);
		if(e.isDefaultPrevented()){
			return;
		}
		if(!config || !config.editable){
			console.warn('双击的单元格“%s”没有数据类型', key);
			return;
		}
		var fnEdit = DataTableInit.editor[config.type];
		if(fnEdit){
			fnEdit.call($td, e.ajax, e.config.typeConfig, e.config, e.rData.objectId, e.key, e.lkey, e.value, e.rData);
		} else{
			console.warn('对双击的单元格“%s”数据类型“%s”没有默认的处理工具', key, config.type);
		}
	});
}

DataTableInit.renders = {
	'image'   : function (config, value){
		if(value){
			return '<a href="javascript:showModalImage(\'' + value + '\')">查看</a>';
		} else{
			return '<a>未上传</a>';
		}
	},
	'bool'    : function (config, value){
		if(value === true){
			return config[0];
		} else if(value === false){
			return config[1];
		} else{
			return '<a style="background:red;">错误: ' + value + '</a>';
		}
	},
	'enum'    : function (config, value){
		if(value || config[value]){
			return config[value];
		} else{
			return '<a style="background:red;">错误: ' + value + '</a>';
		}
	},
	'date'    : function (config, value){
		if(!value){
			return undefined;
		}
		if(!config){
			config = 'Y-m-d H:i'
		}
		if(!(value instanceof Date)){
			if(typeof value === 'string'){
				value = new Date(value);
			} else if(value && value.iso){
				value = new Date(value.iso);
			} else{
				return '<a style="background:red;">错误时间: ' + value + '</a>';
			}
		}
		
		var pad = function (v){
			return v > 10? v : '0' + v;
		};
		return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate()) + ' ' +
		       pad(value.getHours()) + ':' + pad(value.getMinutes());
	},
	'longtext': function (config, value, dis, row){
		if(value){
			return '<a href="javascript:showModalDialog(\'/engineer/popupeditor/' + row.objectId + '\')">查看</a>';
		} else{
			return '<a>未上传</a>';
		}
	}
};

DataTableInit.editor = {
	'image'   : function (url, typeConfig, config, objectId, key, lKeyName, value, rData){
		
	},
	'bool'    : function (url, typeConfig, config, objectId, key, lKeyName, value, rData){
		
	},
	'enum'    : function (url, typeConfig, config, objectId, key, lKeyName, value, rData){
		var $sel = $('<select>').attr('name', key);
		var maxWidth = 3;
		for(var varVal in typeConfig){
			var show = typeConfig[varVal];
			maxWidth = Math.max(maxWidth, show.length);
			$('<option>').attr('value', varVal).text(show).appendTo($sel);
		}
		__show_editor_dialog(url, typeConfig, config, objectId, key, value, rData, $sel, ( maxWidth + 2) + 'em', '2em');
	},
	'date'    : function (url, typeConfig, config, objectId, key, lKeyName, value, rData){
		
	},
	'longtext': function (url, typeConfig, config, objectId, key, lKeyName, value, rData){
		var html = $();
	}
};

function __show_editor_dialog(url, typeConfig, config, objectId, key, current, rData, html, w, h){
	if(typeConfig.editorUrl){
		showModalDialog(url + '?objectId=' + objectId);
	} else{
		var $form = $('<form>').attr({
			type  : 'ajax',
			method: 'post',
			action: url
		});
		
		$form.append($('<input>').attr({name: '_verify', type: 'hidden'}).val(current));
		$form.append($('<input>').attr({name: 'objectId', type: 'hidden'}).val(objectId));
		$form.append($('<input>').attr({name: 'key', type: 'hidden'}).val(key));
		$form.append(html);
		var d = dialog({
			title      : '修改 ' + rData['hName'] + ' 的 ' + config.title,
			content    : $form,
			height     : h || '320px',
			width      : w || '480px',
			okValue    : '确定',
			ok         : function (){
				$form.submit();
				return false;
			},
			cancelValue: '取消',
			cancel     : function (){
				d.remove();
			}
		}).showModal();
	}
}
