/**
 * Node.GWC
 */
/*
 * @todo
 * Implement spec 1?
 * Implement spec xml?
 * Implement udp gwc.
 * Remove underscore dependancy
 * Extend stats (uptime not including restarts, total requests)
 * Implement IP banning.
 * Refactor (move GWC and GUHC to seperate modules with central database.)
 */

global.startTime = new Date();

console.log("node.js verion: " + process.version);
console.log('Current directory: ' + process.cwd());

process.on('uncaughtException', function(err) {
  console.dir(err);
  process.abort();
});

var memwatch = require('memwatch');
var heapdump = require('heapdump');
var diff = null;

memwatch.on('leak', function(info) {
	console.error("Memory leak detected:");
	console.error(info.reason);
	console.error("Growth: " + info.growth);
	if(diff === null) {
		diff = new memwatch.HeapDiff();
	}
	else{
		console.dir(diff.end());
		diff = new memwatch.HeapDiff();
	}
	heapdump.writeSnapshot('/tmp/node.gwc.' + Date.now() + '.heapsnapshot');
});

var GWC = require('./gwc.js');

require('http').createServer(function(req, res){
  GWC.routeHTTP(req, res);
}).listen(1337);
console.log('HTTP Server running at http://0.0.0.0:1337/');

var GnutellaMessage = require('./gnutella_message.js');
var udp_sock = require('dgram').createSocket('udp4', function(msg, rinfo){
  var res = false;
  try{
    var gmessage = GnutellaMessage.decode(msg);
    res = GWC.routeUDP(gmessage, rinfo);
  }
  catch(e){
    console.error(e.toString());
  }
  console.log(res.toString());
  if(res !== false){
    var res_buf = GnutellaMessage.encode(res);
    udp_sock.send(res_buf, 0, res_buf.length, rinfo.port, rinfo.address);
  }
  delete res;
});
udp_sock.bind(1337);
console.log('UDP Server running at uhc:0.0.0.0:1337');