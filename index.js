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
 */

console.log("node.js verion: " + process.version);
console.log('Current directory: ' + process.cwd());

process.on('uncaughtException', function(err) {
	console.dir(err);
	process.exit(1);
});

var GWC = require('./gwc.js');

require('http').createServer(function(req, res){
	GWC.route(req, res);
}).listen(1337);
console.log('Server running at http://0.0.0.0:1337/');