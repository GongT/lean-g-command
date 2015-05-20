var retries;
if(AV.CONFIG.database){
	retries = AV.CONFIG.database.tryTimes || 3
} else{
	retries = 3;
}

module.exports = function (){
	var p = new AV.Promise();
	retry(this, p, retries);
	return p;
};

function retry(mdl, p, retries){
	var clsname = mdl.className;
	mdl.save().then(function (){
		p.resolve.apply(p, arguments);
	}, function (e){
		if(retries > 0){
			console.error('save %s failed with error %s, remain %s times.', clsname, '' + e, retries);
			retry(mdl, p, retries - 1);
		} else{
			p.reject.apply(p, arguments);
		}
	});
}
