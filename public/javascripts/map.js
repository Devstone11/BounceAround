var activity = document.getElementById('autocomplete');
var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = {'country': 'all'};
var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

function initMap() {
  var startPoint = {lat: 39.7429674, lng: -104.9855794}; //coordinates from db
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14, //set zoom to 12-14 when changing to db data
    center: startPoint,
    mapTypeControl: false,
    panControl: true,
    zoomControl: true,
    streetViewControl: false
  });

  //for places in db of days
  var marker = new google.maps.Marker({
    position: {lat: 39.734122, lng: -104.987145},
    map: map,
    icon:'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-circle-filled-32.png'
  });

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  // Create the autocomplete object and associate it with the UI input control.
  // Restrict the search to the default country, and to place type "cities".
  autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocompletemap'))
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
var markerIconCenter = 'https://cdn0.iconfinder.com/data/icons/seo-web-15/141/seo-social-web-network-internet_122-32.png';
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  console.log(place);
  if (place) {
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(14);
      search();
      clearMarkers()
      //needs to be fixed to show middle of map
      var marker = new google.maps.Marker({
        position: (place.geometry.location),
        icon: markerIconCenter
      });
    }
  }
  else {
    document.getElementById('autocomplete').placeholder = 'Enter a city'; //city name from db
    var latLng = new google.maps.LatLng(39.7429674, -104.9855794); //coordinates of place from db
    map.panTo(latLng);
    map.setZoom(14);
    search();
  }
}

function search() {
  var searchquery = $('#autocomplete').attr("name");
  var search = {
    bounds: map.getBounds(),
    radius: 5000,
    types: [searchquery]
  };

  places.nearbySearch(search, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearResults();
      clearMarkers();

      for (var i = 0; i < results.length; i++) {
        var markerIcon = 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-32.png';

        markers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });

        // detail (pop-up)
        markers[i].placeResult = results[i];
        google.maps.event.addListener(markers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
        addResult(results[i], i);
      }
    }
  });
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

function dropMarker(i) {
  return function() {
    markers[i].setMap(map);
  };
}

function addResult(result, i) {
  var results = document.getElementById('results');
  var tr = document.createElement('tr');
  tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
  tr.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };

  var iconTd = document.createElement('td');
  var nameTd = document.createElement('td');
  var icon = document.createElement('img');
  icon.src = 'http://i.imgur.com/xmsSDVo.png';
  icon.setAttribute('class', 'placeIcon');
  icon.setAttribute('className', 'placeIcon');
  var name = document.createTextNode(result.name);
  iconTd.appendChild(icon);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
}

function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
  var marker = this;
  places.getDetails({placeId: marker.placeResult.place_id},
      function(place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        infoWindow.open(map, marker);
        buildIWContent(place);
      });
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
      'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;
  document.getElementById('iw-coords').innerHTML = place.geometry.location;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
  } else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }

  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      } else {
        ratingHtml += '&#10029;';
      }
    document.getElementById('iw-rating-row').style.display = '';
    document.getElementById('iw-rating').innerHTML = ratingHtml;
    }
  } else {
    document.getElementById('iw-rating-row').style.display = 'none';
  }

  // The regexp isolates the first part of the URL (domain plus subdomain)
  // to give a short URL for displaying in the info window.
  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website === null) {
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    document.getElementById('iw-website-row').style.display = '';
    document.getElementById('iw-website').textContent = website;
  } else {
    document.getElementById('iw-website-row').style.display = 'none';
  }
}

$('.addtocalendar').hide();
$('#iw-addto-calendar').on('click', function(){
  $('.addtocalendar').show();
  $('#add_place_name').val($('#iw-url').children(":first").children(":first").html());
  $('#add_place_address').val($('#iw-address').html());
  $('#add_place_coords').val($('#iw-coords').html());
  //pop-up with pre-populated information about place
});
