import { Model } from 'objection';
import path from 'node:path'
import { app } from 'electron';
var fs = require('fs');
import log from 'electron-log/main';
log.initialize();

export default async function initDatabase() {

    const databaseFolder = path.join(app.getPath('home'), 'Dresktop', ".database");

    if (!fs.existsSync(databaseFolder)) {
        fs.mkdirSync(databaseFolder, { recursive: true });
    }

    // Path to the database inside the user's directory
    const databaseFile = path.join(databaseFolder, 'dresktop.db');

    // Application resources path. This path contains migrations directory 
    const resourcesPath = path.join(app.getPath('home'), 'Dresktop', '.resources')

    // Initialize knex and handle errors
    try {
        const knex = require('knex')({
            client: 'better-sqlite3',
            connection: {
                filename: databaseFile,
            },
            migrations: {
                directory: path.join(resourcesPath, 'migrations'),
            },
            useNullAsDefault: true,
        });

        Model.knex(knex);
        await knex.migrate.latest();

    } catch (error) {
        log.error('DatabaseManager::Error', error);
    }
}