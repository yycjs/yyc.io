// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

function initialize() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(51.0486, -114.0708)
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // map.data.loadGeoJson('/google.json');

  // var kmlUrl = "https://data.calgary.ca/_layouts/OpenData/DownloadDataset.ashx?DatasetId=PDC0-99999-99999-00204-P(CITYonlineDefault)&VariantId=2(CITYonlineDefault)";

  // var kmlOptions = {
  //   // suppressInfoWindows: true,
  //   preserveViewport: true,
  //   map: map
  // };

  // var kmlLayer =  new google.maps.KmlLayer(kmlUrl, kmlOptions);
  // kmlLayer.setMap(map);

  var schoolsLayer = new google.maps.KmlLayer({
      url: 'https://data.calgary.ca/_layouts/OpenData/DownloadDataset.ashx?DatasetId=PDC0-99999-99999-00204-P(CITYonlineDefault)&VariantId=2(CITYonlineDefault)',
      map: map,
      preserveViewport: true
  });
  schoolsLayer.setMap(map)

  
}

// initialize();

// function loadScript() {
//   var script = document.createElement('script');
//   script.type = 'text/javascript';
//   script.src = '//maps.googleapis.com/maps/api/js?v=3.exp&callback=initialize&';
//   document.body.appendChild(script);
// }

window.onload = initialize;