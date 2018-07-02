var mapElements = {
    map: null,
    markers: [],
    infoboxes: [],
    circles: [],
    lastCentered: null,
    following: null
};

google.maps.event.addDomListener(window, 'load', init);

function init() {
    initMap();
    initMapElements();
    console.log("initialized");
    setInterval(updateMapElements, 5000);
}


function initMap() { // initializes map object
    mapElements.map = new google.maps.Map(document.getElementById('map'), {
        center: { // Bangalore
            lat: 12.9716,
            lng: 77.5946
        },
        zoom: 12,
        mapTypeControl: true
    });
}

function initMapElements() { // initializes markers, infoboxes, circles

    var reqObj = new XMLHttpRequest();
    var url = '/data';
    var dataProm = getData();
    dataProm.then(function (dataObj) {
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
    });
    console.log(mapElements);

}


function updateMapElements() { // updates markers, infoboxes, circles
    var reqObj = new XMLHttpRequest();
    var url = '/data';
    var dataProm = getData();

    dataProm.then(function (dataObj) {
        for (person in dataObj) {
            var pos = {
                lat: dataObj[person].latitude,
                lng: dataObj[person].longitude
            };
            mapElements.markers[person].setPosition(pos);
            mapElements.infoboxes[person].setContent(
                "<img class='infobox-marker' src='marker.png'><img class='infobox-avatar' src='https://iot.kpraveen.in/images/"
                + dataObj[person].name + ".png' onclick='centerPerson(\""
                + person + "\")' ondblclick='followPerson(\""
                + person + "\")' oncontextmenu='drawRouteTo(\""
                + person + "\")'><div class='infobox-text'>"
                + getTimeAgoString(dataObj[person].lastLocationTime) + "</div>");
            mapElements.circles[person].setCenter(pos);
            mapElements.circles[person].setRadius(dataObj[person].accuracy);
        }
    });
    
    if (mapElements.following) {
        centerPerson(mapElements.following);
    }

}


function getData() { // retrieves and returns location data
    console.log("getting data");
    return new Promise(function (resolve, reject) {

        var reqObj = new XMLHttpRequest();
        var url = '/data';
        var dataObj;

        if (reqObj) {
            reqObj.open('GET', url, true);
            reqObj.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    dataObj = JSON.parse(this.responseText).information;
                    resolve(dataObj);
                    reject("ERR");
                    console.log(dataObj);
                    //console.log("dataProm:", dataProm);
                }
            };
            reqObj.send();

        }
    });

}

function drawRouteTo(person) { // draws route from lastCentered to person 
    if (mapElements.lastCentered) {
        console.log("Getting route from", mapElements.lastCentered, person);
        var origin = mapElements.lastCentered;
        var source = mapElements.markers[origin].getPosition(),
            dest = mapElements.markers[person].getPosition();

        var sCoord = source.lat() + "," + source.lng(),
            dCoord = dest.lat() + "," + dest.lng();

        var reqObj = new XMLHttpRequest();
        var url = "/directions?source=" + sCoord + "&dest=" + dCoord;
        console.log("url:", url);
        if (reqObj) {
            reqObj.open('GET', url, true);
            reqObj.onreadystatechange = function () {
                console.log("Entered onreadystatechange");
                if (this.readyState == 4 && this.status == 200) {
                    console.log("Entered if");
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
                    console.log("path drawn");
                } else {
                    console.log(this.readyState, this.status);
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

function centerPerson(person) { // centers person and updates lastCentered
    var pos = mapElements.markers[person].getPosition();
    mapElements.map.panTo(pos);
    mapElements.lastCentered = person;
}

function followPerson(person) { // toggles follow-mode
    //TODO: improve mechanism 
    //console.log(person + " followed");
    if (!mapElements.following) {
        mapElements.following = person;
    } else {
        mapElements.following = null;
    }
}

