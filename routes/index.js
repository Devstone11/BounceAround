var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var passport = require('passport');
var bcrypt = require('bcrypt');
var data = require('../data/queries');
var salt = bcrypt.genSaltSync(10);
var magic = require('../jsmagic/magic');
var quickstartjs = require('../quickstart');

router.get('/', function(req, res, next) {
  req.cookies.session ? res.redirect(`/${req.cookies.id}/trips`) : res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  req.cookies.session ? res.redirect(`/${req.cookies.id}/trips`) : res.render('login', { alert: '' });
});

router.get('/signup', function(req, res, next) {
  req.cookies.session ? res.redirect(`/${req.cookies.id}/trips`) : res.render('signup', { alert: '' });
});

router.get('/:id/trips', function(req, res, next) {
  res.redirect('/dashboard');
});

router.get('/logout', function(req, res, next) {
  res.clearCookie("id");
  res.clearCookie("session");
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

router.post('/login', function(req, res, next) {
  if (!req.body.email || !req.body.password){
    res.render('login', {alert: 'fields cannot be blank'});
  }
  else {
    data.getUserDataWithEmail(req.body.email).then(function(user_data){
      if (user_data.rows.length === 0){
        res.render('login', {alert: 'invalid email/password combination'});
      }
      else {
        if (user_data.rows[0].password !== null){
          if (bcrypt.compareSync(req.body.password, user_data.rows[0].password)){
            var id = user_data.rows[0].id;
            var hashed_id = bcrypt.hashSync(String(id), salt);
            res.cookie("id", id);
            res.cookie("session", hashed_id);
            res.redirect(`/${id}/trips`);
          }
          else { res.render('login', {alert: 'invalid email/password combination'}); }
        }
        else { res.render('login', {alert: 'please use "Connect with Google"'});  }
      }
    });
  }
});

router.post('/signup', function(req, res, next) {
  if (!req.body.email || !req.body.name || !req.body.password){
    res.render('signup', {alert: 'fields cannot be blank'});
  }
  data.getUserDataWithEmail(req.body.email).then(function(user_data){
    if (user_data.rows.length !== 0){
      res.render('signup', {alert: 'you are already a user, please log in'});
    }
    else{
      req.body.password = bcrypt.hashSync(req.body.password, salt);
      data.createNewUser(req.body).then(function(){
        data.getUserDataWithEmail(req.body.email).then(function(new_user){
          var id = new_user.rows[0].id;
          var hashed_id = bcrypt.hashSync(String(id), salt);
          res.cookie("id", id);
          res.cookie("session", hashed_id);
          res.redirect(`/${id}/trips`);
        });
      });
    }
  });
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/calendar'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    var profile = {
      name :  req.session.passport.user.name.givenName + " " + req.session.passport.user.name.familyName,
      email : req.session.passport.user.emails[0].value,
      id : req.session.passport.user.id
    }
    data.getUserDataWithGKey(profile.id).then(function(user_data){
      if (user_data.rows.length === 0){ //user has never logged in with google
        //user doesn't have an account
        data.getUserDataWithEmail(profile.email).then(function(email_data){
          if (email_data.rows.length === 0){
            data.createNewGoogleUser(profile).then(function(){
              data.getUserDataWithEmail(profile.email).then(function(new_user){
                var id = new_user.rows[0].id;
                var hashed_id = bcrypt.hashSync(String(id), salt);
                res.cookie("id", id);
                res.cookie("session", hashed_id);
                res.redirect(`/${id}/trips`);
              });
            });
          }
          //user has a local account
          else {
            data.connectGoogle(profile).then(function(){
              var id = email_data.rows[0].id;
              var hashed_id = bcrypt.hashSync(String(id), salt);
              res.cookie("id", id);
              res.cookie("session", hashed_id);
              res.redirect(`/${id}/trips`);
            });
          }
        });
      }
      else { //user has previously logged in with google
        var id = user_data.rows[0].id;
        var hashed_id = bcrypt.hashSync(String(id), salt);
        res.cookie("id", id);
        res.cookie("session", hashed_id);
        res.redirect(`/${id}/trips`);
      }
    });
  });

router.get('/dashboard', function(req, res, next) {
  if (req.cookies.session){
  knex.raw(`SELECT * from trips WHERE user_id=${req.cookies.id}`).then(function(payload) {
    data.getLastTrip(req.cookies.id).then(function(last_trip){
    if (payload.rows.length !== 0){
      var days = {};
      for (var i in last_trip.rows){
        var date = (last_trip.rows[i].date + '').substring(4, 10);
        if (!days[date]){
          days[date] = { date: date, activities : {} }
        }
        days[date].activities[last_trip.rows[i].id] = {name: last_trip.rows[i].name, address: last_trip.rows[i].address, start: magic.getFormattedTime(last_trip.rows[i].start_time), end: magic.getFormattedTime(last_trip.rows[i].end_time)};
      }
      var trip;
      if (last_trip.rows.length !== 0){
        trip = {
          start: (last_trip.rows[0].start_date + '').substring(4, 15),
          end: (last_trip.rows[0].end_date + '').substring(4, 15),
          days: days,
          id: last_trip.rows[0].trip_id,
          city: last_trip.rows[0].city
        }
        res.render('dashboard', {trips: payload.rows, lasttrip: trip});
      } else {
        data.returnLastTrip(req.cookies.id).then(function(trip_only){
          trip = {
            start: (trip_only.rows[0].start_date + '').substring(4, 15),
            end: (trip_only.rows[0].end_date + '').substring(4, 15),
            days: {},
            id: trip_only.rows[0].id,
            city: trip_only.rows[0].city
          }
          res.render('dashboard', {trips: payload.rows, lasttrip: trip});
        });
      }
      }
      else { trip = "", res.render('dashboard', {trips: payload.rows, lasttrip: trip});}
    });
  });
} else {
  res.redirect('/login')
  }
})

module.exports = router;
