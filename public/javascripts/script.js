var currentIndex = 0;
var pics = $('#container div');
var picCount = pics.length;

function rotatePics() {
  var pic = $('#container div').eq(currentIndex);
  pics.hide();
  pic.css('display','inline-block');
}

var automate = setInterval(function() {
  currentIndex += 1;
  if (currentIndex > picCount - 1) {
    currentIndex = 0;
  }
  rotatePics();
}, 5000);
