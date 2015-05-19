var app = require('cloud/lean-g/scripts/app_prepare.js')(AV, require);

// AV._User = AV.User;

/*
 delete AV.library.constant.parent;
 for(var i in AV.library.constant){
 AV.CONSTANTS[i] = AV.library.constant[i];
 }
 */

// AV.library.autoload(AV.FS.read_source_tree('cloud/library-private/'));

/*
 var cloud = AV.library.net.getAvServer('CloudCode');
 AV.call = cloud.run.bind(cloud);
 */

app.set('views', 'views');
app.listen();

