var net = require('net');
var sys = require('util');
var fs = require("fs");

var HOST = '127.0.0.1';
var PORT = 6969;

var client = new net.Socket();
client.connect(PORT, HOST, function(){

  console.log('CONNECTED TO:' + HOST + ':' + PORT);
  process.stdin.pipe(client);
  process.stdin.resume();
});

client.on('data', function(data){
  console.log('S: ' + data);
});

client.on('close', function() {
  console.log('Connection closed');
  client.destroy();
});
