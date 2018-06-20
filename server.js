var http = require('http');
var fs = require('fs');
var port = 5030;

console.log("Server running on localhost:" + port);
console.log("Ctrl+C to stop...");

http.createServer(function(req, res) {
    fs.createReadStream("index.html").pipe(res);
    res.writeHead(200);
    console.log("**SERVED**");
}).listen(port);