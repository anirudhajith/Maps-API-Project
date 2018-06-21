var bangalore = { lat: 12.9716, lng: 77.5946 };
var pos;
var zoomLevel = 9;
var map;
var name;
var markers = {};
var follow;

function initMap2() {
    map = new google.maps.Map(document.getElementById('map'), { zoom: zoomLevel, center: bangalore, disableDoubleClickZoom: true, mapTypeControl: true });
    document.getElementsByName("zoom")[0].value = map.getZoom();

    marker = new google.maps.Marker({ position: pos, map: map });
    eventListeners();
    if (document.cookie) {
        welcome();
    } else {
        name = prompt("Enter your name: ");
        document.cookie = "name=" + name;
        welcome();
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { zoom: zoomLevel, center: bangalore, /*disableDoubleClickZoom: true,*/ mapTypeControl: true });
    document.getElementsByName("zoom")[0].value = map.getZoom();

    eventListeners();
    performRequest();
}

function performRequest() {
    var invocation = new XMLHttpRequest();
    var url = 'https://iot.kpraveen.in/api/Users/5acb3b1a146ca8f84d18a8b2/data';

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

            markers[data.information[person].name] = new google.maps.Marker({ position: pos, map: map, title: data.information[person].name});
            markers[data.information[person].name].addListener('click', function() {
                map.panTo(this.getPosition());
                console.log(this.getTitle() + " centred");
            });
            markers[data.information[person].name].addListener('dblclick', function() {
                follow = this;
                document.getElementsByName("unfollow")[0].style.display = "block";
                console.log("Following " + follow.getTitle());
            });
            //console.log(pos);
        }
    } else {
        for (person in data.information) {
            console.log(data.information[person]);
            pos = {
                lat: data.information[person].latitude,
                lng: data.information[person].longitude
            };

            markers[data.information[person].name].setPosition(pos);
            if(follow) map.panTo(follow.getPosition());
            //console.log(pos);
        }
    }
    console.log(markers);
}



function eventListeners() {
    map.addListener('zoom_changed', function () {
        console.log("Zoom Changed");
        document.getElementsByName("zoom")[0].value = map.getZoom();
    });
    /* map.addListener('dblclick', function (event) {
        console.log("Double Click");
        map.panTo(event.latLng);
    }); */
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