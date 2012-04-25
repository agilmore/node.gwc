var TYPES = {
		PING: 0,
		PONG: 1,
		BYE: 2,
		PUSH: 64,
		QUERY: 128,
		QUERY_HIT: 129
}
TYPES[TYPES.PING] = 'Ping';
TYPES[TYPES.PONG] = 'Pong';
TYPES[TYPES.BYE] = 'Bye';
TYPES[TYPES.PUSH] = 'Push';
TYPES[TYPES.QUERY] = 'Query';
TYPES[TYPES.QUERY_HIT] = 'Query Hit';

var sample_data = new Array(0x5B,0x37,0x31,0x27,0x41,0x67,0x70,0x62,0x10,0x81,0xF,0xB6,0xAF,0x63,0xD2,0xCE,0x1,0x1,0x0,0x60,0x1,0x0,0x0,0x16,0x83,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0xC3,0x5,0x55,0x44,0x50,0x48,0x43,0x58,0x79,0x69,0x6E,0x2E,0x63,0x6C,0x6F,0x75,0x64,0x2E,0x62,0x69,0x73,0x68,0x6F,0x70,0x73,0x74,0x6F,0x6E,0x2E,0x6E,0x65,0x74,0x83,0x49,0x50,0x50,0x84,0x6C,0x46,0x6D,0x30,0x11,0xD1,0x3E,0x40,0x97,0x9,0x9D,0x5F,0x8A,0x44,0x20,0xF6,0x4,0x27,0x22,0x32,0x5D,0xF,0x92,0x80,0x4A,0x4A,0x45,0xB9,0xE,0xB5,0x6E,0x4D,0xCC,0xB,0x6,0xAA,0xF,0x77,0xAC,0x62,0x66,0xCA,0x18,0x62,0x4D,0x87,0x77,0x14,0x22,0xB4,0x1B,0xE4,0x79,0xCA,0x18,0x7D,0x0,0x83,0x30,0xCA,0x18,0xDB,0x6B,0xF2,0xD5,0xDA,0x8,0x7B,0xE3,0xFB,0x54,0xCA,0x18,0x44,0x20,0xEA,0xC9,0x70,0x76,0xE,0xC1,0x6C,0xCD,0xCA,0x18,0x18,0x2,0x4E,0x89,0x5E,0x9D,0x62,0x43,0xEA,0x1F,0xE2,0x6E,0x18,0x59,0xD9,0x55,0x8C,0x59,0x18,0xFF,0xF,0x44,0x88,0x69,0x60,0x1C,0x20,0x57,0x96,0x93,0x65,0x6F,0xF,0x30,0xCA,0x18,0x42,0x1B,0x8B,0x4F,0x86,0x44,0x46,0xBD,0xDD,0x6B,0xD8,0x21,0xD8,0x2D,0x2B,0xD4,0x4A,0x10,0x4C,0x17,0xCF,0x11,0x0,0x7F,0xAD,0x3,0xA5,0xF,0x4F,0x89,0xDD,0x4D,0xF2,0xF,0xCA,0x18,0x71,0x9F,0x1D,0xE2,0xCA,0x18,0xDA,0x2B,0x1E,0x54,0xCA,0x18,0x47,0xCC,0x38,0x6B,0x2,0x68,0x43,0xF9,0xF1,0x3,0x2,0x9,0x7E,0x13,0xBD,0x2F,0xCA,0x18,0x7D,0xCD,0x41,0x9F,0xCA,0x18,0x3D,0x23,0x3F,0xF9,0x6,0x8C,0x63,0x2B,0x40,0x7F,0x7,0x29,0x45,0xF4,0xDB,0x50,0x88,0x15,0x4B,0x6D,0xE1,0x58,0xC9,0x26,0xAE,0x64,0x59,0xB,0x88,0x69,0x7D,0x1F,0x50,0xC9,0xCA,0x18,0x4A,0x32,0x26,0x2F,0x55,0x65,0x18,0x5D,0xA3,0x9F,0x41,0x48,0x76,0xE9,0x71,0x8D,0xA6,0x38,0x7D,0xE,0x21,0x33,0xCA,0x18,0xAE,0x40,0xA3,0xDE,0xF,0x65,0x6F,0x67,0x34,0x20,0xCA,0x18,0x45,0xF8,0x97,0xBD,0xE1,0x23,0x47,0xBE,0xBC,0xD2,0xC2,0x82,0xB6,0xA9,0xB7,0x2A,0xCA,0x18,0x51,0xE9,0x54,0x2B,0x91,0x10,0xB8,0x9B,0xF4,0x71,0x7E,0x47,0x5D,0x1,0xDC,0xA6,0x8F,0x8);

var buffer = new Buffer(sample_data);
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
var GnutellaMessage = function(guid, type){
	
	this.ttl = 0;
	this.hops = 0;
	this.ggep_blocks = [];
	
	this.setTTL = function(ttl){
		this.ttl = ttl;
	}
	
	this.setHops = function(hops){
		this.hops = hops;
	}
	
	this.addGGEPBlock = function(block){
		this.ggep_blocks.push(block);
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
				//console.log("flags = " + flags);
				block.compression = (flags & 0x20) == 0x20;
				last = (flags & 0x80) == 0x80;
				var id_length = flags & 0xf;
				var id = buffer.toString('ascii', ++p, p += id_length);
				block.id = id;
				//console.log(id);
		
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
					//console.log("data_length=" + data_length);
					//console.log("((" + data_length_temp + " & 0x3f) << (" + i + "*8)) = " + ((data_length_temp & 0x3f) << (i*8)));
					//console.log("((" + data_length_temp + " & 0x3f) = " + (data_length_temp & 0x3f));
					//data_length |= ((data_length_temp & 0x3f) << (i*8));
					data_length <<= 6;
					data_length |= data_length_temp & 0x3f;
					//console.log("data_length=" + data_length);
					i++;
				}
				while((data_length_temp & 0x40) != 0x40 && i <= 4);
				p += i;
				//console.log(p);
				//console.log(buffer.length);
				//console.log(data_length);
				//console.log(buffer.slice(p, p + data_length));
				block.body = buffer.slice(p, p + data_length); 
				toreturn.push(block);
				p += data_length - 1;
				//console.log("LOOP END p = " + p);
			}
			while(!last);
			return toreturn;
		}
		else{
			return false;
		}
	};
	
	var guid = buffer.slice(0, 15);
	var type = buffer.readUInt8(16);
	
	var message = new GnutellaMessage(guid, type);
	
	var ttl = buffer.readUInt8(17);
	message.setTTL(ttl);
	var hops = buffer.readUInt8(18);
	message.setHops(hops);
	var length = buffer.readUInt32LE(19);
	var body = buffer.slice(23);
	
	switch(type){
		case GnutellaMessage.TYPES.PONG:
			var port = body.readUInt16LE(0);
			var ip = body.readUInt8(2) + "." + body.readUInt8(3) + "." + body.readUInt8(4) + "." + body.readUInt8(5);
			var files_shared = body.readUInt16LE(6);
			var kbs_shared = body.readUInt16LE(10);
			console.log(ip + ":" + port);
			
			var ggep_blocks = decode_ggep(body.slice(14));
			console.dir(ggep_blocks);
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

var gmessage = GnutellaMessage.decode(buffer);
console.dir(gmessage);

/*
2.3.1 GGEP Format

A GGEP block always starts with a magic byte used to help distinguish
GGEP extensions from legacy data which may exist.  It must be set to 
the value 0xC3.

When a GGEP block is used between the nulls in a result in a Query 
Hits message, it is not allowed to contain any null bytes. This 
requires some special tricks in the field format.

The magic byte is followed by any number of extensions. They SHOULD 
be processed in the order in which they appear. The following is the 
format of each extension:

Bytes used:     Field Name:
1               Flags
1-15            ID
1-3             Data Length
x               Extension Data

Flags:          These are options which describe the encoding of the 
                extension header and data.

                Bit    Name             
                7      Last Extension.  When set, this is the last 
                       extension in the GGEP block.

                6      Encoding.  The value contained in this field 
                       dictates the type of encoding which should be 
                       applied to the extension data (after possible 
                       compression).

                       0 = There is no encoding on the data. 
                       1 = The data is encoded using the COBS scheme.

                       Details about the COBS encoding scheme can be 
                       found at http://www.acm.org/sigcomm/sigcomm97/
                                    papers/p062.pdf  

                5      Compression.  The value contained in this 
                       field dictates the type of compression that 
                       should be applied to the extension data. 

                       0 = The extension data has not been compressed.
                       1 = The extension data should be decompressed 
                           using the deflate algorithm. 

                       One should only compress data if doing so will
                       make a material difference in the resulting 
                       packet size.                       

                       Details about the Deflate compression scheme 
                       may be found at http://www.gzip.org/zlib/
                       and http://www.faqs.org/rfcs/rfc1951.html 

                4      Reserved. This field is currently reserved for
                       future use.  It must be set to 0. 

                3-0    ID Len Value 1-15 can be stored here.  Since 
                       this will not be zero, it ensures this byte 
                       will not be 0x0. 

ID:             The raw binary data in this field is the extension ID.
                The length of this field can range between 1 and 15 
                bytes, and is determined by the Flags field. See 
                section 2.3.2 below on suggestions and rules for 
                creating extension IDs.  No byte in the extension 
                header may be 0x0.

Data Length:    This is the length of the raw extension data.  Please
                note that most Gnutella clients will drop messages, 
                and possibly connections if the message size is 
                larger than a certain threshold (which varies 
                according to message type).  Please pay attention to 
                these limits when creating and bundling new 
                extensions. 

                This field uses an encoding technique that ensures 
                that 0x0 is never the value of any byte.  Steps were 
                also taken to ensure that the encoding is compact. In
                this technique, a length field is the concatenation 
                of length chunks.  The format of each length chunk 
                (which contains 6 bits of length info) is described 
                in bit level below:

                Format:
                76543210
                MLxxxxxx
                        
                M = 1 if there is another length chunk in the 
                sequence, else 0

                L = 1 if this is the last length chunk in the 
                sequence, else 0

                xxxxxx = 6 bits of data.

                01aaaaaa ==> aaaaaa (2^6 values = 0-63)

                10bbbbbb 01aaaaaa ==> bbbbbbaaaaaa 
                (2^12 values = 0-4095)

                10ccccccc 10bbbbbb 01aaaaaa ==> ccccccbbbbbbaaaaaa 
                (2^18 values = 0-262143)

                Boundary Cases:
                0      =                       01 000000b = 0x40 
                63     =                       01 111111b = 0x7f 
                64     =            10 000001  01 000000b = 0x8140 
                4095   =            10 111111  01 111111b = 0xbf7f 
                4096   = 10 000001  10 000000  01 000000b = 0x818040
                262143 = 10 111111  10 111111  01 111111b = 0xbfbf7f
                
                As you see, when the bits are concatenated, the 
                number is in big endian format.

Extension Data  The actual extension data.  The format of this field 
                varies between extensions.  A servent that does not 
                recognize and extension will not be able to parse the
                Extension data, but since the length of this field is
                specified by Data Length, it can still skip to the 
                next extension.  Note that extensions MAY be empty.
*/