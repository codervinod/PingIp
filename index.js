var request=require('request');
var redisClient = require('redis');

var client=redisClient.createClient();
var url='http://httpbin.org/ip';
var timeOut = 1500;
var retryTimer = 2000;
var maxRetry = 4;

function get(url,callback){
	request.get(url,{timeout: timeOut},function(err,data,body){
		if(err){
			return callback(err);
		}
		try{
			var packet = JSON.parse(body);

			if(packet.hasOwnProperty('origin')){
				return callback(null,packet.origin);
			}

			return callback('origin not found');
		}
		catch(err){
			return callback(err);
		}
	});
}


function fetchData(trial){
	if(trial > maxRetry){
		console.log(trial);
		console.log('Max Retries reached..');
		process.exit(-1);
	}
	get(url,function(err,data){
		if(err){
			console.log(err);
			setTimeout(function(){
				fetchData(trial+1);
			},retryTimer);
			return;
		}
		console.log(data);
		client.hset('IP_LIST',data,'',function(err,data){
			if(!err){
				process.exit(1);
			}else{
				console.log(err);
				setTimeout(function(){
					fetchData(trial+1);
				},retryTimer);
			}

		});
		
	});
}

fetchData(0);


