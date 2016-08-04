var knex = require('../db/knex');

module.exports = {
  createNewUser: function(form){
    return knex.raw(`insert into users (name, email, password) values('${form.name}', '${form.email}', '${form.password}')`); //password hashing in route
  },
  createNewGoogleUser: function(gdata){
    return knex.raw(`insert into users (name, email, "googleKey") values('${gdata.name}', '${gdata.email}', '${gdata.id}')`);
  },
  getUserData: function(id){
    return knex.raw(`select * from users where id=${id}`);
  },
  getUserDataWithEmail: function(email){
    return knex.raw(`select * from users where email='${email}'`); //for Google login and verification
  },
  connectGoogle: function(gdata){
    return knex.raw(`update users set "googleKey"='${gdata.id}' where email='${gdata.email}'`);
  },
  getUserDataWithGKey: function(google_key){
    return knex.raw(`select * from users where "googleKey"='${google_key}'`);
  },
  getLastTrip: function(user_id){
    return knex.raw(`select activities.id as id, activities.name as name, trips.user_id as user_id, activities.address, activities.phone, activities.start_time, activities.end_time, days.date, trips.start_date, trips.end_date, trips.city from activities join days on activities.day_id = days.id join trips on trips.id = days.trip_id join users on users.id = trips.user_id where trips.id=(select MAX(id) from trips where trips.user_id=${user_id}) order by days.id`)
  },
  getActivitiesByTrip: function(tripId) {
    return knex.raw(`SELECT activities.id as activities_id, activities.day_id as activities_day_id, activities.name as activities_name, activities.phone as activities_phone, activities.coordinates as activities_coordinates, activities.address as activities_address, activities.type as activities_type, activities.start_time as activities_start_time, activities.end_time as activities_end_time, days.id as days_id, days.trip_id as days_trip_id, days.date as days_date, trips.id as trips_id, trips.user_id as trips_user_id, trips.start_date as trips_start_date, trips.end_date as trips_end_date, trips.city as trips_city FROM activities inner join days on days.id = activities.day_id inner join trips on days.trip_id=trips.id WHERE days.id=activities.day_id and days.trip_id=trips.id and days.trip_id=${tripId}`);
 },
  getActivitiesByDate: function(dateId) {
    return knex.raw(`SELECT activities.id as activities_id, activities.day_id as activities_day_id, activities.name as activities_name, activities.phone as activities_phone, activities.coordinates as activities_coordinates, activities.address as activities_address, activities.type as activities_type, activities.start_time as activities_start_time, activities.end_time as activities_end_time, days.id as days_id, days.trip_id as days_trip_id, days.date as days_date FROM activities inner join days on days.id = activities.day_id WHERE days.id=activities.day_id and days.id=${dateId}`);
  }
};
