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
  };
  
  this.getGUID = function(){
    return guid;
  };
  
  this.setBody = function(nbody){
    body = nbody;
  };
  
  this.getBody = function(){
    return body;
  };
  
  this.setTTL = function(nttl){
    ttl = nttl;
  };
  
  this.getTTL = function(){
    return ttl;
  };
  
  this.setHops = function(nhops){
    hops = nhops;
  };
  
  this.getHops = function(){
    return hops;
  };
  
  this.addGGEPBlock = function(block){
    ggep_blocks.push(block);
  };
  
  this.getGGEPBlocks = function(){
    return ggep_blocks;
  };
  
  this.toString = function(){
    var inspect = {
      'type': GnutellaMessage.getTypeString(type),
      'guid': guid.toString('hex'),
      'ttl': ttl,
      'hops': hops,
      'ggep_blocks': {}
    };
    for(var i in ggep_blocks){
      switch(ggep_blocks[i].id){
        case 'UDPHC':
          console.assert(ggep_blocks[i].body !== undefined, 'UDPHC body is undefined');
          inspect.ggep_blocks.UDPHC = ggep_blocks[i].body.toString();
          break;
        case 'IPP':
          inspect.ggep_blocks.IPP = [];
          for(var b = 0; b < ggep_blocks[i].body.length; ){
            var ip = ggep_blocks[i].body.readUInt8(b) + "." + 
                 ggep_blocks[i].body.readUInt8(b++) + "." + 
                 ggep_blocks[i].body.readUInt8(b++) + "." + 
                 ggep_blocks[i].body.readUInt8(b++);
            var port = ggep_blocks[i].body.readUInt16LE(b++);
            b++;
            inspect.ggep_blocks.IPP.push(ip + ':' + port);
          }
          break;
        case 'PHC':
          if(ggep_blocks[i].compression) {
            require('zlib').gunzip(ggep_blocks[i].body, function(error, result){
              console.assert(result !== undefined && result !== false, error);
              inspect.ggep_blocks.PHC = result.toString();
            });
          }
          else{
            inspect.ggep_blocks.PHC = "[uncompressed] " + ggep_blocks[i].body.toString();
          }
          break;
        case 'SCP':
          inspect.ggep_blocks.SCP = ggep_blocks[i].body.readUInt8(0);
          break;
      }
    }
    return require('util').inspect(inspect);
  };
};

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
  };
  
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
};

GnutellaMessage.encodeIPPort = function(ip, port){
  var buffer = new Buffer(6);
  var octals = null;
  if(port == undefined){
    try{
      ipport = ip.split(':');
      octals = ipport[0].split('.');
      port = parseInt(ipport[1]);
    }
    catch(e){return false;}
  }
  else{
    try{
      octals = ipport[0].split('.');
    }
    catch(e){return false;}
  }
  buffer.writeUInt8(parseInt(octals[0]), 0);
  buffer.writeUInt8(parseInt(octals[1]), 1);
  buffer.writeUInt8(parseInt(octals[2]), 2);
  buffer.writeUInt8(parseInt(octals[3]), 3);
  buffer.writeUInt16LE(port, 4);
  return buffer;
};

module.exports = GnutellaMessage;