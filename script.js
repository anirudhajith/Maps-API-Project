var bangalore = { lat: 12.9716, lng: 77.5946 };
var pos;
var zoomLevel = 4;
var map;
var name;
var marker;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { zoom: zoomLevel, center: bangalore, disableDoubleClickZoom: true, mapTypeControl: true });
    document.getElementsByName("zoom")[0].value = map.getZoom();

    marker = new google.maps.Marker({ position: pos, map: map });
    eventListeners();
    if(document.cookie) {
        welcome();
    } else {
        name = prompt("Enter your name: ");
        document.cookie = "name=" + name;
        welcome();
    }
}

function performRequest() {
    var invocation = new XMLHttpRequest();
    var url = 'https://iot.kpraveen.in/api/Users/5acb3b1a146ca8f84d18a8b2/data';
    
    if(invocation) {    
        invocation.open('GET', url, true);
        invocation.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
            }
        };
        invocation.send();
        console.log(); 
    }
}


function updateZoomLevel(newZL) {
    map.setZoom(parseInt(newZL));
}

function eventListeners() {
    map.addListener('zoom_changed', function() {
        console.log("Zoom Changed");
        document.getElementsByName("zoom")[0].value = map.getZoom();
    });
    map.addListener('dblclick', function(event){
        console.log("Double Click");
        map.panTo(event.latLng);
    });
}

function welcome() {
    alert("Welcome " + getCookie("name") + "!");
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
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

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        pos = {lat: position.coords.latitude, lng: position.coords.longitude};
        map.panTo(pos);
        map.setZoom(17);
        marker.setPosition(pos);
        //marker.setLabel("Your current position");
        

    });
}