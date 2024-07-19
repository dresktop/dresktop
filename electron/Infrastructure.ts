import { Command } from "./Command";
import { app } from 'electron';
import yaml from 'js-yaml';
import fs from 'fs-extra'
import * as path from 'path';
import log from 'electron-log/main';
import { BrowserWindow } from 'electron'
log.initialize();

export class Infrastructure {

    command: Command;

    constructor(window: BrowserWindow) {
        this.command = new Command(window);
    }

    public async build(infrastructureFile: string) {
        return await this.command.up(infrastructureFile);
    }

    public async powerUp(infrastructureFile: string) {
        return await this.command.up(infrastructureFile);
    }

    public async powerStop(infrastructureFile: string) {
        return await this.command.stop(infrastructureFile);
    }

    public async powerDown(infrastructureFile: string) {
        return await this.command.down(infrastructureFile);
    }

    /**
     * Gets the Docker status and parse it into an array
     * 
     * @param infrastructureFile Infrastructure file path
     * @returns {Promise<Array<any>>} Array with the container statuses
     */
    public async status(infrastructureFile: string): Promise<Array<any>> {
        const result: any = await this.command.status(infrastructureFile);

        return result.message

            // First we have to separate the results per line
            .split(/\r?\n|\r|\n/g)

            // Then filter the results that are not empty
            .filter((line: string) => line)

            // Then convert the string lines to object
            .map(function (line: string) {

                try {
                    return JSON.parse(line); // Try to parse the line as JSON
                } catch (error) {
                    return { log: line }; // If parsing fails, return the line as a log entry
                }
            });
    }

    /**
     * Activate/Unactivate services
     * 
     * @param project Environment's project
     * @param environment Environment that will be activated
     * @param service Services that will be activated in the environment: Adminer and Mailpit
     * @param status Activated or unactivated
     * @param filePath Path of the environment infrastructure file
     */
    public async activate(project: any, environment: any, service: string, status: any, filePath: string) {

        // Gets the environment infrastructure configuration file
        const infrastructureFile = this.importFile(filePath);

        // Checks if the service needs to be added or removed
        if (status) {

            // The service was not found and need to be added
            if (typeof infrastructureFile.services[service] === 'undefined') {

                // Imports the base yml infrastructure 
                const baseFile = this.importBase();

                if (typeof baseFile.services[service] !== 'undefined') {

                    const machineName = `${environment.machine_name}.${project.machine_name}`;

                    // Adds the service from the base configuration file
                    infrastructureFile.services[service] = baseFile.services[service];

                    // We also need to update the dynamic properties in the service, because the base
                    // infrastructure file does not have it.
                    if (service == 'adminer') {
                        infrastructureFile.services[service].labels.caddy = "adminer." + machineName.concat('.drt.localhost');
                        infrastructureFile.services[service].container_name = "adminer." + machineName + ".drt";
                    }

                    if (service == 'mail') {
                        infrastructureFile.services[service].labels.caddy = "mail." + machineName.concat('.drt.localhost');
                        infrastructureFile.services[service].container_name = "mail." + machineName + ".drt";
                    }
                }
            }
        } else {

            // Service was found, so it needs to be deleted
            if (typeof infrastructureFile.services[service] !== 'undefined') {
                delete infrastructureFile.services[service];
            }
        }

        // Write changes back to the infrastructure file
        fs.writeFileSync(filePath, yaml.dump(infrastructureFile));
    }

    /**
     * Creates the infrastructure for an environment
     * 
     * @param machineName Infrastructure machine name environment_machine_name + project_machine_name
     * @param environmentRoot Root of the application
     * @param services List of services to be activated: Adminer and Mailpit
     * @returns 
     */
    public async create(machineName: string, environmentRoot: string, services: any) {

        // Imports the base yml infrastructure 
        const infrastructureObject = this.importBase();

        // Loops over all services in order to enable/disable
        for (const [key, value] of Object.entries(services)) {

            // Checks the services not matching the base yml file
            if (typeof infrastructureObject.services[key] !== 'undefined') {

                // This means the service was found in the base docker compose file,
                // but it was not enable by the user.
                if (!value) {

                    // If the service was not enabled by the user it needs to be deleted.
                    delete infrastructureObject.services[key];
                }
            }
        }

        // Creates custom infrastructure
        return await this.createInfrastructure(machineName, infrastructureObject, environmentRoot);
    }

    /**
     * Creates the dresktop.yml infrastructure file for a local environment
     * 
     * @param machineName Infrastructure machine name environment_machine_name + project_machine_name
     * @param infrastructureObject Infrastructure information object
     * @param environmentRoot Root of the application
     * @returns {string} A path to the YML infrastructure file
     */
    async createInfrastructure(machineName: string, infrastructureObject: any, environmentRoot: string): Promise<string> {
        try {

            // Updates machine name and domain
            infrastructureObject.services.drupal.container_name = machineName.concat('.drt');
            infrastructureObject.services.drupal.labels.caddy = machineName.concat('.drt.localhost');

            // Database
            infrastructureObject.services.database.container_name = "db." + machineName + ".drt";

            // Adminer
            if (typeof infrastructureObject.services.adminer !== 'undefined') {
                infrastructureObject.services.adminer.labels.caddy = "adminer." + machineName.concat('.drt.localhost');
                infrastructureObject.services.adminer.container_name = "adminer." + machineName + ".drt";
            }

            // Mail
            if (typeof infrastructureObject.services.mail !== 'undefined') {
                infrastructureObject.services.mail.labels.caddy = "mail." + machineName.concat('.drt.localhost');
                infrastructureObject.services.mail.container_name = "mail." + machineName + ".drt";
            }

            // The environments configuration files will be stored in the user data folder
            const userDataDirectory = app.getPath('home');

            // Creates docker compose file for the project
            const infrastructureFolder = path.join(userDataDirectory, "Dresktop", "infrastructure", machineName);

            // Creates path if not exists
            if (!fs.existsSync(infrastructureFolder)) {
                fs.mkdirSync(infrastructureFolder, { recursive: true });
            }

            // Updates volume configuration
            infrastructureObject.services.drupal.volumes[0] = environmentRoot + ':' + '/opt/drupal';

            const infrastructureFile = path.join(infrastructureFolder, "dresktop.yml");
            fs.writeFileSync(infrastructureFile, yaml.dump(infrastructureObject));

            return infrastructureFile;

        } catch (e) {
            throw new Error("Problems parsing.");
        }
    }

    /**
     * Imports the base infrastructure file to be used to create 
     * the environments infrastructure
     */
    private importBase(): any {
        try {
            const resourcesPath = path.join(app.getPath('home'), 'Dresktop', '.resources')
            const baseInfrastructure = path.join(resourcesPath, 'infrastructure', 'base.yml')
            return yaml.load(fs.readFileSync(baseInfrastructure, 'utf8')) as any;
        } catch (e) {
            throw new Error("Problems importing the base infrastructure file.");
        }
    }

    /**
     * Used to import the environments infrastructure files
     * 
     * @param filePath Path of the infrastructure environment file
     */
    private importFile(filePath: string) {
        try {
            return yaml.load(fs.readFileSync(filePath, 'utf8')) as any;
        } catch (e) {
            throw new Error("Problems importing the base infrastructure file.");
        }
    }
}