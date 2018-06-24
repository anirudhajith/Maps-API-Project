//Ok, write a small application that shows a Google map, in the browser, gets location of a few people from a http request (i will give you the api) and display them on the map, using NodeJS and host it on your domain.

var http = require('http');
var url = require('url');
var fs = require('fs');
var request = require('request');
var port = 5030;
var apiKey;

fs.readFile("api.key", "utf8", function (err, key) {
    if (err) throw err;
    apiKey = key;
    var data = getData();
    setInterval(function() {data = getData();}, 5000);
});


console.log("Server running on localhost:" + port);
console.log("Ctrl+C to stop...");

http.createServer(function(req, res) {
    var reqUrl = url.parse(req.url).pathname;
    if(reqUrl == "/") reqUrl = "/index.html";
    fs.createReadStream(reqUrl.slice(1)).pipe(res);
    res.writeHead(200);
    console.log("**SERVED** " + reqUrl);
}).listen(port);


function getData() {
   request({
      uri: "https://iot.kpraveen.in/api/Users/5acb3b1a146ca8f84d18a8b2/data?access_token=" + apiKey,
      method: "GET",
      timeout: 10000,
      followRedirect: true,
      maxRedirects: 10
   }, function(error, response, body) {
     console.log(body);
     fs.writeFile("data", body, function(err) {
        if(err) {
           return console.log(err);
        }
     }); 
   }); 
}

