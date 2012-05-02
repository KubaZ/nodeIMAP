var net = require('net');
var sys = require('util');
var fs = require('fs');

var eol = "\r\n";

var connectionLog = fs.createWriteStream('log.txt', {'flags': 'a'});

var HOST = '127.0.0.1';
var PORT = 6969;
var serv_prompt = "S: ";

net.createServer(function(socket) {
    socket.setTimeout(1800000);
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);
    connectionLog.write("Connection from: " + socket.remoteAddress + ':' + socket.remotePort + " at " + Date() + "\n");
    
    var state = "nonauth";
    var buffer = "";
    // patterns for commands
    var nonauth_command_patterns = {
      login: /^LOGIN\s*/i,
      tls: /^STARTTLS/i,
      auth: /^AUTHENTICATE\s+/i
    }

    var anystate_command_patterns = {
      noop: /^NOOP/i,
      capability: /^CAPABILITY/i,
      logout: /^LOGOUT/i
    }
    
    var auth_command_patterns = {
      select: /^SELECT/i,
      examine: /^EXAMINE/i,
      create: /^CREATE/i,
      delet: /^DELETE/i,
      rename: /^RENAME/i,
      subscribe: /^SUBSCRIBE/i,
      unsubscribe: /^UNSUBSCRIBE/i,
      list: /^LIST/i,
      lsub: /^LSUB/i,
      status: /^STATUS/i,
      append: /^APPEND/i
    }
    
    var selected_command_patterns = {
      check: /^CHECK/i,
      close: /^CLOSE/i,
      expunge: /^EXPUNGE/i,
      search: /^SEARCH/i,
      fetch: /^FETCH/i,
      store: /^STORE/i,
      copy: /^COPY/i,
      uid: /^UID/i
    }
      /*socket.write("* BYE IMAP4rev1 Server Logging out" + eol);
      socket.write("OK LOGOUT completed" + eol);*/
    // Timeout event
    socket.addListener('timeout', function(){
        socket.destroy()
        console.log(serv_prompt + "Connection Timeout");
    });
    // On connection
    socket.addListener('connect', function() {
      socket.write("* IMAP4rev1 Service ready");
      console.log(serv_prompt + "* IMAP4rev1 Service ready")
    });

    function parseCommand(line, command_patterns) {
      for( var cmd in command_patterns) {
        if (command_patterns[ cmd ].test( line ) ) {
          sleep(20);
          return cmd;
        }
      }
    }
    function sleep(time){
       time = time * 1000;
       var start = (new Date()).getTime();
       while(true){
          alarm = (new Date()).getTime();
          if(alarm - start > time){ break; }
       }
    }
/*    function extractArgs(line) {
      var argc = [];
      argc[0] = 0;
      var args = [];
      var tmp = 0;
      for (var i = 0; i < line.length ; i++) {
        if (line[i]==' ') {
          tmp++;
          argc[tmp]=i;
        }
      }
      tmp++;
      argc[tmp]=line.length;
      for (var i = 0; i < tmp ; i++) {
        args[i]=line.substr(argc[i],argc[i+1]);
        console.log(args[i]);
      }
      return args;
    }*/

    // Add a 'data' event handler to this instance of socket
    socket.on('data', function(data) {
      var line = data.toString();
      console.log("C: " + line);
      var splited = [];
      splited = line.split(" ");
      var cmd = parseCommand(splited[0], anystate_command_patterns);
      
      // Write the line back to the socket, the client will receive it as data from the server
      socket.write(line + cmd + state);
      console.log(serv_prompt + line);  
    });

    // This is here incase any errors occur
    connectionLog.on('error', function (err) {
      console.log(err);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);