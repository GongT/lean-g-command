/**
 * @title: 链接到远程终端
 * @windowTitle: 终端
 */

try{
	var IO = require('socket.io-client');
} catch(e){
	console.error('请安装npm模块“\x1B[38;5;14msocket.io-client\x1B[0m”来启用此功能');
	process.exit(0);
}

call_cloud_code().then(function (data){
	console.log('return: ', data)
}).then(create_client, function (e){
	console.error('call cloud function create_console fail: \n    %s', e);
	process.exit(0);
});

function create_client(){
	"use strict";
	console.log("Connecting to: %s", APP_CONFIG.BASE_URL + '__leang/socket.io/');
	var socket = IO(APP_CONFIG.BASE_URL, {path: "/__leang/socket.io/", reconnection: false});
	socket.on('connect', function (){
		"use strict";
		console.log('connect');
		process.stdin.isTTY = true;
		process.stdin.setRawMode(true);
		process.stdin.removeAllListeners('data');
		process.stdin.on('data', function (data){
			socket.emit("typein", data);
		});
	});
	socket.on("echoback", function (data){
		process.stdout.write(data);
	});
	socket.on('disconnect', function (){
		console.log('disconnect');
		process.stdin.isTTY = true;
		process.stdin.setRawMode(false);
		process.exit(0);
	});
	socket.on('connect_error', function (e){
		console.error("connect_error: \n", e.stack);
	});
	
	process.on('exit', function (){
		process.stdin.setRawMode(false);
	});
}

function call_cloud_code(){
	"use strict";
	var base = 'https://cn.avoscloud.com/1.1/functions/';
	var request = require('request');
	console.log('请求云代码 %screate_console 在 线上服务器', base);
	
	var headers = {
		'X-AVOSCloud-Application-Id'        : APP_CONFIG.applicationId,
		'X-AVOSCloud-Application-Key'       : APP_CONFIG.applicationKey,
		'X-AVOSCloud-Application-Production': 1,
		'Content-Type'                      : 'application/json',
		'X-Requested-With'                  : 'XMLHttpRequest'
	};
	
	var params = {
		uri    : '/create_console',
		baseUrl: base,
		method : "POST",
		headers: headers,
		json   : true,
		body   : {}
	};
	return new Promise(function (resolve, reject){
		request(params, function (err, response, body){
			if(err){
				return reject(err);
			}
			if(!body){
				return reject('empty resonse');
			}
			if(body.hasOwnProperty('result')){
				body = body.result;
			} else{
				return reject('unknown resonse: ' + JSON.stringify(body));
			}
			
			console.log('云代码请求成功 - status=%s', body.status);
			if(body.status != 0){
				return reject('云代码返回错误 - ' + JSON.stringify(body));
			}
			return resolve(body);
		});
	});
}
