try{
	process.env.TZ = "GMT"; // leancloud环境process.env为undefined
	AV.localhost = true;
} catch(e){
	AV.localhost = false;
}

var app = require('cloud/lean-g/scripts/app_prepare.js')(AV, require);

// AV.library.autoload(AV.FS.read_source_tree('cloud/library-private/'));

app.set('views', 'views');
app.listen();

