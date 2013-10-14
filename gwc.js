module.exports = (function($_, $url, $http, $fs, GnutellaMessage){
  
  NAME = 'node.gwc';
  VERSION = '0.1';
  
  var settings = {
    nets: ["gnutella", "gnutella2"],
    myDomain: 'gwctest.zapto.org',
    myPort: 1337,
    myIP: '127.0.0.1',
    //myURL: 'http://gwctest.zapto.org:1337/',
    defaultNet: "gnutella2",
    defaultURLs: {
      "gnutella" : [
                    "http://g1.uk.dyslexicfish.net:33558/",
                    "http://g1.uswest.dyslexicfish.net:33558/"
      ],
      "gnutella2" : [
                     "http://dkac.trillinux.org/dkac/dkac.php",
                     "http://gwc.dyndns.info:28960/gwc.php",
                     "http://cache.ce3c.be/",
                     "http://cache2.bazookanetworks.com/g2/bazooka.php",
                     "http://htmlhell.com/",
                     "http://gweb.dwbo.nl/",
                     "http://cache.w3-hidden.cc/",
                     "http://www.omhub.ru/mibew/view/",
      ]
    }
  };
  try{
    var settings_json = $fs.readFileSync('settings.json', 'utf-8');
    var settings_temp = JSON.parse(settings_json);
    if($_.isObject(settings_temp)){
      $_.extend(settings, settings_temp);
    }
    
    delete settings_json;
    delete settings_temp;
  }
  catch(e){}
  
  var ip_store = {};
  var url_store = {};
  for(n in settings.nets){
    ip_store[settings.nets[n]] = new FixedLengthQueue(30);
    url_store[settings.nets[n]] = new FixedLengthQueue(15);
  }
  
  //load saved data
  try{
    var ip_store_json = $fs.readFileSync('data/ip_store.json', 'utf-8');
    var ip_store_temp = JSON.parse(ip_store_json);
    if($_.isObject(ip_store_temp)){
      for(var n in ip_store_temp){
        ip_store[n].fromJSON(ip_store_temp[n]);
      }
    }

    delete ip_store_json;
    delete ip_store_temp;
  }
  catch(e){console.error(e);}
  try{
    var url_store_json = $fs.readFileSync('data/url_store.json', 'utf-8');
    var url_store_temp = JSON.parse(url_store_json);
    if($_.isObject(url_store_temp)){
      for(var net in url_store_temp){
        url_store[net].fromJSON(url_store_temp[net]);
      }
    }
    
    delete url_store_json;
    delete url_store_temp;
  }
  catch(e){console.error(e);}

  if('defaultURLs' in settings){
    for(var net in settings['defaultURLs']){
      if(url_store[net].length == 0){
        for(var i in settings['defaultURLs'][net]){
          try{
            addURL(settings['defaultURLs'][net][i], net);
          }
          catch(e){console.error(e);}
        }
      }
    }
  }

  //On exit...
  process.on('exit', function(){
    var ip_store_f = $fs.openSync('data/ip_store.json', 'w+');
    $fs.writeSync(ip_store_f, JSON.stringify(ip_store));
    
    var url_store_f = $fs.openSync('data/url_store.json', 'w+');
    $fs.writeSync(url_store_f, JSON.stringify(url_store));
    
    var settings_f = $fs.openSync('settings.json', 'w+');
    $fs.writeSync(settings_f, JSON.stringify(settings));
    
    console.log("exiting...");
  });
  process.on('SIGINT', function(){
    process.nextTick(process.exit);
  });
  process.on('SIGTERM', function(){
    process.nextTick(process.exit);
  });
  //End on exit.

  //stats.clients['RAZA']['2.3.1.3'] = 1;
  //stats.nets['gnutella2'] = 1;
  var stats = {
    clients: {},
    nets: {},
  };
  
  function urlNormalise(url){
    //url = url.toLowerCase();
    url = url.trim();
    var indexRegex = new RegExp("index\.[a-z]{2,3}$");
    if(indexRegex.test(url)){
      url = url.substring(0, indexRegex.exec(url).index);
    }
    return url;
  }

  function getNet(args){
    if(args.net != undefined){
      var net = new String(args.net).toLowerCase();
      if(settings.nets.indexOf(net) != -1){
        return net;
      }
      else{
        return false;
      }
    }
    return settings.defaultNet;
  }
  
  function _fix_length_queue_entry_exists(e, o){
    if(typeof e[0] == 'string' && typeof o == 'string'){
      return e[0].toLowerCase() == o.toLowerCase();
    }
    return e[0] == o;
  }

  function addURL(url, net){
    url = urlNormalise(url);
    
    if(url == 'http://' + settings.myDomain + ':' + settings.myPort + '/'){
      console.error("Attempted add me to myself.");
      throw "URL Error";
    }
    
    if(settings.nets.indexOf(net) === -1) throw "Not a known network (" + net + ")";

    var options = $url.parse(url + '?ping=1&multi=1&client=NGWC&version=0.1&cache=1&net=' + net);
    $_.extend(options, {
      headers: {'User-Agent': 'node.gwc'}
    });
    if(!('path' in options)){
      options.path = options.pathname + options.search;
    }

    if(!url_store[net].exists(url, _fix_length_queue_entry_exists)){
      var req = $http.get(options, function(res) {
        res.on('data', function (chunk) {
          if(  chunk.toString().toLowerCase().indexOf('i|pong') === 0 ||
            chunk.toString().toLowerCase().indexOf('pong') === 0
          ){
            url_store[net].push([url, getDateSeconds()]);
            console.log("URL: checked and working (" + url + ")");
            
            setTimeout(addURL, ((1000*60*60*24) + (1000*60*10)), url, net);
          }
          else{
            console.error("URL: Returned error (" + url + ")");
            console.error(chunk.toString().toLowerCase());
          }
        }).on('error', function(error){
          console.error("URL: " + url + " FAILED: " + error.message);
        });
      });
      req.on('error', function(error){
        console.error("URL: " + url + " FAILED: " + error.message);
      });
    }
    else{
      //console.dir(url_store[net].get(url, _fix_length_queue_entry_exists));
      if(getDateSeconds() - url_store[net].get(url, _fix_length_queue_entry_exists)[1] > (60*60*24)){
        url_store[net].remove(url, _fix_length_queue_entry_exists);
        process.nextTick(function(){ addURL(url, net); });
      }
    }
  }
  
  /**
   * Add an ip to the database.
   * 
   * @param ip
   * @param net
   * @param force Don't check the IP is reachable.
   */
  function addIP(ip, net, force){
    ip = ip.toString();
    if(ip.search("^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{1,5}$") == -1) throw "IP invalid (" + ip + ")";
    if(settings.nets.indexOf(net) == -1) throw "Not a known network (" + net + ")";

    var _compare_ip_only = function(e, o){
      return e[0].substr(0, e[0].indexOf(':')) == o.substr(0, o.indexOf(':'));
    };
    
    if(!ip_store[net].exists(ip, _compare_ip_only)){
    	if (force) {
    		ip_store[net].push([ip, getDateSeconds()]);
    	}
      var parts = ip.split(':');
      var client = require('net').connect(parts[1], parts[0], function(){
        console.log('Reverse connect to ' + ip + ' successful');
        client.end();
        
        ip_store[net].push([ip, getDateSeconds()]);
        
        setTimeout(addIP, 1000*60*61, ip, net);
      });
      client.on('error', function(){
        console.error('Reverse connect to ' + ip + ' failed');
      });
    }
    else{
      if(getDateSeconds() - ip_store[net].get(ip, _compare_ip_only)[1] > (60*60)){
        ip_store[net].remove(ip, _compare_ip_only);
        process.nextTick(function(){ addIP(ip, net); });
      }
    }
  }

  function indexPage(){
  	var timeSince = function(date) {
	    var seconds = Math.floor((new Date() - date) / 1000);

	    var interval = Math.floor(seconds / 31536000);

	    if (interval > 1) {
	        return interval + " years";
	    }
	    interval = Math.floor(seconds / 2592000);
	    if (interval > 1) {
	        return interval + " months";
	    }
	    interval = Math.floor(seconds / 86400);
	    if (interval > 1) {
	        return interval + " days";
	    }
	    interval = Math.floor(seconds / 3600);
	    if (interval > 1) {
	        return interval + " hours";
	    }
	    interval = Math.floor(seconds / 60);
	    if (interval > 1) {
	        return interval + " minutes";
	    }
	    return Math.floor(seconds) + " seconds";
  	};
	  
    var s = "<!DOCTYPE HTML>\n";
    s += "<html>\n";
    s += "<head>\n";
    s += "<title>" + NAME + ' ' + VERSION + "</title>\n";
    s += "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">";
    s += "</head>\n";
    s += "<body>\n";
    s += "<h1>" + NAME + ' ' + VERSION + "</h1>\n";
    s += "<dl>";
    s += "<dt>Networks Supported:</dt>";
    s += "<dd>" + settings.nets.join(", ") + "</dd>";
    
    var max = 0, maxi = null;
    for(var n in stats.nets){
      if(stats.nets[n] > max){
        max = stats.nets[n];
        maxi = n;
      }
    }
    if(maxi !== null) {
      s += "<dt>Most Popular Network:</dt>";
    	s += "<dd>" + maxi + "</dd>";
    }
    /*
    s += "<dt>Most Popular Client:</dt><dd><ul>";
    for(var c in stats.clients){
      var count = 0;
      for(var d in stats.clients[c]){
        count += stats.clients[c][d];
      }
      s += "<li>" + c + ": " + count + "</li>";
    }
    s += "</ul></dt>";
    */
    s += '<dt>Other GWCs:</dt>';
    s += '<dd>';
    for(var n in url_store) {
    	s += '<p>' + n + '</p><ul>';
	    var urls = url_store[n].getArray();
	    for(var i in urls) {
	    	s += '<li><a href="' + urls[i][0] + '">' + urls[i][0] + '</a></li>';
	    }
    	s += '</ul>';
    }
    s += '</dd>';
    s += "</dl>";
    s += "<pre>Uptime:<time datetime=\"" + global.startTime.toISOString() + "\"> " + timeSince(global.startTime) + "</time>\n";
    s += "Memory Usage: " + (process.memoryUsage())['rss'] / 1024 / 1024 + "MB\n";
    s += "</pre>";
    s += "</body>\n";
    s += "</html>";
    return s;
  }
  
  function getDateSeconds(){
    return Math.round(Date.now() / 1000);
  }

  return {
    routeHTTP: function(req, res){

      //nonsense: sometimes remoteAddress is undefined!
      var remote_ip = null;
      try{
        remote_ip = req.socket.remoteAddress || req.connection.remoteAddress || req.connection.socket.remoteAddress || null;
      }
      catch(e){}
      if(!remote_ip){
        console.error("Undefined IP");
        console.dir(req);
        return;
      }

      res.setHeader('X-Remote-IP', remote_ip);

      console.log(remote_ip + " [" + (new Date()).toISOString() + "] " + req.method + " " + req.url + " HTTP/" + req.httpVersion);

      var toreturn = new Array();
      var args = $url.parse(req.url, true).query;
      if(args == undefined || $_.isEmpty(args)){
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        res.end(indexPage(this.ping().software));
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/plain'});

      var net = getNet(args);
      if(net === false){
        toreturn.push(["I", "net-not-supported"]);
      }
      else{
        if(args.test != undefined){
          var flq = new FixedLengthQueue(10);
          for(var i = 0; i < 10; i++){
            flq.push([i+'', Date.now()]);
          }
          
          flq.remove("5", _fix_length_queue_entry_exists);
          
          toreturn.push([require('util').inspect(flq.getArray())]);
          
          flq.push(["11", Date.now()]);
          
          toreturn.push([require('util').inspect(flq.getArray())]);
          
          flq.remove("2", _fix_length_queue_entry_exists);
          
          toreturn.push([require('util').inspect(flq.getArray())]);
        }
  
        if(args.pollute != undefined){
          var pollute_n = args.pollute ? parseInt(args.pollute) : 5;
          console.log(pollute_n);
          var ran_ip = function(){
            var parts = new Array();
            for(var i = 0; i < 4; i++){
              parts.push(Math.floor(Math.random() * 255) + 1);
            }
            return parts.join(".");
          };
    
          for(var i = 0; i < pollute_n; i++){
            try{
              addIP(ran_ip() + ':' + (Math.floor(Math.random() * 65000) + 1024), net, true);
            }
            catch(e){}
          }
        }
  
        if(args.forcecheck != undefined){
          if(args.forcecheck == 'ip'){
            for(var n in ip_store){
              for(var i in ip_store[n].getArray()){
                try{
                  addIP(ip_store[n].getArray()[i][0], n);
                }
                catch(e){}
              }
            }
          }
          if(args.forcecheck == 'url'){
            for(var n in url_store){
              for(var i in url_store[n].getArray()){
                try{
                  addURL(url_store[n].getArray()[i][0], n);
                }
                catch(e){}
              }
            }
          }
        }
  
        if(args.debug != undefined && args.debug == 'full'){
          var util = require('util');
          res.write("=================DEBUG=================\n");
          res.write("ip_store:\n");
          for(var n in ip_store){
            res.write(n + "\n");
            res.write(util.inspect(ip_store[n].getArray()));
            res.write("\n");
          }
          res.write("\nurl_store:\n");
          for(var n in url_store){
            res.write(n + "\n");
            res.write(util.inspect(url_store[n].getArray()));
            res.write("\n");
          }
          res.write("\nsettings:\n");
          res.write(util.inspect(settings));
          res.write("\n=======================================\n\n");
        }
        
        if(args.heapdump != undefined) {
        	var heapdump = require('heapdump');
        	heapdump.writeSnapshot('/tmp/node.gwc.' + Date.now() + '.heapsnapshot');
        }
  
        if(args.ping != undefined){
          toreturn.push(["I", "pong", NAME + ' ' + VERSION, settings.nets.join("-")]);
        }
  
        if(args.update != undefined){
          if(args.ip != undefined){
            if(args.ip.split(':')[0] == remote_ip){
              try{
                addIP(args.ip, net);
                //this.update(net, args.ip, args.url);
                toreturn.push(["I", "update", "OK"]);
              }
              catch(e){ //TODO: more specific
                toreturn.push(["I", "update", "WARNING", "Rejected IP", e]);
              }
            }
            else{
              toreturn.push(["I", "update", "WARNING", "Rejected IP"]);
            }
          }
          
          try{
            addURL(args.url, net);
            toreturn.push(["I", "update", "OK"]);
          }
          catch(e){
            toreturn.push(["I", "update", "WARNING", "Rejected URL", e]);
          }
          
        }
  
        if(args.get != undefined){
          try{
            var data = this.get(net, remote_ip);
            for(var i in data.hosts){
              toreturn.push(["H", data.hosts[i][0], getDateSeconds() - data.hosts[i][1]]);
            }
            for(var i in data.urls){
              toreturn.push(["U", data.urls[i][0], getDateSeconds() - data.urls[i][1]]);
            }
          }
          catch(e){
            toreturn.push(["I", "WARNING", e]);
          }
        }
    
        /*
         * Stats
         */
        /*
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
        */
  
        if(stats.nets[net] == undefined) stats.nets[net] = 1;
        else stats.nets[net]++;
      }

      if(toreturn.length == 0){
        toreturn.push(["I", "nothing"]);
      }

      var r = "";
      for(var i in toreturn){
        r += toreturn[i].join("|") + "\n";
      }

      res.end(r);
    },
    
    routeUDP: function(gmessage, rinfo){
      console.log(gmessage.toString());
      //console.log(rinfo);
      console.log(rinfo.address + " [" + (new Date()).toISOString() + "] " + GnutellaMessage.getTypeString(gmessage.getType()) + " UHC");
      
      if(gmessage.getType() == GnutellaMessage.TYPES.PING){
        var want_ultrapeers = false;
        
        var ggep_blocks = gmessage.getGGEPBlocks();
        for(var i in ggep_blocks){
          switch(ggep_blocks[i].id){
            case 'SCP':
              if('body' in ggep_blocks[i]){
                want_ultrapeers = (ggep_blocks[i].body[0] == 1);
              }
              break;
          }
        }
        
        //[57, 5, 127, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        var pong_body_buffer = new Buffer(14);
        var i = 0;
        
        pong_body_buffer.writeUInt16LE(settings.myPort, i);
        i += 2;
        
        var ip_parts = settings.myIP.split('.');
        pong_body_buffer.writeUInt8(parseInt(ip_parts[0]), i++);
        pong_body_buffer.writeUInt8(parseInt(ip_parts[1]), i++);
        pong_body_buffer.writeUInt8(parseInt(ip_parts[2]), i++);
        pong_body_buffer.writeUInt8(parseInt(ip_parts[3]), i++);
        
        var pong = new GnutellaMessage(
          gmessage.getGUID(),
          GnutellaMessage.TYPES.PONG,
          pong_body_buffer
        );
        pong.setTTL(1);
        
        var udphc = {id: 'UDPHC', compression: false, body: new Buffer(settings.myDomain)};
        pong.addGGEPBlock(udphc);
        
        var phc = {id: 'PHC', compression: false, body: new Buffer('yin.cloud.bishopston.net:33558')};
        pong.addGGEPBlock(phc);
        
        if(want_ultrapeers){
          var ips = ip_store['gnutella'].getArray();
          if(ips.length > 0){
            var ipp_buffer = new Buffer(ips.length * 6);
            for(var i in ips){
              var ipport = GnutellaMessage.encodeIPPort(ips[i][0]);
              if(ipport !== false){
                ipport.copy(ipp_buffer, (i*6));
              }
              delete ipport;
            }
            var ipp = {id: 'IPP', compression: false, body: ipp_buffer};
            pong.addGGEPBlock(ipp);
          }
        }
        else{
          addIP(rinfo.address + ':' + rinfo.port);
        }
        
        return pong;
      }
      return false;
    },

    update: function(net, ip, url){
      url = url || null;

      addIP(ip, net);

      addURL(url, net);
    },

    get: function(net, ip){
      //addIP(ip, net);

      return {
        hosts:  ip_store[net].getArray(),
        urls:  url_store[net].getArray()
      };
    },

    // @Deprecated
    ping: function(){
      return {
        software: {'name':NAME, 'version':VERSION},
        networks: settings.nets
      };
    },
  };
}(require('./underscore.js'), require('url'), require('http'), require('fs'), require('./gnutella_message.js')));

function FixedLengthQueue(len){
  var queue = [];

  this.push = function(o){
    if(queue.length > len){
      queue = queue.slice(1, len);
    }
    queue.push(o);
  };
  
  this.get = function(o, compareFunc){
    if(compareFunc == undefined){
      compareFunc = function(e, o){
        return e == o;
      };
    }
    return (queue.filter(function(e){ return compareFunc(e, o); }))[0];
  };

  this.exists = function(o, compareFunc){
    if(compareFunc == undefined){
      compareFunc = function(e, o){
        return e == o;
      };
    }
    return queue.some(function(e){ return compareFunc(e, o); });
  };
  
  this.remove = function(o, compareFunc){
    if(compareFunc == undefined){
      compareFunc = function(e, o){
        return e == o;
      };
    }
    queue = queue.filter(function(v, i){ return !compareFunc(v, o); });
  };
  
  this.getArray = function(){
    return queue;
  };

  this.toJSON = function(){
    return JSON.stringify(queue);
  };
  
  this.fromJSON = function(json){
    var util = require('util');
    temp = JSON.parse(json);
    if(util.isArray(temp)){
      queue = temp;
    }
  };
  
  this.__defineGetter__("length", function(){
    return queue.length;
	});
}