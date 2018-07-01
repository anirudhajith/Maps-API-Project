var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    request = require('request'),
    util = require('util');

var port = 5030;

console.log("Starting server on port", port);

http.createServer(function (req, res) {

    var urlObject = url.parse(req.url);
    var urlPath = urlObject.pathname;
    if (urlPath == "/") urlPath = "/index.html";
    console.log(urlPath, "requested");

    if (urlPath == "/data") {

        fs.readFile(__dirname + "/api.key", function (err, accessToken) {
            if (err) throw err;
            request({
                uri: "https://iot.kpraveen.in/api/Users/me/data?access_token=" + accessToken,
                method: "GET",
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            }, function (err, response, body) {
                if (err) throw err;
                res.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
                res.write(body);
                res.end();
                console.log(body);
            });
        });

    } else if (urlPath == "/directions") {

        var sCoord = urlObject.query.source,
            dCoord = urlObject.query.dest,
            key = "AIzaSyD5WmggCvYp6TFkoYfCZPfCukpr6LSO9AY";

        request({
            uri: "https://maps.googleapis.com/maps/api/directions/json?origin=" + sCoord + "&destination=" + dCoord + "&key=" + key,
            method: "GET",
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10
        }, function (err, response, body) {
            if (err) throw err;
            res.writeHead(200);
            res.write(body);
        });

    } else {
        var localPath = __dirname + urlPath;
        if (fs.existsSync(localPath)) {
            fs.createReadStream(localPath).pipe(res);
        } else {
            res.writeHead(200);
            res.write("<h1>404</h1> <hr> <h2>" + urlPath + " not found. </h2>");
            console.log("404 sent");
        }
    }
    

    console.log("response sent");
}).listen(port);