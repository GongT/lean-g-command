function DummyDate(){}

var allFunctionImpl = Object.keys(Date.prototype).every(function (fn){
	return DummyDate.prototype[fn];
});
if(allFunctionImpl){
	// global.Date = DummyDate;
} else{
	setTimeout(function (){
		console.log('DummyDate\x1B[38;5;9mDummyDate - 伪装的Date对象无法使用，请检查。。\x1B[0m');
		repl.displayPrompt();
	}, 2000);
}
