module.exports = {
  verifyFields : function(){
    if (!req.body.email || !req.body.password){
      res.render('login', {message: 'fields cannot be blank'});
    }
  }
}
