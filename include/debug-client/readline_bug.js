var savedFn;
module.exports = function (fn){
	// savedFn = fn.complete;
	// repl.complete = completer;
};

function completer(line, callback){
	// console.log('call completion with line %s', line);
	savedFn.call(repl, line, function (err, cpldata){
		if(err){
			// console.log('callback with error %s', line);
		} else{
			var ava = cpldata[0];
			if(ava.length > 1){
				handleGroup(ava);
				callback(undefined, [[], '']);
				return;
			}
		}
		callback(err, cpldata);
	});
}

function handleGroup(completions){
	var write = process.stdout.write.bind(process.stdout);
	write('\r\n');
	var width = completions.reduce(function (a, b){
				return a.length > b.length? a : b;
			}).length + 2;  // 2 space padding
	var maxColumns = Math.floor(process.stdout.columns/width) || 1;
	var group = [], c;
	for(var i = 0, compLen = completions.length; i < compLen; i++){
		c = completions[i];
		if(c === ''){
			handleGroupLoop(write, group, width, maxColumns);
			group = [];
		} else{
			group.push(c);
		}
	}
	handleGroupLoop(write, group, width, maxColumns);
	
	/*var f = completions.filter(function (e){
	 if(e){
	 return e;
	 }
	 });
	 var prefix = commonPrefix(f);
	 if(prefix.length > completeOn.length){
	 self._insertString(prefix.slice(completeOn.length));
	 }*/
	repl.displayPrompt(true);
}
function commonPrefix(strings){
	if(!strings || strings.length == 0){
		return '';
	}
	var sorted = strings.slice().sort();
	var min = sorted[0];
	var max = sorted[sorted.length - 1];
	for(var i = 0, len = min.length; i < len; i++){
		if(min[i] != max[i]){
			return min.slice(0, i);
		}
	}
	return min;
}
function handleGroupLoop(write, group, width, maxColumns){
	if(group.length == 0){
		return;
	}
	var minRows = Math.ceil(group.length/maxColumns);
	for(var row = 0; row < minRows; row++){
		for(var col = 0; col < maxColumns; col++){
			var idx = row*maxColumns + col;
			if(idx >= group.length){
				break;
			}
			var item = group[idx];
			write(item);
			if(col < maxColumns - 1){
				for(var s = 0, itemLen = item.length; s < width - itemLen;
				    s++){
					write(' ');
				}
			}
		}
		write('\r\n');
	}
	write('\r\n');
}
