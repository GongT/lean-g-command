/* init app */
var app = require('lean-g')(AV, require);
/* init app complete */

app.set('views', 'views');

app.port = 3001;
app.listen();
