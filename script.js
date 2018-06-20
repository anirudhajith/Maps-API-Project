var bangalore = { lat: 12.9716, lng: 77.5946 };
var pos;
var zoomLevel = 4;
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { zoom: zoomLevel, center: bangalore, disableDoubleClickZoom: true, mapTypeControl: true });
    document.getElementsByName("zoom")[0].value = map.getZoom();

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {lat: position.coords.latitude, lng: position.coords.longitude};
        });
        var marker = new google.maps.Marker({ position: pos, map: map });
        map.panTo(pos);
    }

    map.addListener('zoom_changed', function() {
        console.log("Zoom Changed");
        document.getElementsByName("zoom")[0].value = map.getZoom();
    });
    map.addListener('dblclick', function(event){
        console.log("Double Click");
        map.panTo(event.latLng);
    });
}

function updateZoomLevel(newZL) {
    map.setZoom(parseInt(newZL));
}

