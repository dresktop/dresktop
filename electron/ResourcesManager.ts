import path from 'node:path'
import { app } from 'electron';
import fs from 'fs-extra';
import log from 'electron-log/main';
log.initialize();

export default async function copyResources() {

    // Checks where to get the resources folder 
    const resourcesPath = process.env.NODE_ENV == 'development' ? 'resources' : path.join(process.resourcesPath, 'resources');

    // The base path to store the files will be
    // Mac: /Users/user/Dresktop
    // Linux: /home/user/Dresktop
    const userDataDirectory = app.getPath('home');

    // All the resources will be at /Users/user/Dresktop/.resources
    const destinationPath = path.join(userDataDirectory, 'Dresktop', '.resources');

    try {
        fs.copySync(resourcesPath, destinationPath);
    } catch (err) {
        log.info("copyResources::Error", err);
    }
}