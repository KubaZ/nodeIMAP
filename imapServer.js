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
      login: /^LOGIN/i,
      tls: /^STARTTLS/i,
      auth: /^AUTHENTICATE/i
    }

    var anystate_command_patterns = {
      noop: /^NOOP/i,
      capability: /^CAPABILITY/i,
      logout: /^LOGOUT/i
    }

    var auth_command_patterns = {};    

    for ( var x in [
      "select", "examine", "create", "delete"] ) {
      y = "^" + x.toUpperCase();
      auth_command_patterns[x] = new RegExp(y);
      console.log(x, y);
    }

    var auth_command_patterns = {
      select: /^SELECT/i,
      examine: /^EXAMINE/i,
      create: /^CREATE/i,
      'delete': /^DELETE/i,
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
          return cmd;
        }
      }
    }

    // function execCommand

    // Add a 'data' event handler to this instance of socket
    socket.on('data', function(data) {
      var line = data.toString();
      console.log("C: " + line);

      var splited = [];
      splited = line.split(" ");
      setTimeout(function(){
        var cmd = parseCommand(splited[0], anystate_command_patterns);
        socket.write("Your command: " + cmd);
      }, 0);

      socket.write("U wrote: " + line);
      // Write the line back to the socket, the client will receive it as data from the server
      console.log(serv_prompt + line);  
      line = "";
    });

    // This is here incase any errors occur
    connectionLog.on('error', function (err) {
      console.log(err);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
