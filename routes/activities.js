var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var passport = require('passport');
var bcrypt = require('bcrypt');
var data = require('../data/queries');
var salt = bcrypt.genSaltSync(10);
var magic = require('../jsmagic/magic');

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
    knex.raw(`INSERT into activities (id, day_id, name, address, coordinates, start_time, end_time)
    values (DEFAULT, ${dayId}, '${req.body.place}', '${req.body.address}', '${req.body.coordinates}', '${req.body.start_time}', '${req.body.end_time}')`).then(function() {
      res.redirect('/trips/3/edit');
    })
  })
});

module.exports = router;
