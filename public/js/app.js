// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

// Hardcode types just for now
var types = [
    'ELECTRIC PLUG IN',
    'HB1 - HIDE A BAG SINGLE, BEAR BIN'
  ]

  , icons = [
    '//maps.google.com/mapfiles/marker_yellow.png',
    '//maps.google.com/mapfiles/marker_green.png',
    '//maps.google.com/mapfiles/marker_orange.png',
    '//maps.google.com/mapfiles/marker_purple.png'
  ]

  , points = []

  // infowindow and map assigned after initialize
  , infowindow
  , map;

function toggleData(type) {

  for (index in points) {
    var point = points[index];

    if (point.properties.ASSET_TYPE === type) {
      point.marker.setMap(point.marker.getMap() ? null : map);
    }
  }
}

function setAllMap(map) {
  for (var i = 0; i < points.length; i++) {
    points[i].marker.setMap(map);
  }
}

function clearAllMap() {
  setAllMap(null);
  points = [];
}

function drawFeatures (url) {

  clearAllMap();

  $.ajax(url).done(function(data) {

    var parent = document.getElementById('options-list');
    $(parent).html('');

    for (var index in data.features) {
      var feature = data.features[index];
      var title = feature.properties.ASSET_TYPE;
      createMarker(map, feature);
      $(parent).html(
        $(parent).html()
        + '<li>'
          + '<input id="' + title + '" type="checkbox" checked>'
          + '<label for="' + title +'"">' + title + '</label>'
        + '</li>'
      );
    }
  });
}

$('body').on('change', '#options-list input[type=checkbox]', function(event){
  var marker = $(this).attr('id');
  toggleData(marker);
});

$('#api-request').submit(function() {
  console.log("Submitted");
  drawFeatures('/features.json');
  return false;
});

function createMarker (map, feature) {

  var lng = feature.geometry.coordinates[0];
  var lat = feature.geometry.coordinates[1];
  var myLatlng = new google.maps.LatLng(lat, lng);

  var marker = new google.maps.Marker({
    position: myLatlng,
    title: feature.properties.ASSET_TYPE,
    // dataSet: feature.properties.
    icon: icons[points.length%icons.length],
    map: map,
    idPropertyName: feature.properties.ASSET_CD
  });

  points[points.length] = {
    marker: marker,
    properties: feature.properties
  };

  google.maps.event.addListener(marker, 'click', function(event) {
    var content = marker.title;
    // var content = marker.dataSet + "<br>" + marker.title
    infowindow.setContent(content);
    infowindow.setPosition(event.latLng);
    infowindow.setOptions({pixelOffset: new google.maps.Size(0,-34)});
    infowindow.open(map);
  });
}

function drawMap (userLat, userLong) {

  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(userLat, userLong),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  /* ADD MAP MARKER FOR USER */
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(userLat, userLong),
    title: 'You Are Here',
    map: map,
    idPropertyName: 'userLoc'
  });

  // Create a div to hold the control.
  var controlDiv = document.createElement('div');
  controlDiv.classList.add('map-controls-container');
  controlDiv.id = 'map-controls-container';

  var controlUI = document.createElement('ul');
  controlUI.id = 'options-list';
  controlUI.classList.add('options-list');
  controlDiv.appendChild(controlUI);

  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
};

function initialize() {

  infowindow = new google.maps.InfoWindow();

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      drawMap(position.coords.latitude, position.coords.longitude);
    });
  } else {
    drawMap(51.0486, -114.0708); // centre of Calgary
  }
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
      '&callback=initialize&';
  document.body.appendChild(script);
}

window.onload = loadScript;