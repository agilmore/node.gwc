module.exports = GWC = (function($_, $url, $http, $fs){
	
	var settings = {
		nets: ["gnutella", "gnutella2"],
		defaultNet: "gnutella2",
		addDefaultURLs: false,
		defaultURLs: {
			"gnutella" : [
				"http://gwc.dietpac.com:8080/",
				"http://gwc.glucolene.com:8080/",
				"http://beacon.numberzero.org/gwc.php",
				"http://www.5s7.com/g12cache/skulls.php",
				"http://www.ak-electron.eu/Beacon2/gwc.php",
				"http://gwebcache.ns1.net/",
			], 
			"gnutella2" : [
				"http://htmlhell.com/",
				"http://gwc2.wodi.org/skulls.php",
				"http://cache.trillinux.org/g2/bazooka.php",
				"http://silvers.zyns.com/gwc/dkac.php",
				"http://dkac.trillinux.org/dkac/dkac.php",
				"http://gwc.marksieklucki.com/skulls.php",
				"http://gwc.dyndns.info:28960/gwc.php",
				"http://cache3.leite.us/",
				"http://gwebcache.ns1.net/",
				"http://cache5.leite.us/",
				"http://cache.ce3c.be/",
				"http://cache2.leite.us/",
				"http://karma.cloud.bishopston.net:33559/",           
			]
		}
	};
	try{
		var settings_json = $fs.readFileSync('settings.json', 'utf-8');
		var settings_temp = JSON.parse(settings_json);
		if($_.isObject(settings_temp)){
			$_.extend(settings, settings_temp);
		}
	}
	catch(e){}
	
	var ip_store = {};
	var url_store = {};
	for(n in settings.nets){
		ip_store[settings.nets[n]] = new FixedLengthQueue(30);
		url_store[settings.nets[n]] = new FixedLengthQueue(10);
	}
	
	//TODO don't add is serialized urls are to be added below.
	if('defaultURLs' in settings){
		for(var net in settings['defaultURLs']){
			for(var i in settings['defaultURLs'][net]){
				addURL(settings['defaultURLs'][net][i], net);
			}
		}
	}
	
	//load saved data
	try{
		var ip_store_json = $fs.readFileSync('data/ip_store.json', 'utf-8');
		var ip_store_temp = JSON.parse(ip_store_json);
		if($_.isObject(ip_store_temp)){
			for(var net in ip_store_temp){
				ip_store[net].fromJSON(ip_store_temp[net]);
			}
		}
	}
	catch(e){}
	try{
		var url_store_json = $fs.readFileSync('data/url_store.json', 'utf-8');
		var url_store_temp = JSON.parse(url_store_json);
		if($_.isObject(url_store_temp)){
			for(var net in url_store_temp){
				url_store[net].fromJSON(url_store_temp[net]);
			}
		}
	}
	catch(e){}
	
	//On exit...
	process.on('exit', function(){
		var ip_store_f = $fs.openSync('data/ip_store.json', 'w+');
		var w = $fs.writeSync(ip_store_f, JSON.stringify(ip_store));
		
		var url_store_f = $fs.openSync('data/url_store.json', 'w+');
		var w = $fs.writeSync(url_store_f, JSON.stringify(url_store));
		
		var settings_f = $fs.openSync('settings.json', 'w+');
		var w = $fs.writeSync(settings_f, JSON.stringify(settings));
		
		console.log("exiting...");
	});
	process.on('SIGINT', function(){
		process.exit(0);
	});
	process.on('SIGTERM', function(){
		process.exit(0);
	});
	//End on exit.

	//stats.clients['RAZA']['2.3.1.3'] = 1;
	//stats.nets['gnutella2'] = 1;
	var stats = {
		clients: {},
		nets: {},
	};
	
	function urlNormalise(url){
		url = url.toLowerCase();
		var indexRegex = new RegExp("index\.[a-z]{2,3}$");
		if(indexRegex.test(url)){
			url = url.substring(0, indexRegex.exec(url).index);
		}
		return url;
	}

	function getNet(args){
		if(args.net != undefined){
			if(settings.nets.indexOf(args.net) != -1){
				return args.net;
			}
		}
		return settings.defaultNet;
	}

	function addURL(url, net){
		url = urlNormalise(url);

		var options = $url.parse(url + '?ping=1&multi=1&client=NODEGWC&version=0.1&cache=1&net=gnutella2');
		$_.extend(options, {
			headers: {'User-Agent': 'node.gwc'}
		});
		var extra = '?ping=1&multi=1&client=NODEGWC&version=0.1&cache=1';
		if(!('path' in options)){
			options.path = options.pathname + options.search;
		}

		try{
			var req = $http.get(options, function(res) {
				res.on('data', function (chunk) {
					if(	chunk.toString().toLowerCase().indexOf('i|pong') === 0 ||
						chunk.toString().toLowerCase().indexOf('pong') === 0
					){
						if(!url_store[net].exists(url)){
							url_store[net].push(url);
							console.log("URL: checked and working (" + url + ")");
						}
					}
					else{
						console.log("URL: Returned error (" + url + ")");
					}
				}).on('error', function(error){
					console.log("URL: " + url + " FAILED: " + error.message);
				});
			});
			req.on('error', function(error){
				console.log("URL: " + url + " FAILED: " + error.message);
			});
		}
		catch(e){
			console.log("Exception:" + e);
		}
	}

	function indexPage(software){
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
		s += "<p>Uptime: " + process.uptime() + "</p>";
		s += "</body>\n";
		s += "</html>";
		return s;
	}

	return {
		route: function(req, res){
			var toreturn = [];
			var args = $url.parse(req.url, true).query;
			if(args == undefined || $_.isEmpty(args)){
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(indexPage(this.ping().software));
				console.log("INDEX: %s", req.socket.remoteAddress);
				return;
			}
			res.writeHead(200, {'Content-Type': 'text/plain'});
	
			var net = getNet(args);
	
			if(args.test != undefined){
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
		},
	
		update: function(net, ip, url){
			url = url || null;
	
			if(!ip_store[net].exists(ip, function(e, o){
				return e[0] == o;
			})){
				ip_store[net].push([ip, Date.now()]);
			}
	
			addURL(url);
	
			return true;
		},

		get: function(net, ip){
	
			if(!ip_store[net].exists(ip, function(e, o){
				return e[0] == o;
			})){
				ip_store[net].push([ip, Date.now()]);
			}
	
			return {
				hosts:	ip_store[net].getArray(),
				urls:	url_store[net].getArray()
			};
		},

		ping: function(){
			return {
				software: {'name':'node.gwc', 'version':'0.1'},
				networks: settings.nets
			}
		},
	};
}(require('./underscore.js'), require('url'), require('http'), require('fs')));

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
	
	this.fromJSON = function(json){
		var utils = require('utils');
		temp = JSON.parse(json);
		if(utils.isArray(temp)){
			queue = temp;
		}
	}
}