//Ok, write a small application that shows a Google map, in the browser, gets location of a few people from a http request (i will give you the api) and display them on the map, using NodeJS and host it on your domain.

var http = require('http');
var url = require('url');
var fs = require('fs');
var port = 5030;

console.log("Server running on localhost:" + port);
console.log("Ctrl+C to stop...");

http.createServer(function(req, res) {
    var reqUrl = url.parse(req.url).pathname;
    if(reqUrl == "/") reqUrl = "/index.html";
    fs.createReadStream(reqUrl.slice(1)).pipe(res);
    res.writeHead(200);
    console.log("**SERVED** " + reqUrl);
}).listen(port);