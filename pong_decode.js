var sample_data = new Array(0x5B,0x37,0x31,0x27,0x41,0x67,0x70,0x62,0x10,0x81,0xF,0xB6,0xAF,0x63,0xD2,0xCE,0x1,0x1,0x0,0x60,0x1,0x0,0x0,0x16,0x83,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0xC3,0x5,0x55,0x44,0x50,0x48,0x43,0x58,0x79,0x69,0x6E,0x2E,0x63,0x6C,0x6F,0x75,0x64,0x2E,0x62,0x69,0x73,0x68,0x6F,0x70,0x73,0x74,0x6F,0x6E,0x2E,0x6E,0x65,0x74,0x83,0x49,0x50,0x50,0x84,0x6C,0x46,0x6D,0x30,0x11,0xD1,0x3E,0x40,0x97,0x9,0x9D,0x5F,0x8A,0x44,0x20,0xF6,0x4,0x27,0x22,0x32,0x5D,0xF,0x92,0x80,0x4A,0x4A,0x45,0xB9,0xE,0xB5,0x6E,0x4D,0xCC,0xB,0x6,0xAA,0xF,0x77,0xAC,0x62,0x66,0xCA,0x18,0x62,0x4D,0x87,0x77,0x14,0x22,0xB4,0x1B,0xE4,0x79,0xCA,0x18,0x7D,0x0,0x83,0x30,0xCA,0x18,0xDB,0x6B,0xF2,0xD5,0xDA,0x8,0x7B,0xE3,0xFB,0x54,0xCA,0x18,0x44,0x20,0xEA,0xC9,0x70,0x76,0xE,0xC1,0x6C,0xCD,0xCA,0x18,0x18,0x2,0x4E,0x89,0x5E,0x9D,0x62,0x43,0xEA,0x1F,0xE2,0x6E,0x18,0x59,0xD9,0x55,0x8C,0x59,0x18,0xFF,0xF,0x44,0x88,0x69,0x60,0x1C,0x20,0x57,0x96,0x93,0x65,0x6F,0xF,0x30,0xCA,0x18,0x42,0x1B,0x8B,0x4F,0x86,0x44,0x46,0xBD,0xDD,0x6B,0xD8,0x21,0xD8,0x2D,0x2B,0xD4,0x4A,0x10,0x4C,0x17,0xCF,0x11,0x0,0x7F,0xAD,0x3,0xA5,0xF,0x4F,0x89,0xDD,0x4D,0xF2,0xF,0xCA,0x18,0x71,0x9F,0x1D,0xE2,0xCA,0x18,0xDA,0x2B,0x1E,0x54,0xCA,0x18,0x47,0xCC,0x38,0x6B,0x2,0x68,0x43,0xF9,0xF1,0x3,0x2,0x9,0x7E,0x13,0xBD,0x2F,0xCA,0x18,0x7D,0xCD,0x41,0x9F,0xCA,0x18,0x3D,0x23,0x3F,0xF9,0x6,0x8C,0x63,0x2B,0x40,0x7F,0x7,0x29,0x45,0xF4,0xDB,0x50,0x88,0x15,0x4B,0x6D,0xE1,0x58,0xC9,0x26,0xAE,0x64,0x59,0xB,0x88,0x69,0x7D,0x1F,0x50,0xC9,0xCA,0x18,0x4A,0x32,0x26,0x2F,0x55,0x65,0x18,0x5D,0xA3,0x9F,0x41,0x48,0x76,0xE9,0x71,0x8D,0xA6,0x38,0x7D,0xE,0x21,0x33,0xCA,0x18,0xAE,0x40,0xA3,0xDE,0xF,0x65,0x6F,0x67,0x34,0x20,0xCA,0x18,0x45,0xF8,0x97,0xBD,0xE1,0x23,0x47,0xBE,0xBC,0xD2,0xC2,0x82,0xB6,0xA9,0xB7,0x2A,0xCA,0x18,0x51,0xE9,0x54,0x2B,0x91,0x10,0xB8,0x9B,0xF4,0x71,0x7E,0x47,0x5D,0x1,0xDC,0xA6,0x8F,0x8);

var sample_buffer = new Buffer(sample_data);
/*
var guid = buffer.slice(0, 15);

console.dir(guid);

var type = buffer.readUInt8(16);

console.log(TYPES[type]);

var ttl = buffer.readUInt8(17);

console.log(ttl);

var hops = buffer.readUInt8(18);

console.log(hops);

var length = buffer.readUInt32LE(19);

console.log(length);

var body = buffer.slice(23);

console.log(body);

switch(type){
	case TYPES.PONG:
		var port = body.readUInt16LE(0);
		var ip = body.readUInt8(2) + "." + body.readUInt8(3) + "." + body.readUInt8(4) + "." + body.readUInt8(5);
		var files_shared = body.readUInt16LE(6);
		var kbs_shared = body.readUInt16LE(10);
		console.log(ip + ":" + port);
		
		var ggep_body = null;
		while( (ggep_body = decode_ggep(body.slice(14 + (ggep_body == null ? 0 : ggep_body.length + 1)))) !== false){
			console.log(ggep_body);
		}
		break;
}

function decode_ggep(buffer){
	if(buffer.readUInt8(0) == 0xc3){
		//loop over block.
		var toreturn = [];
		var p = 0;
		var last = false;
		do{
			var flags = buffer.readUInt8(++p);
			console.log("flags = " + flags);
			last = (flags & 0x80) == 0x80;
			var id_length = flags & 0xf;
			var id = buffer.toString('ascii', ++p, p += id_length);
			console.log(id);
	
			//var offset = p + id_length;
			var i = 0;
			var data_length_temp;
			var data_length = 0;
			do{
				data_length_temp = buffer.readUInt8(p + i);
				//console.log(data_length_temp);
				//console.log("\ti=" + i);
				//console.log("\t" + data_length_temp);
				//console.log((data_length_temp & 0x40) == 0x40);
				console.log("data_length=" + data_length);
				//console.log("((" + data_length_temp + " & 0x3f) << (" + i + "*8)) = " + ((data_length_temp & 0x3f) << (i*8)));
				//console.log("((" + data_length_temp + " & 0x3f) = " + (data_length_temp & 0x3f));
				//data_length |= ((data_length_temp & 0x3f) << (i*8));
				data_length <<= 6;
				data_length |= data_length_temp & 0x3f;
				console.log("data_length=" + data_length);
				i++;
			}
			while((data_length_temp & 0x40) != 0x40 && i <= 4);
			p += i;
			console.log(p);
			console.log(buffer.length);
			console.log(data_length);
			console.log(buffer.slice(p, p + data_length));
			toreturn.push( buffer.slice(p, p + data_length) );
			p += data_length - 1;
			console.log("LOOP END p = " + p);
		}
		while(!last);
		return toreturn;
	}
	else{
		return false;
	}
}
*/
var GnutellaMessage = function(guid, type, body){
	if(body !== null && !Buffer.isBuffer(body)){
		console.error(body);
		throw "body not a buffer";
	}
	
	var ttl = 0;
	var hops = 0;
	var ggep_blocks = [];
	
	this.getType = function(){
		return type;
	}
	
	this.getGUID = function(){
		return guid;
	}
	
	this.setBody = function(nbody){
		body = nbody;
	}
	
	this.getBody = function(){
		return body;
	}
	
	this.setTTL = function(nttl){
		ttl = nttl;
	}
	
	this.getTTL = function(){
		return ttl;
	}
	
	this.setHops = function(nhops){
		hops = nhops;
	}
	
	this.getHops = function(){
		return hops;
	}
	
	this.addGGEPBlock = function(block){
		ggep_blocks.push(block);
	}
	
	this.getGGEPBlocks = function(){
		return ggep_blocks;
	}
	
	this.toString = function(){
		return require('util').inspect({
			'type': GnutellaMessage.getTypeString(type),
			'ttl': ttl,
			'hops': hops,
			'ggep_blocks': ggep_blocks
		});
	}
}

GnutellaMessage.decode = function(buffer){
	var decode_ggep = function(buffer){
		if(buffer.readUInt8(0) == 0xc3){
			var toreturn = [];
			var p = 0;
			var last = false;
			do{
				var block = {};
				var flags = buffer.readUInt8(++p);
				block.compression = (flags & 0x20) == 0x20;
				last = (flags & 0x80) == 0x80;
				var id_length = flags & 0xf;
				var id = buffer.toString('ascii', ++p, p += id_length);
				block.id = id;
				var i = 0;
				var data_length_temp;
				var data_length = 0;
				do{
					data_length_temp = buffer.readUInt8(p + i);
					data_length <<= 6;
					data_length |= data_length_temp & 0x3f;
					i++;
				}
				while((data_length_temp & 0x40) != 0x40 && i < 4);
				p += i;
				block.body = buffer.slice(p, p + data_length); 
				toreturn.push(block);
				p += data_length - 1;
			}
			while(!last);
			return toreturn;
		}
		else{
			return false;
		}
	};
	
	var guid = buffer.slice(0, 16);
	var type = buffer.readUInt8(16);
	
	var message = new GnutellaMessage(guid, type, null);
	
	var ttl = buffer.readUInt8(17);
	message.setTTL(ttl);
	var hops = buffer.readUInt8(18);
	message.setHops(hops);
	var length = buffer.readUInt32LE(19);
	var body = buffer.slice(23);
	
	switch(type){
		case GnutellaMessage.TYPES.PONG:
			var pong_body = body.slice(0, 14);
			message.setBody(pong_body);
			//var port = body.readUInt16LE(0);
			//var ip = body.readUInt8(2) + "." + body.readUInt8(3) + "." + body.readUInt8(4) + "." + body.readUInt8(5);
			//var files_shared = body.readUInt16LE(6);
			//var kbs_shared = body.readUInt16LE(10);
			//console.log(ip + ":" + port);
			
			var ggep_blocks = decode_ggep(body.slice(14));
			for(var i in ggep_blocks){
				message.addGGEPBlock(ggep_blocks[i]);
			}
			break;
		case GnutellaMessage.TYPES.PING:
			var ggep_blocks = decode_ggep(body);
			for(var i in ggep_blocks){
				message.addGGEPBlock(ggep_blocks[i]);
			}
			break;
	}
	
	return message;
};

GnutellaMessage.encode = function(gmessage){
	
	var ggep_length_encode = function(int){
		if(int < Math.pow(2, 6)){
			var buffer = new Buffer(1);
			buffer[0] = (0x40 | (int & 0x3f));
			return buffer;
		}
		else if(int < Math.pow(2, 12)){
			var buffer = new Buffer(2);
			buffer[0] = (0x80 | ((int & 0xFC0) >> 6));
			buffer[1] = (0x40 | (int & 0x3f));
			return buffer;
		}
		else if(int < Math.pow(2, 18)){
			var buffer = new Buffer(3);
			buffer[0] = (0x80 | ((int & 0x3F000) >> 12));
			buffer[1] = (0x80 | ((int & 0xFC0) >> 6));
			buffer[2] = (0x40 | (int & 0x3f));
			return buffer;
		}
		else{
			throw "Number too large to encode";
		}
	}
	
	var quick_length = 23 + (gmessage.getBody() != null ? gmessage.getBody().length : 0);
	var ggep_blocks = gmessage.getGGEPBlocks();
	for(var b in ggep_blocks){
		quick_length += (ggep_blocks[b].body.length) + 19;
	}
	quick_length *= 1.5;
	quick_length = Math.ceil(quick_length);
	if(isNaN(quick_length)) throw "NaN exception";
	
	var pos = 0;
	
	var buffer = new Buffer(quick_length);

	gmessage.getGUID().copy(buffer, 0, 0, 16);
	pos += 16;

	buffer.writeUInt8(gmessage.getType(), pos++);
	buffer.writeUInt8(gmessage.getTTL(), pos++);
	buffer.writeUInt8(gmessage.getHops(), pos++);
	
	var length_pos = pos;
	buffer.writeUInt32LE(0, pos);
	pos += 4;
	
	var mes_body = gmessage.getBody();
	if(mes_body != null){
		mes_body.copy(buffer, pos, 0);
		pos += mes_body.length;
	}
	
	if(ggep_blocks.length > 0){
		buffer.writeUInt8(0xc3, pos++);
		for(var b in ggep_blocks){
			var ggep_block = ggep_blocks[b];
			var flags = 0;
			flags |= (ggep_block.id.length & 0xf);
			flags |= (ggep_block.compression ? 0x20 : 0);
			flags |= (b == (ggep_blocks.length-1) ? 0x80 : 0); 

			buffer.writeUInt8(flags, pos++);

			buffer.write(ggep_block.id, pos, ggep_block.id.length, 'ascii');
			pos += ggep_block.id.length;
			
			var length_buffer = ggep_length_encode(ggep_block.body.length);
			length_buffer.copy(buffer, pos);
			pos += length_buffer.length;
			
			ggep_block.body.copy(buffer, pos);
			pos += ggep_block.body.length;
		}
	}

	buffer.writeUInt32LE((pos - length_pos - 4), length_pos);
	
	return buffer.slice(0, pos);
}

GnutellaMessage.TYPES = {
		PING: 0,
		PONG: 1,
		BYE: 2,
		PUSH: 64,
		QUERY: 128,
		QUERY_HIT: 129
};

GnutellaMessage.getTypeString = function(type){
	switch(type){
		case GnutellaMessage.TYPES.PING:
			return 'PING';
		case GnutellaMessage.TYPES.PONG:
			return 'PONG';
		case GnutellaMessage.TYPES.BYE:
			return 'BYE';
		case GnutellaMessage.TYPES.PUSH:
			return 'PUSH';
		case GnutellaMessage.TYPES.QUERY:
			return 'QUERY';
		case GnutellaMessage.TYPES.QUERY_HIT:
			return 'QUERY_HIT';
		default:
			return 'UNKNOWN';	
	}
	
}


var udp_sock = require('dgram').createSocket('udp4', function(msg, rinfo){
	console.log(rinfo);
	try{
		var gmes = GnutellaMessage.decode(msg);
		console.log(gmes.toString());
		
		var ggep_blocks = gmessage.getGGEPBlocks();
		for(var i in ggep_blocks){
			switch(ggep_blocks[i].id){
				case 'SCP':
					if('body' in ggep_blocks[i]){
						if(ggep_blocks[i].body[0] == 1){
							console.log("Wants Ultrapeers");
						}
						else{
							console.log("Wants Leafs");
						}
					}
					else{
						console.log("Wants Leafs");
					}
					break;
			}
		}
		
		var pong = new GnutellaMessage(
			gmes.getGUID(),
			GnutellaMessage.TYPES.PONG,
			new Buffer([57, 5, 127, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
		);
		
		var udphc = {id: 'UDPHC', compression: false, body: new Buffer("gil.homelinux.net")};
		pong.addGGEPBlock(udphc);
		
		var ipp = {id: 'IPP', compression: false, body: new Buffer([1,3,3,7,57,5])};
		pong.addGGEPBlock(ipp);
		
		var pong_buf = GnutellaMessage.encode(pong);
		//console.log(pong_buf);
		udp_sock.send(pong_buf, 0, pong_buf.length, rinfo.port, rinfo.address);
		
		console.log(GnutellaMessage.decode(pong_buf).toString());
	}
	catch(e){
		console.error(e);
	}
});
udp_sock.bind(1337);


console.log(sample_buffer);
var gmessage = GnutellaMessage.decode(sample_buffer);
//console.dir(gmessage);

var new_buffer = GnutellaMessage.encode(gmessage);
console.log(new_buffer);

var compare_buffer = function(a, b){
	if(sample_buffer.length == new_buffer.length){
		for(var i = 0; i < a.length; i++){
			if(a[i] != b[i]) throw i;
		}
		return true;
	}
	return false;
};

try{
	console.log(compare_buffer(sample_buffer, new_buffer));
}
catch(e){
	console.dir(e);
	console.log("Failed at: " + e);
	console.log(sample_buffer.slice(e-2));
	console.log(new_buffer.slice(e-2));
}

//console.log(gmessage);
var ggep_blocks = gmessage.getGGEPBlocks();
for(var i in ggep_blocks){
	switch(ggep_blocks[i].id){
		case 'UDPHC':
			console.log('UDPHC: ' + ggep_blocks[i].body.toString());
			break;
		case 'IPP':
			console.log('IPP: ');
			for(var b = 0; b < ggep_blocks[i].body.length; ){
				var ip = 	ggep_blocks[i].body.readUInt8(b) + "." + 
							ggep_blocks[i].body.readUInt8(b++) + "." + 
							ggep_blocks[i].body.readUInt8(b++) + "." + 
							ggep_blocks[i].body.readUInt8(b++);
				var port = ggep_blocks[i].body.readUInt16LE(b++);
				b++;
				console.log("\t" + ip + ':' + port);
			}
			break;
		case 'PHC':
			require('zlib').gunzip(ggep_blocks[i].body, function(error, result){
				console.log('PHC: ');
				console.log(result.toString())
			});
			break;
	}
}