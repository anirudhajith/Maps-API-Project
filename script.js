var bangalore = { lat: 12.9716, lng: 77.5946 };
var zoomLevel = 4;
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { zoom: zoomLevel, center: bangalore });
    document.getElementsByName("zoom")[0].value = map.getZoom();
    var marker = new google.maps.Marker({ position: bangalore, map: map });
    map.addListener('zoom_changed',function() {
        console.log("Zoom Changed");
        document.getElementsByName("zoom")[0].value = map.getZoom();
    });
}

function updateZoomLevel(newZL) {
    map.setZoom(parseInt(newZL));
}

