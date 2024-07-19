/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('group', (table) => {
            table.increments('id').primary();
            table.string('name');
            table.string('color');
        })
        .createTable('project', (table) => {
            table.increments('id').primary()
            table.string('name')
            table.string('machine_name');
            table
                .integer('group_id')
                .unsigned()
                .references('id')
                .inTable('group')
                .onDelete('RESTRICT')
                .notNullable()
                .index();
            table.timestamp('created').defaultTo(knex.fn.now())
        })
        .createTable('environment', (table) => {
            table.increments('id').primary();
            table.string('name');
            table.string('machine_name');
            table
                .integer('project_id')
                .unsigned()
                .references('id')
                .inTable('project')
                .onDelete('CASCADE')
                .notNullable()
                .index();
            table.string('type');
            table.string('user');
            table.string('root');
            table.string('app_root');
            table.string('uri');
            table.string('host');
            table.string('ssh_key_path');
            table.string('drush_path');
            table.boolean('production_mode').notNullable().defaultTo(0)
            table.timestamp('created').defaultTo(knex.fn.now())
        })
        .createTable('infrastructure', (table) => {
            table.increments('id').primary()
            table.string('file_path');
            table.string('services');
            table
                .integer('environment_id')
                .unsigned()
                .references('id')
                .inTable('environment')
                .onDelete('CASCADE')
                .notNullable()
                .index()
            table.timestamp('created').defaultTo(knex.fn.now())
        })
        .createTable('settings', function (table) {
            table.string('key').unique().notNullable()
            table.string('name').notNullable()
            table.string('value')
            table.string('message')
        })
        .createTable('logger', function (table) {
            table.increments('id').primary()
            table.string('identifier').unique().notNullable()
            table.string('command')
            table.string('result')
            table
                .integer('environment_id')
                .unsigned()
                .references('id')
                .inTable('environment')
                .onDelete('CASCADE')
                .notNullable()
                .index()
            table.boolean('status').nullable();
            table.timestamp('executed').defaultTo(knex.fn.now())
        })
        .then(() => {

            // Default group
            return knex('group').insert([
                { name: 'My Apps', color: '#dbeafe' },
            ]);
        })
        .then(() => {

            // Default settings
            return knex('settings').insert([
                {
                    'key': 'ssh_key_path',
                    'name': "Ssh key path",
                    'value': '',
                    'message': 'E.g.: /Users/user/.ssh/id_rsa',
                },
                {
                    'key': 'downloads',
                    'name': "Default downloads folder",
                    'value': '',
                    'message': 'E.g.: /Users/user/Downloads',
                }
            ]);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {

};