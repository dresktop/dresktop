import { clipboard, dialog, app, shell } from 'electron';
import { DatabaseService } from './DatabaseService';
import { Infrastructure } from "./Infrastructure";
import log from 'electron-log/main';
import fs from 'fs-extra';
import * as path from 'path';
import { Updater } from './Updater';
log.initialize();
import { Command } from "./Command";
import { Message } from './Message';
import { BrowserWindow } from 'electron'
// const { version } = require('../package.json');


export class Core {

    infrastructure: Infrastructure;
    command: Command;
    window: BrowserWindow
    updater: Updater;

    constructor(window: BrowserWindow) {
        this.infrastructure = new Infrastructure(window);
        this.command = new Command(window);
        this.window = window;
        this.updater = new Updater();
    }

    public async getAppVersion() {
        const { version } = require('../package.json');
        return version;
    }

    public async reloadApp() {
        return this.window.reload();
    }

    // ------------------------------------------------------------
    // Commands
    // ------------------------------------------------------------

    public async runOS(command: string, environment?: any, identifier?: any) {
        return this.command.runOS(command, environment, identifier);
    }

    public async runCommand(command: string, project: any, environment: any, identifier?: string) {
        switch (environment.type) {
            case "desktop":
                return await this.command.runDesktop(command, project, environment, identifier);
            case "cloud":
                return await this.command.runCloud(command, environment, identifier);
        }
    }

    /**
     * Exports the database from the environment to the user file system
     * 
     * @param project Environment's project
     * @param environment Environment where the database will be imported
     * @param exportPath User's file system path where the database will be saved
     * @param identifier Action identifier
     * @returns 
     */
    public async exportDatabase(project: any, environment: any, exportPath: string, identifier?: string) {

        let result;

        const dumpName = `${project.machine_name}.${environment.machine_name}.${Date.now()}.sql.gz`;
        const dumpPath = path.join(exportPath, dumpName);

        switch (environment.type) {
            case "desktop":

                // Exports the database and save it in the computer's directory
                result = await this.command.exportDatabaseDesktop(project, environment, dumpPath, identifier);
                result.message = `Database dump exported at ${dumpPath}`;
                result.data = dumpPath;
                break;
            case "cloud":

                // Exports the database in a custom path
                result = await this.command.exportDatabaseCloud(environment, dumpName, identifier);

                // Gets the exported database file from the server and save it
                // in the computer's directory
                await this.command.getFileCloud(environment, dumpPath, result.data);

                // Deletes the file from the server
                await this.command.removeFileCloud(environment, result.data, identifier);

                result.message = `Database dump exported at ${dumpPath}`;
                result.data = dumpPath;

                break;
        }

        return result;
    }

    /**
     * Important: I'm assuming the temporal directory in the cloud is "/tmp". This directory is used
     * to place the db dump file temporary and as soon as the import has finished it will be deleted.
     * In case the cloud server has a Windows OS we have to include the path for Windows "C:\Windows\Temp"
     * 
     * @param project Environment's project
     * @param environment Environment where the database will be imported
     * @param filePath Path in the user's file system
     * @param identifier Action identifier
     */
    public async importDatabase(project: any, environment: any, filePath: string, identifier?: string) {

        // Gets only the file name from the full path
        const filename = path.basename(filePath);

        // Checks the 2 types of environments: desktop or cloud
        switch (environment.type) {
            case "desktop":

                const desktopTemporalDirectory = '/tmp';
                const desktopTemporalPath = `${desktopTemporalDirectory}/${filename}`

                // Copy the file from the computer to the Docker container file system
                await this.command.copyFileDesktop(project, environment, filePath, desktopTemporalPath, identifier);

                // Imports the database from the file system to MariaDB
                await this.command.importDatabaseDesktop(project, environment, filePath, desktopTemporalPath, identifier);

                // Deletes the temporary exported database dump from the Docker container file system
                await this.command.removeFileDesktop(project, environment, desktopTemporalPath, identifier);

                return { message: 'Success', success: true }

            case "cloud":

                const cloudTemporalDirectory = "/tmp";
                const cloudTemporalPath = `${cloudTemporalDirectory}/${filename}`;

                // Copy the file from the computer to the server temporary folder
                await this.command.copyFileCloud(environment, filePath, cloudTemporalPath);

                // Imports the dump in the database
                await this.command.importDatabaseCloud(environment, filePath, cloudTemporalPath, identifier);

                // Deletes the file from the server
                await this.command.removeFileCloud(environment, cloudTemporalPath, identifier);

                return { message: 'Success', success: true }
        }
    }

    /**
     * Synchronize files between environments
     * 
     * @param environment Environment where the files will be saved
     * @param environmentSource Environment where the files will be taken
     * @param identifier Action identifier
     * @returns {Promise<Message|boolean>} A Promise Message object if successful.
     */
    public async syncFiles(environment: any, environmentSource: any, identifier?: string): Promise<Message | undefined> {

        // Checks destination
        switch (environment.type) {

            // Checks destination is "Desktop"
            case "desktop":

                // Checks source
                switch (environmentSource.type) {

                    // Checks source is "Desktop"
                    case "desktop":
                        return await this.command.syncFilesDesktopDesktop(environmentSource, environment, identifier);

                    // Checks source is "Cloud"
                    case "cloud":
                        return await this.command.syncFilesCloudDesktop(environmentSource, environment, identifier);
                }
                break;

            // Checks destination is "Cloud"
            case "cloud":

                // Checks source
                switch (environmentSource.type) {

                    // Checks source is "Desktop"
                    case "desktop":
                        return await this.command.syncFilesDesktopCloud(environmentSource, environment, identifier);

                    // Checks source is "Cloud"
                    case "cloud":
                        return await this.command.syncFilesCloudCloud(environmentSource, environment, identifier);
                }
                break
        }

    }

    /**
     * Deploys the code from an environment to another
     * 
     * @param project Project of the source and destination environment 
     * @param environment Environment destination (in Dresktop is the current environment)
     * @param payload Information about the deploy and environment source
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    public async deploy(project: any, environment: any, payload: any, identifier?: string): Promise<Message> {

        let output = "";
        let actionsObject: any = {};
        let message: any;
        const environmentSource = payload.environmentFrom;
        let logStepTitle = "";

        // Changes the actions array format to be easier to handle.
        payload.actions.forEach((action: any) => {
            const { key, ...rest } = action;
            actionsObject[key] = rest;
        });

        // ---------------------------------------------
        // Pre Deployment
        // ---------------------------------------------

        // Backup all databases
        if (actionsObject['backup-database'].value && actionsObject['backup-database'].type == 'pre-deployment') {

            logStepTitle = this.logStepTitle("Database backup")

            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.exportDatabase(project, environment, actionsObject['backup-database'].path, identifier);
            output += message?.message;

        }

        // Turn on Drupal maintenance mode
        if (actionsObject['turnon-maintenance-mode'].value && actionsObject['turnon-maintenance-mode'].type == 'pre-deployment') {

            logStepTitle = this.logStepTitle("Turn on Drupal maintenance mode");

            const command = `drush state:set system.maintenance_mode 1 --input-format=integer`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runCommand(command, project, environment, identifier);
            output += message?.message;

        }

        // Clear all Drupal caches
        if (actionsObject['clear-cache'].value && actionsObject['clear-cache'].type == 'pre-deployment') {

            logStepTitle = this.logStepTitle("Clear all Drupal caches")

            const command = `drush cr`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runCommand(command, project, environment, identifier);
            output += message?.message;

        }

        // ---------------------------------------------
        // Deployment
        // ---------------------------------------------
        {
            let command = "";
            let result;

            // Pull new tags in the source environment
            logStepTitle = this.logStepTitle("Pull new tags in the source environment")
            command = `git fetch --tags`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runOS(command, environmentSource, identifier);
            output += message?.message;


            // Gets the list of tags
            logStepTitle = this.logStepTitle("Gets the new tag name from the source")
            command = `git tag`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            result = await this.runOS(command, environmentSource, identifier);
            output += result?.message;


            // Creates the new tag in the source environment
            logStepTitle = this.logStepTitle("Creates the new tag in the source environment")
            const tags = result.message.split(/\r?\n/).sort();
            const newTag = this.getNewTagVersion(tags);
            command = `git tag -a "${newTag}" -m "${payload.commitMessage}"`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runOS(command, environmentSource, identifier);
            output += message?.message;


            // Push the tag in the source environment to the remote repository
            logStepTitle = this.logStepTitle("Push new tag");
            command = `git push origin ${newTag}`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runOS(command, environmentSource, identifier);
            output += message?.message;


            // Pull the tag in the destination
            logStepTitle = this.logStepTitle("Pulls new tags in destination environment");
            command = `git fetch --tags`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runOS(command, environment, identifier);
            output += message?.message;


            // Checkout to the new tag in the destination environment
            logStepTitle = this.logStepTitle("Checkout new tag");
            command = `git checkout ${newTag}`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runOS(command, environment, identifier);
            output += message?.message;


            // Vendor updates
            if (actionsObject['vendor'].value && actionsObject['vendor'].type == 'deployment') {

                switch (actionsObject['vendor'].vendor.selected) {
                    case "composer":

                        logStepTitle = this.logStepTitle("Runs composer install");
                        this.window.webContents.send('on-logger-response', {
                            identifier: identifier,
                            data: logStepTitle,
                        });
                        output += logStepTitle;

                        // Runs composer install
                        command = `COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader`;
                        if (environment.type == 'desktop') {
                            message = await this.runCommand(command, project, environment, identifier);
                            output += message?.message;
                        } else {
                            message = await this.runOS(command, environment, identifier);
                            output += message?.message;
                        }

                        break;
                    case "rsync":
                        break;
                }
            }
        }

        // ---------------------------------------------
        // Post Deployment
        // ---------------------------------------------

        // Run database updates
        if (actionsObject['database-updates'].value && actionsObject['database-updates'].type == 'post-deployment') {
            logStepTitle = this.logStepTitle("Run database updates");
            const command = `drush updatedb`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runCommand(command, project, environment, identifier);
            output += message?.message;

        }

        // Import configuration
        if (actionsObject['import-configuration'].value && actionsObject['import-configuration'].type == 'post-deployment') {
            logStepTitle = this.logStepTitle("Import configuration");
            const command = `drush config:import`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runCommand(command, project, environment, identifier);
            output += message?.message;

        }

        // Sanitize Database
        if (actionsObject['sanitize-database'].value && actionsObject['sanitize-database'].type == 'post-deployment') {
            logStepTitle = this.logStepTitle("Sanitize database");
            const command = `drush sql:sanitize`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runCommand(command, project, environment, identifier);
            output += message?.message;
        }

        // Clear all Drupal caches
        if (actionsObject['clear-cache'].value && actionsObject['clear-cache'].type == 'post-deployment') {
            logStepTitle = this.logStepTitle("Clear all Drupal caches");
            const command = `drush cr`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runCommand(command, project, environment, identifier);
            output += message?.message;
        }

        // Turn off Drupal maintenance mode
        if (actionsObject['turnoff-maintenance-mode'].value && actionsObject['turnoff-maintenance-mode'].type == 'post-deployment') {
            logStepTitle = this.logStepTitle("Turn off Drupal maintenance mode");
            const command = `drush state:set system.maintenance_mode 0 --input-format=integer`;
            this.window.webContents.send('on-logger-response', {
                identifier: identifier,
                data: logStepTitle,
            });
            output += logStepTitle;
            message = await this.runCommand(command, project, environment, identifier);
            output += message?.message;
        }

        return new Message(true, output);
    }

    /**
     * Gets the latest tag using this format "yyyy-mm-dd.version", like
     * 2024-07-21.
     * 
     * @param tags List of tags
     * @returns The new tag name to be created
     */
    private getNewTagVersion(tags: Array<any>) {

        // Sorts the tags
        tags.sort((a, b) => {
            const [dateA, suffixA] = a.split('.');
            const [dateB, suffixB] = b.split('.');

            if (dateA === dateB) {
                return (parseFloat(suffixA) || 0) - (parseFloat(suffixB) || 0);
            }
            return dateA.localeCompare(dateB);
        });

        // Gets the last tag from the list
        const lastTag = tags[tags.length - 1];

        // Splits the tag in order to get the date and version (if exists)
        const lastTagArray = lastTag.split('.');

        // Gets current full date
        const fullDate = new Date();

        // Gets only date without time
        const today = fullDate.toISOString().split('T')[0];

        let newVersion;
        let newTag;

        // Checks if the last tag is from the same day
        if (lastTagArray[0] == today) {

            // Then checks if there's already a version. E.g. 2024-07-21, 
            // then 2024-07-21.0, 2024-07-21.1, etc
            if (typeof lastTagArray[1] != "undefined") {
                newVersion = Number(lastTagArray[1]) + 1;
                newTag = today + "." + newVersion;
            } else {
                newTag = today + "." + 0;
            }
        }

        // If the tag is not from the same day, we have to create the first
        // tag in that day
        else {
            newTag = today;
        }

        return newTag;
    }

    /**
     * Synchronize the database of the environment source to environment destination
     * 
     * @param project Project of the source and destination environment
     * @param environment Environment destination
     * @param environmentSource Environment source
     * @param identifier Action identifier
     */
    public async syncDatabase(project: any, environment: any, environmentSource: any, identifier?: string) {

        // The environments configuration files will be stored in the user data folder
        const userDataDirectory = app.getPath('home');

        // Creates docker compose file for the project
        const tmpFolder = path.join(userDataDirectory, "Dresktop", ".tmp");

        // Creates path if not exists
        if (!fs.existsSync(tmpFolder)) {
            fs.mkdirSync(tmpFolder, { recursive: true });
        }

        const resultExport = await this.exportDatabase(project, environmentSource, tmpFolder, identifier);

        await this.importDatabase(project, environment, resultExport?.data, identifier);

        await this.deleteFile(resultExport?.data);

        return resultExport;
    }

    // ------------------------------------------------------------
    // Project
    // ------------------------------------------------------------

    public async getProjects() {
        return await DatabaseService.getProjects();
    }

    public async createProject(project: any) {
        return await DatabaseService.createProject(project);
    }

    public async editProject(project: any) {
        return await DatabaseService.editProject(project);
    }

    public async deleteProject(projectId: any) {
        return await DatabaseService.deleteProject(projectId);
    }

    // ------------------------------------------------------------
    // Environment
    // ------------------------------------------------------------

    public async createEnvironment(environment: any) {
        return await DatabaseService.createEnvironment(environment);
    }

    public async editEnvironment(environment: any) {
        return await DatabaseService.editEnvironment(environment);
    }

    /**
     * Deletes environment from the database, stops environment containers
     * and removes infrastructure files
     * 
     * @param environmentId Environment id to be deleted
     * @returns {Promise<Message>} A Promise flag
     */
    public async deleteEnvironment(environmentId: any): Promise<number> {

        // Gets the infrastructure information from the environment id
        const infrastructure = await DatabaseService.getInfrastructure(environmentId) as any;

        // First delete environment from the database
        const environmentWasDeleted = await DatabaseService.deleteEnvironment(environmentId);

        if (environmentWasDeleted) {

            // If the environment is linked to an infrastructure this must be deleted
            if (infrastructure) {

                // Deletes the containers, volumes and networks
                await this.infrastructure.powerDown(infrastructure.file_path);

                // Gets the parent folder of the yml infrastructure
                const parentFolderOfFilePath = path.dirname(infrastructure.file_path);

                // Removes infrastructure files in the system.
                await fs.remove(parentFolderOfFilePath);
            }

            return environmentWasDeleted;
        } else {
            throw new Error(`Could not delete environment ${environmentId} from the database.`);
        }
    }

    public async getEnvironments() {
        return await DatabaseService.getEnvironments();
    }

    public async getEnvironment(id: number) {
        return await DatabaseService.getEnvironment(id);
    }

    // ------------------------------------------------------------
    // Infrastructure
    // ------------------------------------------------------------

    /**
     * Creates the infrastructure for a local virtual environment
     * 
     * @param infrastructure Infrastructure information
     * @param environmentRoot Application environment root path
     */
    public async createInfrastructure(infrastructure: any, environmentRoot: string) {

        // Creates the docker compose file
        const infrastructureFilePath = await this.infrastructure.create(infrastructure.machine_name, environmentRoot, infrastructure.services);

        // Runs docker-compose up
        await this.infrastructure.build(infrastructureFilePath);

        infrastructure.file_path = infrastructureFilePath;

        // Saves the infrastructure in the database
        const createdInfrastructure = await DatabaseService.createInfrastructure(infrastructure);

        return createdInfrastructure;
    }

    public async getInfrastructures() {
        return await DatabaseService.getInfrastructures();
    }

    public async getInfrastructure(environmentId: number) {
        return await DatabaseService.getInfrastructure(environmentId);
    }

    public async powerInfrastructure(filePath: string, flag: boolean) {

        if (flag) {
            return await this.infrastructure.powerUp(filePath);
        } else {
            return await this.infrastructure.powerStop(filePath);
        }
    }

    public async statusInfrastructure(filePath: string) {
        return await this.infrastructure.status(filePath);
    }

    // ------------------------------------------------------------
    // Settings
    // ------------------------------------------------------------

    public async saveSettings(key: any) {
        const createdkey = await DatabaseService.saveSettings(key);
        return createdkey;
    }

    public async getSettings() {
        return await DatabaseService.getSettings();
    }

    // ------------------------------------------------------------
    // Misc
    // ------------------------------------------------------------

    /**
     * Checks if a folder is empty
     * 
     * @param path Path of the folder
     * @returns 
     */
    public async checkFolderIsEmpty(path: string) {
        try {
            const files = await fs.readdir(path);
            if (files.length === 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error('Error reading directory:', err);
        }
    }

    public async openDialog(type: string) {
        const formattedType = type == 'directory' ? 'openDirectory' : 'openFile';

        return await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() as BrowserWindow, {
            properties: [formattedType, 'showHiddenFiles'],
            filters: [
                { name: "Database", extensions: ["sql", "gz"] },
            ],
        })
    }

    public async pathJoin(paths: Array<string>) {
        return path.join(...paths)
    }

    public async getUserDocumentsPath() {
        return app.getPath('documents');
    }

    public async getUserDataPath() {
        return app.getPath('userData');
    }

    public async getUserDownloadsPath() {
        return app.getPath('downloads');
    }

    public async openUriBrowser(uri: string) {
        return shell.openExternal(uri);
    }

    public async activateService(project: any, environment: any, service: string, status: any, filePath: string) {
        return await this.infrastructure.activate(project, environment, service, status, filePath);
    }

    public async copyToClipboard(text: any) {
        clipboard.writeText(text);
    }

    async deleteFile(filePath: string) {
        try {
            await fs.unlink(filePath);
            console.log(`File ${filePath} has been deleted.`);
        } catch (err) {
            console.error(err);
        }
    }

    public async installUpdates() {
        return await this.updater.installUpdates();
    }

    public async checkForUpdates() {
        return await this.updater.checkForUpdates();
    }

    public async checkCaddy() {
        const resourcesPath = path.join(app.getPath('home'), 'Dresktop', '.resources');
        const caddyPath = path.join(resourcesPath, 'infrastructure', 'dresktop', 'caddy.yml')
        const command = `docker compose -f ${caddyPath} up -d`;
        return await this.runOS(command);
    }

    public async checkNetwork() {

        let command = `docker network ls --filter name=dresktop_network_external -q`;
        let result = await this.runOS(command);

        // If the network does not exists, the message will be empty
        if (!result.message) {

            // Creates the network
            command = `docker network create dresktop_network_external`;
            result = await this.runOS(command);
        }

        return result;
    }

    public async checkRsync() {
        let command = `docker pull jdeg/dresktop-rsync`;
        return await this.runOS(command);
    }

    // ------------------------------------------------------------
    // Logger
    // ------------------------------------------------------------
    public async getLogs(environmentId: number) {
        return await DatabaseService.getLogs(environmentId);
    }

    public async saveLog(logs: any, environmentId: number) {
        return await DatabaseService.saveLog(logs, environmentId);
    }

    public async deleteLogs(environmentId: number) {
        return await DatabaseService.deleteLogs(environmentId);
    }

    public async updateLog(result: any, identifier: string) {
        return await DatabaseService.updateLog(result, identifier);
    }

    private logStepTitle(message: string) {
        const line = "-----------------------------------------------";
        return `\n${line}\n${message}\n${line}\n`;
    }

    // ------------------------------------------------------------
    // Groups
    // ------------------------------------------------------------
    public async getGroups() {
        return await DatabaseService.getGroups();
    }
    public async saveGroup(group: any) {
        return await DatabaseService.saveGroup(group);
    }

    public async deleteGroup(id: number) {
        return await DatabaseService.deleteGroup(id);
    }

    public async editGroup(group: any) {
        return await DatabaseService.editGroup(group);
    }
}