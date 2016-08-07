$('#delete-init').on("click", function() {
  $('#confirm-delete').removeClass('hidden');
  $('#del-cal-buttons').addClass('hidden');
});

$('#cancel-delete').on("click", function() {
  $('#confirm-delete').addClass('hidden');
  $('#del-cal-buttons').removeClass('hidden');
})
