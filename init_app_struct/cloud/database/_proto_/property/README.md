say_hello.js:
module.exports = function (x){
	console.log( "user " + this.get("name") + " said: hello, " + x + "!" );
};

javascript:
var x = new AV.CLS._User;
x.say_hello("");


