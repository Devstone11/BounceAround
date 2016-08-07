var activity = document.getElementById('autocomplete');
var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = {'country': 'all'};
var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');
var user_id;
var cookies = document.cookie.split("; ");
var root = location.protocol + '//' + location.host;
console.log(window.location.href.length);
var trip_id;
if (window.location.href.length === 34){
  trip_id = window.location.href.substring(window.location.href.lastIndexOf('/')-1, window.location.href.lastIndexOf('/'));
}
else if (window.location.href.length === 35){
  trip_id = window.location.href.substring(window.location.href.lastIndexOf('/')-2, window.location.href.lastIndexOf('/'));
}
else {
  trip_id = window.location.href.substring(window.location.href.lastIndexOf('/')-3, window.location.href.lastIndexOf('/'));
}
var geocoder;

  $('.addtocalendar').hide();

cookies.forEach(function(cookie){
  if (cookie.indexOf("id=") > -1){
    user_id = cookie.substring(cookie.indexOf("=")+1, cookie.length);
  }
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function getFormattedTime(time) {
    time.replace(":", '')
    var hours24 = parseInt(time.substring(0, 2),10);
    var hours = ((hours24 + 11) % 12) + 1;
    var amPm = hours24 > 11 ? 'pm' : 'am';
    var minutes = time.substring(2);
    return hours + minutes + amPm;
}

var dates = [];
$('.act_date').each(function( index ) {
  dates.push(getFormattedTime($(this).html().substring(0,5)))
});

function typeIcon(type){
  switch(type) {
  case 'park' || 'rv_park' || 'campground':
    return "http://findicons.com/files/icons/951/google_maps/32/forest.png";
  case 'restaurant' || 'bakery' || 'cafe' || 'meal_delivery':
    return  "http://findicons.com/files/icons/951/google_maps/32/restaurantgourmet.png";
  case 'airport':
    return  "http://findicons.com/files/icons/951/google_maps/32/airport.png";
  case 'gas_station':
    return "http://findicons.com/files/icons/951/google_maps/32/gazstation.png";
  case 'subway_station' || "train_station":
    return "http://findicons.com/files/icons/951/google_maps/32/tram.png";
  case 'bar' || 'liquor_store' || 'night_club':
    return "http://findicons.com/files/icons/951/google_maps/32/cocktail.png";
  case 'lodging':
    return "http://findicons.com/files/icons/951/google_maps/32/hotel.png";
  case 'convenience_store' || 'department_store' || 'pet_store' || 'shopping_mall' || 'store':
    return "http://findicons.com/files/icons/951/google_maps/32/shoppingmall.png";
  case 'casino' || 'amusement_park' || 'movie_theater' || 'bowling_alley':
    return "http://findicons.com/files/icons/951/google_maps/32/circus.png";
  case 'museum' || 'post_office' || 'stadium' || 'art_gallery':
    return "http://findicons.com/files/icons/951/google_maps/32/ancienttemple.png";
  default:
      return "http://findicons.com/files/icons/951/google_maps/32/cluster3.png";
  }
}

function initMap() {
  console.log(trip_id);
  $.ajax({
      url: root + `/trips/selected/${trip_id}`,
      success: function(trips){
  var startPoint = {lat: Number(trips[0].city_coordinates.slice(1,-1).split(",")[0]), lng: Number(trips[0].city_coordinates.slice(1,-1).split(",")[1])}
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: startPoint,
    mapTypeControl: false,
    panControl: true,
    zoomControl: true,
    streetViewControl: false,
    styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"},{"color":"#f70000"}]},{"featureType":"landscape.natural.landcover","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"landscape.natural.terrain","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural.terrain","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#a9f07e"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"labels.icon","stylers":[{"visibility":"on"},{"hue":"#0ab05b"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#888B8C"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#666464"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#A8ABAD"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"},{"color":"#A1A4A6"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#393939"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"transit.line","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#4684EC"},{"visibility":"on"}]}]
  });

  geocoder = new google.maps.Geocoder;

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocompletemap'))
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);

  var url = root + `/activities/trip/${trip_id}`;
  $.ajax({
      url: url,
      success: function(markers){
  markers.forEach(function(marker){
        marker.activities_coordinates = marker.activities_coordinates.slice(1,-1);
        thismarker = new google.maps.Marker({
        position: {lat: Number(marker.activities_coordinates.split(",")[0]), lng: Number(marker.activities_coordinates.split(",")[1])},
        map: map,
        icon: typeIcon(marker.activities_type),
        title: marker.activities_name
    });
    var date = new Date(marker.days_date);
    date = (date + '').split(" "), date.length -= 4, date = date.join(' ');
    var time = getFormattedTime(marker.activities_start_time.substring(0,5));

    var dbInfo = new google.maps.InfoWindow({
      content: '<div class="infowindowshow nameofactivity">' + marker.activities_name.capitalize() + '</div>' + '<div class="infowindowshow">' + '<p class="titlest">Address: </p>' + marker.activities_address + '</div>' + '<div class="infowindowshow">' + '<p class="titlest">Date: </p>'+ date + " at " + time + '</div>'
    });

    thismarker.addListener('click', function() {
      dbInfo.open(map, this);
    });
  });


  map.addListener('dragend', function() {
    map.panTo(map.getCenter());
    map.setZoom(14);
    search();
    clearMarkers()
    });
  }
});
}
});
}

var markerIconCenter = 'https://cdn0.iconfinder.com/data/icons/seo-web-15/141/seo-social-web-network-internet_122-32.png';
function onPlaceChanged() {
  clearResults()
  clearMarkers()
  var place = autocomplete.getPlace();
  if (place) {
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(14);
      search();
      clearMarkers()
      center(place.geometry.location)
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
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearResults();

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
  icon.src = 'https://i.imgur.com/xmsSDVo.png';
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

$('#iw-addto-calendar').on('click', function(){
  $('.addtocalendar').show();
  $('#add_place_name').val($('#iw-url').children(":first").html());
  $('#add_place_address').val($('#iw-address').html());
  $('#add_place_coords').val($('#iw-coords').html());
  $('#add_place_type').val($('#iw-type').html());
});

$(document).on('click', '.addtocalCenter', function(){
  $('.addtocalendar').show();
  $('#add_place_name').val('');
  $('#add_place_address').val($('#centerAddress').html());
  $('#add_place_coords').val($('#centerCoords').html());
  $('#add_place_type').val('storage');
});

$(document).on("click", ".search_icon", function(){
  $('#autocomplete').attr("name", $(this).children(":first").attr("alt"));
  onPlaceChanged();
});

$(document).on("click", ".act_delete", function(){
  window.location.replace(`/activities/trip/${trip_id}/act/${this.id}/delete`)
});

$('.close_form').on("click", function(){
  $(this).parent().hide();
});

var acc = document.getElementsByClassName("accordion");
var a;

for (a = 0; a < acc.length; a++) {
    acc[a].onclick = function(){
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("show");
  }
}
var centerMarker;
function center(pan){
  if (centerMarker != null){
  centerMarker.setMap(null);
}

  centerMarker = new google.maps.Marker({
          position: map.getCenter(),
          map: map,
          title: "map center",
          icon: 'https://i.imgur.com/5hHfNp7.png',
    });
    markers.push(centerMarker);

    geocoder.geocode({'location': map.getCenter()}, function(results, status) {
           if (status === 'OK') {
             if (results[1]) {
               var address = results[1].formatted_address;
               var realaddress = $('#autocompletemap').val();
               var ccoords = map.getCenter();
             }
           }
           InfoWindow = new google.maps.InfoWindow({
             content: `<p id="centerAddress">${realaddress}</p><p id="centerCoords" style="display:none">${ccoords}</p><div class="addtocalCenter"><a href="#">+ add to calendar</a></div>`
           });
           centerMarker.addListener('click', function() {
             InfoWindow.open(map, centerMarker);
           });
         });
}
