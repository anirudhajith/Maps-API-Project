//Ok, write a small application that shows a Google map, in the browser, gets location of a few people from a http request (i will give you the api) and display them on the map, using NodeJS and host it on your domain.

var http = require('http');
var url = require('url');
var fs = require('fs');
var request = require('request');
var util = require('util');
var port = 5030;
var accessToken;
var DATA;

console.log("Server running on localhost:" + port);
console.log("Ctrl+C to stop...");

http.createServer(function (req, res) {

    fs.readFile("api.key", "utf8", function (err, key) {
        if (err) throw err;
        accessToken = key;
        var data = getData();
        setInterval(function () { data = getData(); }, 5000);
    });

    var reqUrl = url.parse(req.url).pathname;
    if (reqUrl == "/") reqUrl = "/index.html";
    if (url.parse(req.url, true).query.source) {

        var sCoord, dCoord;
        for (person in DATA.information) {
            if (DATA.information[person].name == url.parse(req.url, true).query.source) {
                sCoord = DATA.information[person].latitude + "," + DATA.information[person].longitude;
            }
            if (DATA.information[person].name == url.parse(req.url, true).query.dest) {
                dCoord = DATA.information[person].latitude + "," + DATA.information[person].longitude;
            }
        }
        console.log("Calling GOOGLE: ");
        request({
            uri: "https://maps.googleapis.com/maps/api/directions/json?origin=" + sCoord + "&destination=" + dCoord + "&key=AIzaSyD5WmggCvYp6TFkoYfCZPfCukpr6LSO9AY",
            method: "GET",
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10
        }, function (error, response, body) {
            console.log("BOODDDDYYY: " + body);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write(body);
            res.end();
        });


        //getRoute(url.parse(req.url, true).query.source, url.parse(req.url, true).query.dest);
    } else {
        fs.createReadStream(reqUrl.slice(1)).pipe(res);
    }
    res.writeHead(200);
    console.log("**SERVED** " + reqUrl);

    fs.readFile("data", "utf8", function (err, data) {
        if (data) {
            data = JSON.parse(data);
            DATA = data;
        }
        //console.log(data, data.information);
        for (person in data.information) {
            var postData = '{"type": "startLocationJob","highPriority": true,"userName": "' + data.information[person].name + '"}';
            //console.log(31);
            request.post({
                headers: { 'content-type': 'application/json' },
                url: "https://iot.kpraveen.in/api/FCM",
                form: JSON.parse(postData)
            }, function (error, response, body) {
                //console.log(body);
                //console.log("Tried to update " + data.information[person].name);
            });
        }
    });


}).listen(port);


function getData() {
    request({
        uri: "https://iot.kpraveen.in/api/Users/me/data?access_token=" + accessToken,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function (error, response, body) {
        //console.log(body);
        fs.writeFile("data", body, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    });
}

function getRoute(source, dest) {
    //console.log(DATA.information);

}

