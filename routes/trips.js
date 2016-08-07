var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var passport = require('passport');
var bcrypt = require('bcrypt');
var data = require('../data/queries');
var salt = bcrypt.genSaltSync(10);
var magic = require('../jsmagic/magic');
var quickstartjs = require('../quickstart');

router.get('/new', function(req, res, next) {
  res.render('trips/new');
});

router.get('/:id', function(req, res, next){
  res.render('trips/view_one');
});

router.get('/last/:user_id', function(req, res, next){
  data.returnLastTrip(req.params.user_id).then(function(results){
    res.json(results.rows);
  });
});

router.get('/selected/:trip_id', function(req, res, next){
  data.returnSelectedTrip(req.params.trip_id).then(function(results){
    res.json(results.rows);
  });
});

router.get('/:id/edit', function(req, res, next) {
  if (req.cookies.session){
  knex.raw(`SELECT id, date from days WHERE trip_id=${req.params.id}`).then(function(days) {
    days.rows.sort(function(a, b) {
      return a.date - b.date;
    });
    var formatDates = days.rows.map(function(day) {
      var splitDate = day.date.toISOString().split('T')[0].split('-');
      var informalDates = ((day.date + '').substring(0,10));
      return {
        shortDay: informalDates,
        id: day.id,
        date: `${splitDate[1]}-${splitDate[2]}-${splitDate[0]}`
      }
    })
    knex.raw(`SELECT activities.day_id, activities.name, activities.address, activities.start_time, activities.end_time, activities.id from activities
      JOIN days ON days.id = activities.day_id
      JOIN trips ON trips.id = days.trip_id
      WHERE trip_id = ${req.params.id}
      ORDER BY start_time`).then(function(activities) {
      res.render('trips/edit', {
        days: formatDates,
        activities: activities.rows,
        trip_id: req.params.id,
        alert: ''
      });
    })
  })
} else {
  res.redirect('/');
}
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
  knex.raw(`INSERT into trips values (DEFAULT, ${req.cookies.id}, '${req.body.startDate}', '${req.body.endDate}', '${req.body.city}', ${req.body.coords})`).then(function() {
    knex('trips').max('id').then(function(id) {
      myDateArray.forEach(function(date) {
        knex.raw(`INSERT into days values (DEFAULT, ${id[0].max}, '${date}')`).then(function() {
          res.redirect(`/trips/${id[0].max}/edit`);
        })
      })
    });
  });
});

router.post('/:id/delete', function(req, res, next) {
  console.log("Destruction is imminent!!!");
  knex.raw(`DELETE from activities USING days WHERE activities.day_id=days.id AND days.trip_id = ${req.params.id}`).then(function() {
    console.log("activities have been deleted");
    knex.raw(`DELETE from days WHERE trip_id=${req.params.id}`).then(function() {
      console.log("Days have been deleted");
      knex.raw(`DELETE from trips WHERE id=${req.params.id}`).then(function() {
        console.log("Trip has been deleted");
        res.redirect('/dashboard');
      })
    })
  })
})

router.get('/:trip_id/googlecalendar', function(req, res, next){
  data.getActivitiesByTrip(req.params.trip_id).then(function(actsFromTrip){
    var activities = actsFromTrip.rows;
    var events = [];
    activities.forEach(function(activity){
    var startdate = new Date(activity.days_date);
    startdate = startdate.getFullYear()+'-' + (startdate.getMonth()+1) + '-'+startdate.getDate() + "T" + activity.activities_start_time;
    var enddate = new Date(activity.days_date);
    enddate = enddate.getFullYear()+'-' + (enddate.getMonth()+1) + '-'+enddate.getDate() + "T" + activity.activities_end_time;
      var newEvent = {
        'summary': activity.activities_name,
        'location': activity.activities_address,
        'start': {
          'dateTime': startdate,
          'timeZone': 'America/Los_Angeles',
        },
        'end': {
          'dateTime': enddate,
          'timeZone': 'America/Los_Angeles',
        }
      }
       events.push(newEvent);
    });
    console.log(events);
    quickstartjs.quickstart(events);
    res.redirect(`/trips/${req.params.trip_id}/edit`);
  });
});

module.exports = router;
