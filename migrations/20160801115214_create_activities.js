exports.up = function(knex, Promise) {
  return knex.schema.createTable('activities', function(table) {
    table.increments('id');
    table.integer('day_id');
    table.string('hours');
    table.string('type');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('activities');
};
