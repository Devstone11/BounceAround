exports.up = function(knex, Promise) {
  return knex.schema.createTable('days', function(table) {
    table.increments('id');
    table.integer('trip_id');
    table.date('date');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('days');
};
