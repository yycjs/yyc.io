// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

var base = '/points';
var endpointParams = {};
var urlInput = $('#api-request [name="request"]');
// Hardcode types just for now
var icons = [
    '//maps.google.com/mapfiles/marker_yellow.png',
    '//maps.google.com/mapfiles/marker_green.png',
    '//maps.google.com/mapfiles/marker_orange.png',
    '//maps.google.com/mapfiles/marker_purple.png'
  ]

  , datasets = []

  , points = []

  // infowindow and map assigned after initialize
  , infowindow
  , map;

function drawPoints(url) {
  if(typeof url === 'string') {
    endpointParams = {};
  } else {
    urlInput.val(base + '?' + $.param(endpointParams));
  }
  drawFeatures(urlInput.val());
}

function setAllMap(map) {
  for (var i = 0; i < points.length; i++) {
    points[i].marker.setMap(map);
  }
}

function clearAllMap() {
  infowindow.close();
  setAllMap(null);
  points = [];
}

function drawFeatures (url, data) {

  clearAllMap();

  $.ajax({
    url: url,
    data: data || {}
  }).done(function(data) {

    var parent = document.getElementById('options-list');
    $(parent).html('');
    $('#json-response').jsonViewer(data);

    $.each(data.features, function(i, feature) {
      createMarker(map, feature);
    });
  });
}

function createMarker (map, feature) {

  var lng = feature.geometry.coordinates[0];
  var lat = feature.geometry.coordinates[1];
  var myLatlng = new google.maps.LatLng(lat, lng);
  var content = '<ul>';

  $.each(feature.properties, function(key, value) {
    if(key === 'description') return;

    content += '<li><strong>' + key + '</strong>: ' +
      '<a class="refine" href="#" data-name="' + key +
      '" data-value="' + value + '">' + value + '</a></li>';
  });

  content += '</ul>';

  var exists = false;
  for (var i in datasets) {
    if (datasets[i] === feature.properties.dataset_title) {
      exists = true;
    }
  }

  if (!exists)
    datasets[datasets.length] = feature.properties.dataset_title;

  var marker = new google.maps.Marker({
    position: myLatlng,
    title: feature.properties.dataset_title,
    icon: icons[datasets.indexOf(feature.properties.dataset_title)%icons.length],
    map: map
  });

  points[points.length] = {
    marker: marker,
    properties: feature.properties
  };

  content = $(content);

  content.find('a.refine').on('click', function() {
    var name = $(this).data('name');
    var value = $(this).data('value');
    endpointParams[name] = value;
    drawPoints();
  });

  google.maps.event.addListener(marker, 'click', function(event) {
    infowindow.setContent(content[0]);
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

$( "#slider" ).slider({
  value:1000,
  min: 100,
  max: 2000,
  step: 100,
  slide: function( event, ui ) {
    $( "#range" ).html( ui.value + 'm');
  }
});
$( "#range" ).html( $( "#slider" ).slider( "value" ) + 'm' );

$('body').on('change', '#options-list input[type=checkbox]', function(event){
  var marker = $(this).attr('id');
  toggleData(marker);
});

$('#api-request').submit(function() {
  drawPoints(urlInput.val());
  return false;
});
