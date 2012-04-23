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

var sample_data = new Array(0x2E,0x8B,0x1C,0xD5,0x5E,0xA5,0x90,0x79,0x2E,0x9D,0xB9,0x57,0xA4,0xCC,0x15,0x23,0x1,0x1,0x0,0x60,0x1,0x0,0x0,0x16,0x83,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0xC3,0x5,0x55,0x44,0x50,0x48,0x43,0x58,0x79,0x69,0x6E,0x2E,0x63,0x6C,0x6F,0x75,0x64,0x2E,0x62,0x69,0x73,0x68,0x6F,0x70,0x73,0x74,0x6F,0x6E,0x2E,0x6E,0x65,0x74,0x83,0x49,0x50,0x50,0x84,0x6C,0x63,0xF3,0x7E,0x9F,0x34,0x1F,0x3D,0x1A,0xC6,0xC5,0x71,0x48,0x18,0xF,0x92,0x9C,0x0,0x35,0x44,0x76,0xF7,0xF2,0xE4,0x8B,0x65,0xD,0xEB,0x13,0xCA,0x18,0x42,0xBE,0x9E,0xE0,0x63,0xB2,0x52,0x20,0xD1,0x8C,0x9A,0x55,0x42,0xBF,0xD0,0xA6,0xD6,0x5D,0x44,0xBF,0x80,0xF4,0xA0,0x67,0x18,0xC,0x21,0x9A,0xAB,0x7E,0x6C,0x4A,0xC8,0xE6,0x49,0xBF,0x43,0xBE,0xC8,0xF,0x1B,0xAA,0x63,0xF3,0xB,0x69,0x5,0x64,0x44,0x32,0x91,0xBF,0x2D,0x9C,0xDF,0x84,0x79,0x78,0xCA,0x18,0xAE,0x5B,0xF9,0xC5,0x88,0x69,0x18,0x62,0x5C,0x77,0xE9,0xC2,0x62,0xF3,0x5B,0xD2,0x8B,0xC2,0x6D,0x82,0x6C,0xEA,0xE3,0x1A,0xDC,0x3,0x58,0x66,0x4E,0x5B,0x43,0xB5,0x0,0x19,0xF6,0x39,0xDA,0xE6,0x23,0x68,0xE9,0x18,0xDD,0x79,0xEF,0x12,0xBA,0x7C,0x8E,0xA7,0x13,0x71,0x6A,0x14,0xB4,0x22,0x10,0xE6,0xCA,0x18,0xCC,0x70,0xA6,0x20,0xF4,0x47,0xB8,0xA0,0x88,0x3B,0x88,0x69,0x63,0x6B,0x62,0x3B,0x88,0x69,0x7A,0x16,0x5F,0x63,0x88,0x69,0x48,0xB2,0x90,0xF5,0x24,0xC9,0x18);

var buffer = new Buffer(sample_data);

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
		var flags = buffer.readUInt8(1);
		var id_length = flags & 0xf;
		var id = buffer.toString('ascii', 2, 2 + id_length);
		console.log(id);

		var offset = 2 + id_length;
		var i = 0;
		var data_length_temp;
		var data_length = 0;
		do{
			data_length_temp = buffer.readUInt8(offset + i);
			data_length |= ((data_length_temp & 0x3f) << (i*8));
			i++;
		}
		while((data_length_temp & 0x40) != 0x40 || i > 4);
		var body = buffer.slice(offset + i, offset + i + data_length);
		console.log(data_length);
		return body;
	}
	else{
		return false;
	}
}

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