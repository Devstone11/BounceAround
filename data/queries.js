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
  }
};
