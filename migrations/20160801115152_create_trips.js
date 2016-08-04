exports.up = function(knex, Promise) {
  return knex.schema.createTable('trips', function(table) {
    table.increments('id');
    table.integer('user_id');
    table.date('start_date');
    table.date('end_date');
    table.string('city');
    table.string('city_coordinates');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('trips');
};
