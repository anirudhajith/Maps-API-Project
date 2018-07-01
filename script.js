

google.maps.event.addDomListener(window, 'load', init);

function init() {
    var gMapElements = {
        map: null,
        markers: [],
        infoboxes: [],
        circles: [],
        lastCentered: null,
        following: null
    };

    initMap(gMapElements);
    initMapElements(gMapElements);
    console.log("initialized");
    //setInterval(updateMapElements(gMapElements), 5000);
}


function initMap(mapElements) { // initializes map object
    mapElements.map = new google.maps.Map(document.getElementById('map'), {
        center: { // Bangalore
            lat: 12.9716,
            lng: 77.5946
        },
        zoom: 12,
        mapTypeControl: true
    });
}

function initMapElements(mapElements) { // initializes markers, infoboxes, circles

    var reqObj = new XMLHttpRequest();
    var url = '/data';
    var dataObj;

    if (reqObj) {
        reqObj.open('GET', url, true);
        reqObj.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("req successful");
                dataObj = JSON.parse(this.responseText).information;
                console.log(dataObj);
                for (person in dataObj) {
                    var pos = {
                        lat: dataObj[person].latitude,
                        lng: dataObj[person].longitude
                    };

                    mapElements.markers[person] = new google.maps.Marker({
                        position: pos,
                        map: mapElements.map,
                        title: dataObj[person].name,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 0
                        }
                    });

                    mapElements.infoboxes[person] = new InfoBox({
                        content: "<img class='infobox-marker' src='marker.png'><img class='infobox-avatar' src='https://iot.kpraveen.in/images/"
                            + dataObj[person].name + ".png' onclick='centerPerson(\""
                            + person + "\")' ondblclick='followPerson(\""
                            + person + "\")' oncontextmenu='drawRouteTo(\""
                            + person + "\")'><div class='infobox-text'>"
                            + getTimeAgoString(dataObj[person].lastLocationTime) + "</div>",

                        title: dataObj[person].name,
                        disableAutoPan: false,
                        alignBottom: false,
                        pixelOffset: new google.maps.Size(-45, -90),
                        zIndex: -1,
                        boxClass: "infobox",
                    });

                    mapElements.circles[person] = new google.maps.Circle({
                        strokeColor: '#0000FF',
                        TostrokeOpacity: 0.2,
                        TostrokeWeight: 2,
                        TofillColor: "#0000FF",
                        TofillOpacity: 0.10,
                        Tomap: map,
                        center: pos,
                        radius: dataObj[person].accuracy
                    });

                    mapElements.infoboxes[person].open(mapElements.map, mapElements.markers[person]);
                }
            } else {
                console.log("req failed");
            }
        };
        reqObj.send();
    }
    console.log(mapElements);
}


function updateMapElements(mapElements) { // updates markers, infoboxes, circles
    var reqObj = new XMLHttpRequest();
    var url = '/data';
    var dataObj;

    if (reqObj) {
        reqObj.open('GET', url, true);
        reqObj.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                dataObj = JSON.parse(this.responseText).information;
                for (person in dataObj) {
                    var pos = {
                        lat: dataObj[person].latitude,
                        lng: dataObj[person].longitude
                    };
                    mapElements.markers[person].setPosition(pos);
                    mapElements.infoboxes[person].setContent("<img class='infobox-marker' src='marker.png'><img class='infobox-avatar' src='https://iot.kpraveen.in/images/"
                        + dataObj[person].name + ".png' onclick='centerPerson(\""
                        + person + "\")' ondblclick='followPerson(\""
                        + person + "\")' oncontextmenu='drawRouteTo(\""
                        + person + "\")'><div class='infobox-text'>"
                        + getTimeAgoString(dataObj[person].lastLocationTime) + "</div>");
                    mapElements.circles[person].setCenter(pos);
                    mapElements.circles[person].setRadius(dataObj[person].accuracy);
                }

                if (mapElements.following) {
                    centerPerson(mapElements, mapElements.following);
                }
            }
        };
        reqObj.send();
        return dataObj;
    }

}

function getData() { // retrieves and returns location data
    console.log("getting data");
    var reqObj = new XMLHttpRequest();
    var url = '/data';
    var dataObj;

    if (reqObj) {
        reqObj.open('GET', url, true);
        reqObj.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                dataObj = JSON.parse(this.responseText).information;
                console.log(dataObj);
            }
        };
        reqObj.send();
        return dataObj;
    }
}

function drawRouteTo(mapElements, person) { // draws route from lastCentered to person 
    if (mapElements.lastCentered) {
        var origin = mapElements.lastCentered;
        var source = mapElements.markers[origin].getPosition(),
            dest = mapElements.markers[person].getPosition();

        var sCoord = source.lat + "," + source.lng,
            dCoord = dest.lat + "," + dest.lng;

        var reqObj = new XMLHttpRequest();
        var url = "/directions?source=" + sCoord + "&dest=" + dCoord;

        if (reqObj) {
            reqObj.open('GET', url, true);
            reqObj.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var routeObj = JSON.parse(this.responseText);
                    var routes = routeObj.routes;
                    var polyline = google.maps.geometry.encoding.decodePath(routes[0].overview_polyline.points);
                    var dPath = new google.maps.Polyline({
                        path: polyline,
                        geodesic: true,
                        strokeColor: "#FF0000",
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });
                    dPath.setMap(map);
                }
            };
            reqObj.send();
        }
    }
}

function getTimeAgoString(lastSeen) { // constructs and returns Last Seen string
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

function centerPerson(mapElements, person) { // centers person and updates lastCentered
    var pos = mapElements.markers[person].getPosition();
    mapElements.map.panTo(pos);
    mapElements.lastCentered = person;
}

function followPerson(mapElements, person) { // toggles follow-mode
    //TODO: improve mechanism 
    if (!mapElements.following) {
        mapElements.following = person;
    } else {
        mapElements.following = null;
    }
}

