var ctl = module.exports = new ExpressController("HelloWorld");

ctl.method = "GET";

ctl.next(function (rt){
	rt.debug_send("<h1>Hello world!</h1>");
});
