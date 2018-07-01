var bangalore = { lat: 12.9716, lng: 77.5946 };
var pos;
var zoomLevel = 9;
var map;
var name;
var markers = {};
var infoBoxes = {};
var circles = {};
var follow;
var lastCentered;
var dPath;

google.maps.event.addDomListener(window, 'load', initMap);

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { zoom: zoomLevel, center: bangalore, /*disableDoubleClickZoom: true,*/ mapTypeControl: true });
    //document.getElementsByName("zoom")[0].value = map.getZoom();

    performRequest();
}

function performRequest() {
    var invocation = new XMLHttpRequest();
    var url = '/data';

    if (invocation) {
        invocation.open('GET', url, true);
        invocation.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                updateMarkers(JSON.parse(this.responseText));
            }
        };
        invocation.send();
        console.log("Request successful");
    } else {
        console.log("Request failed");
    }

    //if(follow) centerPerson(follow);
}

function updateMarkers(data) {
    //console.log(data);
    if (Object.keys(markers).length === 0 && markers.constructor === Object) {
        for (person in data.information) {
            console.log(data.information[person]);
            //var name = data.information[person].name;
            pos = {
                lat: data.information[person].latitude,
                lng: data.information[person].longitude
            };

            markers[data.information[person].name] = new google.maps.Marker({
                position: pos,
                map: map,
                title: data.information[person].name,
                //icon: 'http://iot.kpraveen.in/images/' + data.information[person].name + '.png',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 0
                }
                /*label: {color: "yellow", text: data.information[person].name}*/
            });

            infoBoxes[data.information[person].name] = new InfoBox({
                content: "<img class='infobox-marker' src='marker.png'><img class='infobox-avatar' src='https://iot.kpraveen.in/images/" + data.information[person].name + ".png' onclick='centerPerson(\"" + data.information[person].name + "\")' ondblclick='followPerson(\"" + data.information[person].name + "\")' oncontextmenu='getRouteTo(\"" + data.information[person].name + "\")'><div class='infobox-text'>" + getTimeAgoString(data.information[person].lastLocationTime) + "</div>",
                title: data.information[person].name,
                disableAutoPan: false,

                alignBottom: false,
                pixelOffset: new google.maps.Size(-45, -90),
                zIndex: -1,
                boxClass: "infobox",

            });

            circles[data.information[person].name] = new google.maps.Circle({
                strokeColor: '#0000FF',
                TostrokeOpacity: 0.2,
                TostrokeWeight: 2,
                TofillColor: "#0000FF",
                TofillOpacity: 0.10,
                Tomap: map,
                center: pos,
                radius: data.information[person].accuracy
            });

            infoBoxes[data.information[person].name].open(map, markers[data.information[person].name]);

            markers[data.information[person].name].addListener('click', function () {
                map.panTo(this.getPosition());
                console.log(this.getTitle() + " centred");
            });

            markers[data.information[person].name].addListener('dblclick', function () {
                if (follow) {
                    follow = undefined;
                    console.log("Unfollowed");
                } else {
                    follow = this;
                    //document.getElementsByName("unfollow")[0].style.display = "block";
                    console.log("Following " + follow.getTitle());
                }
            });
            //console.log(pos);
        }
    } else {
        for (person in data.information) {
            //console.log(data.information[person]);
            pos = {
                lat: data.information[person].latitude,
                lng: data.information[person].longitude
            };

            markers[data.information[person].name].setPosition(pos);
            infoBoxes[data.information[person].name].setContent("<img class='infobox-marker' src='marker.png'><img class='infobox-avatar' src='https://iot.kpraveen.in/images/" + data.information[person].name + ".png' onclick='centerPerson(\"" + data.information[person].name + "\")' ondblclick='followPerson(\"" + data.information[person].name + "\")' oncontextmenu='getRouteTo(\"" + data.information[person].name + "\")'><div class='infobox-text'>" + getTimeAgoString(data.information[person].lastLocationTime) + "</div>");
            circles[data.information[person].name].setCenter(pos);
            circles[data.information[person].name].setRadius(data.information[person].accuracy);

            if (follow) map.panTo(markers[follow].getPosition());
            //console.log(pos);
        }
    }
    //console.log(markers);
}

function centerPerson(person) {
    console.log(markers[person].getPosition());
    map.panTo(markers[person].getPosition());
    console.log(person + " centred");
    lastCentered = person;
}

function getRouteTo(person) {
    if (lastCentered) {
        var cCoord = markers[lastCentered].getPosition();
        var pCoord = markers[person].getPosition();
        var request = new XMLHttpRequest();
        var url = "/data?source=" + lastCentered + "&dest=" + person;
        
        if (request) {
            request.open('GET', url, true);
            console.log("Getting route from " + lastCentered + " to " + person);
            request.onreadystatechange = function() {
                console.log("Trying");
                if (this.readyState == 4 && this.status == 200) {
                    console.log(this.responseText);
                    var polyline = google.maps.geometry.encoding.decodePath(JSON.parse(this.responseText).routes[0].overview_polyline.points);
                    dPath = new google.maps.Polyline({
                        path: polyline,
                        geodesic: true,
                        strokeColor: "#FF0000",
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });
                    dPath.setMap(map);
                    console.log("Request successful");
                }
            }
            request.send();
        } else {
            console.log("Request failed");
        }
    }
}

function followPerson(person) {
    if (follow) {
        follow = undefined;
        console.log("Unfollowed");
    } else {
        follow = person;
        //document.getElementsByName("unfollow")[0].style.display = "block";
        console.log("Following " + follow);
    }
}

function getTimeAgoString(lastSeen) {
    var now = new Date();
    var ls = new Date(lastSeen);
    var secAgo = Math.round((now - ls) / 1000);

    if (secAgo < 60) { //seconds
        return (secAgo + "s ago");
    } else if (secAgo < 3600) { //minutes
        return (Math.floor(secAgo / 60) + "m ago");
    } else if (secAgo < 86400) { //hours
        return (Math.floor(secAgo / 3600) + "h " + Math.floor((secAgo % 3600) / 60) + "m ago");
    } else {
        return (Math.floor(secAgo / 86400) + "d ago");
    }
    return ("Last seen on " + now);
}

function welcome() {
    alert("Welcome " + getCookie("name") + "!");
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function updateZoomLevel(newZL) {
    map.setZoom(parseInt(newZL));
}

setInterval(performRequest, 5000);


/*
if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        pos = {lat: position.coords.latitude, lng: position.coords.longitude};
        map.panTo(pos);
        map.setZoom(17);
        marker.setPosition(pos);
        //marker.setLabel("Your current position");
        

    });
}
*/
