var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var passport = require('passport');
var bcrypt = require('bcrypt');
var data = require('../data/queries');
var salt = bcrypt.genSaltSync(10);
var magic = require('../jsmagic/magic');

router.get('/trip/:id', function(req, res, next) {
  var trip_id = req.params.id;
  data.getActivitiesByTrip(trip_id).then(function(activities) {
    res.json(activities.rows);
  });
});

router.get('/date/:date', function(req, res, next){
  var date_id = req.params.date;
  data.getActivitiesByDate(date_id).then(function(activities) {
    res.json(activities.rows);
  });
});

router.post('/:id/new', function(req, res, next) {
  knex.raw(`SELECT * from days WHERE trip_id = ${req.params.id}`).then(function(days) {
    var formatDates = days.rows.map(function(day) {
      var splitDate = day.date.toISOString().split('T')[0].split('-');
      return {
        id: day.id,
        date: `${splitDate[1]}-${splitDate[2]}-${splitDate[0]}`
      }
    })
    var dayId;
    formatDates.forEach(function(day) {
      if (day.date === req.body.day) {
        dayId = day.id;
      }
    })
    knex.raw(`INSERT into activities (id, day_id, name, address, coordinates, start_time, end_time, type)
    values (DEFAULT, ${dayId}, '${req.body.place}', '${req.body.address}', '${req.body.coordinates}', '${req.body.start_time}', '${req.body.end_time}', '${req.body.type}')`).then(function() {
      res.redirect(`/trips/${req.params.id}/edit`);
    })
  })
});

module.exports = router;
