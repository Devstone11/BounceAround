var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var passport = require('passport');
var bcrypt = require('bcrypt');
var data = require('../data/queries');
var salt = bcrypt.genSaltSync(10);
var magic = require('../jsmagic/magic');

router.get('/edit', function(req, res, next) {
  res.render('trips/edit');
});

router.get('/new', function(req, res, next) {
  res.render('trips/new');
});

router.get('/:id/edit', function(req, res, next) {
  knex.raw(`SELECT id, date from days WHERE trip_id=${req.params.id}`).then(function(days) {
    var formatDates = days.rows.map(function(item) {
      var splitDate = item.date.toISOString().split('T')[0].split('-');
      return {
        id: item.id,
        date: `${splitDate[1]}-${splitDate[2]}-${splitDate[0]}`
      }
    })
    knex.raw(`SELECT * from activities
      JOIN days ON days.id = activities.day_id
      JOIN trips ON trips.id = days.trip_id
      WHERE trip_id = ${req.params.id}`).then(function(activities) {
      res.render('trips/edit', {days: formatDates, activities: activities.rows});
    })
  })
})

router.post('/new', function(req, res, next) {
  var startDate = new Date(req.body.startDate);
  var endDate = new Date(req.body.endDate);

  //create array of trip dates
  Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
  }

  function addDays(startDate, endDate) {
    var dateArray = [];
    var currentDate = startDate;
    while (currentDate <= endDate) {
      dateArray.push( (new Date(currentDate)).toISOString().split('T')[0] )
      currentDate = currentDate.addDays(1);
    }
    return dateArray;
  }

  var myDateArray = addDays(startDate, endDate);
  console.log(myDateArray);
  //create records for trip and all days
  knex.raw(`INSERT into trips values (DEFAULT, ${req.cookies.id}, '${req.body.startDate}', '${req.body.endDate}', '${req.body.city}')`).then(function() {
    knex('trips').max('id').then(function(id) {
      myDateArray.forEach(function(date) {
        knex.raw(`INSERT into days values (DEFAULT, ${id[0].max}, '${date}')`).then(function() {
          res.redirect(`/trips/${id[0].max}/edit`);
        })
      })
    });
  });
});

module.exports = router;
