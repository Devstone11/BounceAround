exports.up = function(knex, Promise) {
  return knex.schema.createTable('activities', function(table) {
    table.increments('id');
    table.integer('day_id');
    table.string('name');
    table.string('phone');
    table.string('coordinates');
    table.string('address');
    table.string('type');
    table.time('start_time');
    table.time('end_time');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('activities');
};
