/**
 * Node.GWC
 */
/*
 * @todo
 * Implement spec 1
 * Implement spec xml?
 * Abstract adding to url store and test url (connect)
 */

console.log("node.js verion: " + process.version);
console.log('Current directory: ' + process.cwd());

var GWC = require('./gwc.js');

require('http').createServer(function(req, res){
	GWC.route(req, res);
}).listen(1337);
console.log('Server running at http://0.0.0.0:1337/');