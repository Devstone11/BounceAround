var autocomplete;
var city = document.getElementById('city');

$('#new_coords').hide()
function initialize() {
  var geocoder = new google.maps.Geocoder();
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(city),
      { types: ['geocode'] });
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    geocoder.geocode({'address': city.value}, function(results, status) {
      if (status === 'OK') {
        $('#new_coords').val(results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
}
