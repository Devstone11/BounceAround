var user_id;
var cookies = document.cookie.split("; ");
var root = location.protocol + '//' + location.host;

cookies.forEach(function(cookie){
  if (cookie.indexOf("id=") > -1){
    user_id = cookie.substring(cookie.indexOf("=")+1, cookie.length);
  }
});

var acc = document.getElementsByClassName("accordion");
var a;

for (a = 0; a < acc.length; a++) {
    acc[a].onclick = function(){
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("show");
  }
}

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
};

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

var map;
function initMap() {
  $.ajax({
      url: root + `/trips/last/${user_id}`,
      success: function(trips){
  var startPoint = {lat: Number(trips[0].city_coordinates.slice(1,-1).split(",")[0]), lng: Number(trips[0].city_coordinates.slice(1,-1).split(",")[1])}
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: startPoint,
    mapTypeControl: false,
    panControl: false,
    zoomControl: true,
    streetViewControl: false
  });

  var id = $('.last_trip').attr("id");
  var url = root + `/activities/trip/${id}`;

  $.ajax({
      url: url,
      success: function(markers){
        console.log(markers);
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

          var infowindow = new google.maps.InfoWindow({
            content: '<div class="infowindowshow">' + marker.activities_name.capitalize() + '</div>' + '<div class="infowindowshow">' + "Address: " + marker.activities_address + '</div>' + '<div class="infowindowshow">' + "Date: "+ date + " at " + time + '</div>'
          });

          thismarker.addListener('click', function() {
            infowindow.open(map, this);
          });
        });
      }
    });
  }
  });
}
