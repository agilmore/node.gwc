/**
 * Node.GWC
 */

/*
 * @todo
 * Implement spec 1
 * Implement spec xml?
 * Abstract adding to url store and test url (connect)
 */

var http = require('http');
var util = require('util');
var _url = require('url');
var fs = require('fs');

var _und = require('./underscore.js');

var settings = {
	nets: ["gnutella", "gnutella2"],
	defaultNet: "gnutella2"
};

var gwc = new GWC();
http.createServer(function(req, res){gwc.route(req, res);}).listen(1337, "0.0.0.0");
console.log(process.versions);
console.log('Server running at http://0.0.0.0:1337/');

function GWC(){
	var ip_store = {};
	var url_store = {};
	for(n in settings.nets){
		ip_store[settings.nets[n]] = new FixedLengthQueue(30);
		url_store[settings.nets[n]] = new FixedLengthQueue(10);
	}

	if(settings.nets.indexOf('gnutella2')){
		addURL("http://htmlhell.com/", 'gnutella2', url_store);
		addURL("http://gwc2.wodi.org/skulls.php", 'gnutella2', url_store);
		addURL("http://cache.trillinux.org/g2/bazooka.php", 'gnutella2', url_store);
		addURL("http://silvers.zyns.com/gwc/dkac.php", 'gnutella2', url_store);
		addURL("http://dkac.trillinux.org/dkac/dkac.php", 'gnutella2', url_store);
		addURL("http://gwc.marksieklucki.com/skulls.php", 'gnutella2', url_store);
		addURL("http://gwc.dyndns.info:28960/gwc.php", 'gnutella2', url_store);
		addURL("http://cache3.leite.us/", 'gnutella2', url_store);
		addURL("http://gwebcache.ns1.net/", 'gnutella2', url_store);
		addURL("http://cache5.leite.us/", 'gnutella2', url_store);
		addURL("http://cache.ce3c.be/", 'gnutella2', url_store);
		addURL("http://cache2.leite.us/", 'gnutella2', url_store);
		addURL("http://karma.cloud.bishopston.net:33559/", 'gnutella2', url_store);
	}
	if(settings.nets.indexOf('gnutella')){
		addURL("http://gwc.dietpac.com:8080/", 'gnutella', url_store);
		addURL("http://gwc.glucolene.com:8080/", 'gnutella', url_store);
		addURL("http://beacon.numberzero.org/gwc.php", 'gnutella', url_store);
		addURL("http://www.5s7.com/g12cache/skulls.php", 'gnutella', url_store);
		addURL("http://www.ak-electron.eu/Beacon2/gwc.php", 'gnutella', url_store);
		addURL("http://gwebcache.ns1.net/", 'gnutella', url_store);
	}

	//stats.clients['RAZA']['2.3.1.3'] = 1;
	//stats.nets['gnutella2'] = 1;
	var stats = {
		clients: {},
		nets: {},
	};

	process.on('exit', function(){
		//var ip_store_f = fs.openSync('ip_store.json', 'a+');
		//var w = fs.writeSync(ip_store_f, JSON.stringify(ip_store));
		console.log("exiting...");
	});
	process.on('SIGINT', function(){
		process.exit(0);
	});
	process.on('SIGTERM', function(){
		process.exit(0);
	});

	this.route = function(req, res){
		var toreturn = [];
		var args = _url.parse(req.url, true).query;
		if(args == undefined || _und.isEmpty(args)){
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(indexPage(this.ping().software));
			console.log("INDEX: %s", req.socket.remoteAddress);
			return;
		}
		res.writeHead(200, {'Content-Type': 'text/plain'});

		var net = getNet(args);

		if(args.test != undefined){
/*
			var test = new FixedLengthQueue(30);
			var TEST_S = "TEST";
			test.push(TEST_S);
			if(test.exists(TEST_S)){
				console.log("pass");
			}
			else{
				console.log("fail");
			}
			console.dir(test.getArray());
*/
			
			var ran_ip = function(){
				var parts = [];
				for(var i = 0; i < 4; i++){
					parts.push(Math.floor(Math.random() * 255) + 1);
				}
				return parts.join(".");
			};

			for(var i = 0; i < 10; i++){
				ip_store[net].push([ran_ip(), Date.now()]);
			}
		}

		if(args.update != undefined){
			if(args.ip != undefined && args.ip.split(':')[0] == req.socket.remoteAddress){
				if(this.update(net, args.ip, args.url)){
					toreturn.push(["I", "update", "OK"]);
					console.log("UPDATE: %s OK", args.ip);
				}
			}
			else{
				toreturn.push(["I", "update", "WARNING", "Rejected IP"]);;
				console.log("UPDATE: %s WARNING", args.ip);
			}
		}

		if(args.get != undefined){
			var data = this.get(net, req.socket.remoteAddress);
			console.log("GET: %s", req.socket.remoteAddress);
			for(i in data.hosts){
				toreturn.push(["H", data.hosts[i][0], Date.now() - data.hosts[i][1]]);
			}
			for(i in data.urls){
				toreturn.push(["U", data.urls[i]]);
			}
		}

		if(args.ping != undefined){
			var ping = this.ping();
			toreturn.push(["I", "pong", ping.software.name + ' ' + ping.software.version, ping.networks.join("-")]);
			console.log("PING: %s", req.socket.remoteAddress);
		}

		/*
		 * Stats
		 */
		if(args.client != undefined){
			if(stats.clients[args.client] == undefined) stats.clients[args.client] = {};

			if(args.version != undefined){
				if(stats.clients[args.client][args.version] == undefined) stats.clients[args.client][args.version] = 1;
				else stats.clients[args.client][args.version]++;
			}
			else{
				if(stats.clients[args.client][args.version] == undefined) stats.clients[args.client]["NONE"] = 1;
				else stats.clients[args.client]["NONE"]++;
			}
		}
		if(args.net != undefined){
			if(stats.nets[args.net] == undefined) stats.nets[args.net] = 1;
			else stats.nets[args.net]++;
		}

		if(toreturn.length == 0){
			toreturn.push(["I", "nothing"]);
		}

		var r = "";
		for(i in toreturn){
			r += toreturn[i].join("|") + "\n";
		}

		res.end(r);
	}
	
	this.update = function(net, ip, url){
		url = url || null;

		if(!ip_store[net].exists(ip, function(e, o){
			return e[0] == o;
		})){
			ip_store[net].push([ip, Date.now()]);
		}

		addURL(url);

		return true;
	}

	this.get = function(net, ip){

		if(!ip_store[net].exists(ip, function(e, o){
			return e[0] == o;
		})){
			ip_store[net].push([ip, Date.now()]);
		}

		return {
			hosts:	ip_store[net].getArray(),
			urls:	url_store[net].getArray()
		};
	}

	this.ping = function(){
		return {
			software: {'name':'node.gwc', 'version':'0.1'},
			networks: settings.nets
		}
	}

	var urlNormalise = function(url){
		url = url.toLowerCase();
		var indexRegex = new RegExp("index\.[a-z]{2,3}$");
		if(indexRegex.test(url)){
			url = url.substring(0, indexRegex.exec(url).index);
		}
		return url;
	}

	var getNet = function(args){
		if(args.net != undefined){
			if(settings.nets.indexOf(args.net) != -1){
				return args.net;
			}
		}
		return settings.defaultNet;
	}

	this.addURL = function(url, net){
		url = urlNormalise(url);

		console.log(url);
		var options = _url.parse(url);
		_und.extend(options, {
			headers: {'User-Agent': 'node.gwc'}
		});
		options.path += '?ping=1&multi=1&client=NODEGWC&version=0.1&cache=1';

		http.get(options, function(res) {
			res.on('data', function (chunk) {
				if(chunk.indexOf('I|pong') === 0){
					if(!url_store[net].exists(url)){
						url_store[net].push(url);
						console.log("URL: checked and working (" + url + ")");
					}
				}
			});
		});
	}

	var indexPage = function(software){
		var s = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n";
		s += "<html>\n";
		s += "<head>\n";
		s += "<title>" + software.name + ' ' + software.version + "</title>\n";
		s += "</head>\n";
		s += "<body>\n";
		s += "<h1>" + software.name + ' ' + software.version + "</h1>\n";
		s += "<dl>";
		s += "<dt>Networks Supported:</dt>";
		s += "<dd>" + settings.nets.join(", ") + "</dd>";
		s += "<dt>Most Popular Network:</dt>";
		var max = 0, maxi = null;
		for(var n in stats.nets){
			if(stats.nets[n] > max){
				max = stats.nets[n];
				maxi = n;
			}
		}
		s += "<dd>" + maxi + "</dd>";
		s += "</body>\n";
		s += "</html>";
		return s;
	}
}

function FixedLengthQueue(len){
	var queue = [];

	this.push = function(o){
		if(queue.length > len){
			queue = queue.slice(1, len);
		}
		queue.push(o);
	}

	this.exists = function(o, compareFunc){
		if(compareFunc == undefined){
			compareFunc = function(e, o){
				return e == o;
			}
		}
		return queue.some(function(e){ return compareFunc(e, o); });
	}
	
	this.getArray = function(){
		return queue;
	}

	this.toJSON = function(){
		return JSON.stringify(queue);
	}
}
