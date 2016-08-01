exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id');
    table.string('name');
    table.string('email');
    table.string('password');
    table.string('googleKey');
    table.timestamps();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
