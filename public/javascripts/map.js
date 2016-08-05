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

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocompletemap'))
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);

  map.addListener('dragend', function() {
    clearMarkers()
    map.panTo(map.getCenter());
    map.setZoom(14);
    search();
    clearMarkers()
  });
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
var markerIconCenter = 'https://cdn0.iconfinder.com/data/icons/seo-web-15/141/seo-social-web-network-internet_122-32.png';
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place) {
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(14);
      search();
      clearMarkers()
    }
  }
  else {
    document.getElementById('autocomplete').placeholder = 'Enter a city'; //city name from db
    map.panTo(map.getCenter());
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
    results.push(results[0]);
    results[results.length-1].geometry.location = map.getCenter();
    results[results.length-1].name = "add this place to calendar"
    results[results.length-1].geometry.location = map.getCenter();
    console.log(results);
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

function buildIWContent(place) {
  if (place.photos){
  document.getElementById('iw-icon').innerHTML = '<img class="imgPop" ' +
      'src="' + place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"/>';
  }
  document.getElementById('iw-url').innerHTML = '<div>' + place.name + '</div>';
  document.getElementById('iw-address').textContent = place.vicinity;
  document.getElementById('iw-coords').innerHTML = place.geometry.location;
  document.getElementById('iw-type').innerHTML = place.types[0];

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

console.log($('#iw-url').children(":first").children(":first").html());
$('.addtocalendar').hide();
$('#iw-addto-calendar').on('click', function(){
  $('.addtocalendar').show();
  $('#add_place_name').val($('#iw-url').children(":first").html());
  $('#add_place_address').val($('#iw-address').html());
  $('#add_place_coords').val($('#iw-coords').html());
  $('#add_place_type').val($('#iw-type').html());
});

$(document).on("click", ".search_icon", function(){
  $('#autocomplete').attr("name", $(this).children(":first").attr("alt"));
  onPlaceChanged();
});
