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
  getActivitiesByTrip: function(tripId) {
    return knex.raw(`select * from activities`);
  },
  getActivitiesByDate: function(tripId) {
    return knex.raw(`select * from activities`);
  }
};
