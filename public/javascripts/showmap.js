//same code needed to load all markers in edit route (without initMap() loading function)

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
  var startPoint = {lat: 39.7429674, lng: -104.9855794}; //coordinates from db
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: startPoint,
    mapTypeControl: false,
    panControl: false,
    zoomControl: true,
    streetViewControl: false
  });

  var markers = [{name: "Some hotel", address: "Some address", phone: "32434234234", coords: '39.7318556, -104.99786', type: "lodging" }, {name: "Some restaurant", address: "45 str234eet, denver, 34", phone: "234234324", coords: '39.7429674, -104.9855794', type: "restaurant"}];
  //markers is a example, replace with db json object from ajax
  markers.forEach(function(marker){
      thismarker = new google.maps.Marker({
        position: {lat: Number(marker.coords.split(",")[0]), lng: Number(marker.coords.split(",")[1])},
        map: map,
        icon: typeIcon(marker.type),
        title: marker.name
    });

    var infowindow = new google.maps.InfoWindow({
      content: '<div class="infowindowshow">' + marker.name + '</div>' + '<div class="infowindowshow">' + marker.address + '</div>' + '<div class="infowindowshow">' + marker.phone + '</div>'
    });

    thismarker.addListener('click', function() {
      infowindow.open(map, this);
    });
  });
}
