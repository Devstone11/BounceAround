module.exports = {
  verifyFields : function(){
    if (!req.body.email || !req.body.password){
      res.render('login', {message: 'fields cannot be blank'});
    }
  },
  getFormattedTime: function(time){
      time.replace(":", '')
      time = time.substring(0, time.lastIndexOf(":"))
      var hours24 = parseInt(time.substring(0, 2),10);
      var hours = ((hours24 + 11) % 12) + 1;
      var amPm = hours24 > 11 ? 'pm' : 'am';
      var minutes = time.substring(2);
      return hours + minutes + amPm;
  }
}
