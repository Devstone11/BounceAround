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
    streetViewControl: false,
    styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"},{"color":"#f70000"}]},{"featureType":"landscape.natural.landcover","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"landscape.natural.terrain","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural.terrain","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#a9f07e"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"labels.icon","stylers":[{"visibility":"on"},{"hue":"#0ab05b"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#888B8C"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#666464"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#A8ABAD"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"},{"color":"#A1A4A6"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#393939"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"transit.line","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#4684EC"},{"visibility":"on"}]}]
  });

  var id = $('.last_trip').attr("id");
  var url = root + `/activities/trip/${id}`;

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
