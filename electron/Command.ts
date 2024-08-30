import { spawn } from 'node:child_process';
import log from 'electron-log/main';
const { NodeSSH } = require('node-ssh')
import { BrowserWindow } from 'electron'
import * as path from 'path';
import { Message } from './Message';

log.initialize();

export class Command {

    readonly COMMAND_DOCKER_COMPOSE = 'docker compose';
    window: BrowserWindow

    constructor(window: BrowserWindow) {
        this.window = window;
    }

    // ------------------------------------------------------------
    // Infrastructure
    // ------------------------------------------------------------

    /**
     * Runs docker compose start
     * 
     * @param filePath Docker composer file path
     * @returns {Promise<Message|boolean>} A Promise Message object if successful, or false if an error occurs.
     */
    async start(filePath: string): Promise<Message | boolean> {

        const command = `${this.COMMAND_DOCKER_COMPOSE} -f ${this.escapeWhiteSpaces(filePath)} start`;

        try {
            return await this.execDesktop(command);
        } catch (error) {
            return false;
        }
    }

    /**
     * Runs docker compose up
     * 
     * @param filePath Docker composer file path
     * @returns {Promise<Message|boolean>} A Promise Message object if successful, or false if an error occurs.
     */
    async up(filePath: string): Promise<Message | boolean> {

        const command = `${this.COMMAND_DOCKER_COMPOSE} -f ${this.escapeWhiteSpaces(filePath)} up -d --remove-orphans`;

        try {
            return await this.execDesktop(command);
        } catch (error) {
            return false;
        }
    }

    /**
     * Runs docker compose ps
     * 
     * @param filePath Docker composer file path
     * @returns {Promise<Message|boolean>} A Promise Message object if successful, or false if an error occurs.
     */
    async status(filePath: string): Promise<Message | boolean> {

        const command = `${this.COMMAND_DOCKER_COMPOSE} -f ${this.escapeWhiteSpaces(filePath)} ps --all --format json`;

        try {
            return await this.execDesktop(command);
        } catch (error) {
            return false;
        }
    }

    /**
     * Runs docker compose stop
     * 
     * @param filePath Docker composer file path
     * @returns {Promise<Message|boolean>} A Promise Message object if successful, or false if an error occurs.
     */
    async stop(filePath: string): Promise<Message | boolean> {

        const command = `${this.COMMAND_DOCKER_COMPOSE} -f ${this.escapeWhiteSpaces(filePath)} stop`;

        try {
            return await this.execDesktop(command);
        } catch (error) {
            return false;
        }
    }

    /**
     * Runs docker compose down
     * 
     * @param filePath Docker composer file path
     * @returns {Promise<Message|boolean>} A Promise Message object if successful, or false if an error occurs.
     */
    async down(filePath: string): Promise<Message | boolean> {

        const command = `${this.COMMAND_DOCKER_COMPOSE} -f ${this.escapeWhiteSpaces(filePath)} down`;

        try {
            return await this.execDesktop(command);
        } catch (error) {
            return false;
        }
    }

    private escapeWhiteSpaces(path: string) {
        return path.replace(/(\s+)/g, '\\$1')
    }

    // ------------------------------------------------------------
    // Sync files
    // ------------------------------------------------------------

    /**
     * Copy files from desktop virtual environment (source) 
     * to another desktop virtual environment (destination)
     * 
     * @param environmentSource Environment source object
     * @param environmentDestination Environment destination object
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async syncFilesDesktopDesktop(environmentSource: any, environmentDestination: any, identifier?: any): Promise<Message> {

        const command = `
            docker run --rm \
            -v ${environmentSource.root}/sites/default/files:/source \
            -v ${environmentDestination.root}/sites/default/files:/destination \
            jdeg/dresktop-rsync \
            rsync -av /source/ /destination/
        `;

        return await this.execDesktop(command, undefined, identifier);
    }

    /**
     * Copy files from cloud environment (source) 
     * to another desktop virtual environment (destination)
     * 
     * @param environmentSource Environment source object
     * @param environmentDestination Environment destination object
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async syncFilesCloudDesktop(environmentSource: any, environmentDestination: any, identifier?: any): Promise<Message> {

        const command = `
            docker run --rm \
            -v ${environmentSource.ssh_key_path}:/keys/id_rsa \
            -v ${environmentDestination.root}/sites/default/files/:/destination \
            jdeg/dresktop-rsync \
            rsync -avz --no-perms --no-owner --no-group -e "ssh -i /keys/id_rsa -o StrictHostKeyChecking=no" \
            ${environmentSource.user}@${environmentSource.host}:${environmentSource.root}/sites/default/files/ /destination/`;

        return await this.execDesktop(command, undefined, identifier);
    }

    /**
     * Copy files from desktop virtual environment (source) 
     * to another cloud environment (destination)
     * 
     * @param environmentSource Environment source object
     * @param environmentDestination Environment destination object
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async syncFilesDesktopCloud(environmentSource: any, environmentDestination: any, identifier?: any): Promise<Message> {

        const command = `
            docker run --rm \
            -v ${environmentDestination.ssh_key_path}:/keys/id_rsa \
            -v ${environmentSource.root}/sites/default/files/:/source \
            jdeg/dresktop-rsync \
            rsync -avz --no-perms --no-owner --no-group -e "ssh -i /keys/id_rsa -o StrictHostKeyChecking=no" \
            /source/ ${environmentDestination.user}@${environmentDestination.host}:${environmentDestination.root}/sites/default/files/`;

        return await this.execDesktop(command, undefined, identifier);
    }

    /**
     * Copy files from cloud environment (source) 
     * to another cloud environment (destination)
     * 
     * @param environmentSource Environment source object
     * @param environmentDestination Environment destination object
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async syncFilesCloudCloud(environmentSource: any, environmentDestination: any, identifier?: any): Promise<Message> {

        const port = 50000;
        const tunnel_host = "localhost";

        const command = `
            ssh -A \
            -l ${environmentDestination.user} \
            -i ${environmentSource.ssh_key_path} \
            -o StrictHostKeyChecking=no \
            -o AddKeysToAgent=yes \
            -o UserKnownHostsFile=/dev/null \
            -o GlobalKnownHostsFile=/dev/null \
            -R ${tunnel_host}:${port}:${environmentDestination.host}:22 ${environmentSource.user}@${environmentSource.host} \
            'rsync --no-perms --no-owner --no-group -e \
            "ssh -A \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o AddKeysToAgent=yes \
            -o GlobalKnownHostsFile=/dev/null \
            -p ${port}" \
            -var ${environmentSource.root}/sites/default/files/ ${environmentDestination.user}@${tunnel_host}:${environmentDestination.root}/sites/default/files'
        `;

        return await this.execDesktop(command, undefined, identifier);
    }

    // ------------------------------------------------------------
    // Files
    // ------------------------------------------------------------

    /**
     * Deletes file in a cloud server
     * 
     * @param environment Environment where the file will be deleted
     * @param remotePath The path of the file inside the environment
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async removeFileCloud(environment: any, remotePath: string, identifier?: any): Promise<Message> {
        const command = `rm -f ${remotePath}`;
        return await this.execCloud(command, environment, identifier);
    }

    /**
     * Copy file from the user computer file system into the container
     * 
     * @param project Environment's project 
     * @param environment Environment where the file will be copied
     * @param localPath Source file path in the user file system
     * @param remotePath Destination file path inside the container
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async copyFileDesktop(project: any, environment: any, localPath: string, remotePath: string, identifier?: any): Promise<Message> {
        const command = `docker cp ${localPath} db.${environment.machine_name}.${project.machine_name}.drt:${remotePath}`
        return await this.execDesktop(command, undefined, identifier);
    }

    /**
     * Deletes the file inside the database container
     * 
     * @param project Environment's project 
     * @param environment Environment where the file will be deleted
     * @param remotePath File path to be removed inside the container
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async removeFileDesktop(project: any, environment: any, remotePath: string, identifier?: any): Promise<Message> {
        const commandDelete = `docker exec db.${environment.machine_name}.${project.machine_name}.drt rm ${remotePath}`
        return await this.execDesktop(commandDelete, undefined, identifier);
    }

    /**
     * Gets a file from a cloud environment and copy it in 
     * the user file system
     * 
     * @param environment Environment's project
     * @param localPath Local path where the file will be copied
     * @param remotePath Remote path where the file will be taken
     * @returns {Promise<Message>} A Promise Message object
     */
    public async getFileCloud(environment: any, localPath: string, remotePath: string): Promise<Message> {
        const ssh = new NodeSSH();

        await ssh.connect({
            host: environment.host,
            username: environment.user,
            privateKeyPath: environment.ssh_key_path
        });

        return await ssh.getFile(localPath, remotePath);
    }

    /**
     * Copy (puts) a file into the cloud server
     * 
     * @param environment Environment where the file will be put
     * @param localPath Path where the file will be taken from
     * @param remotePath Path in the cloud where the file will put
     */
    public async copyFileCloud(environment: any, localPath: string, remotePath: string) {
        const ssh = new NodeSSH();

        await ssh.connect({
            host: environment.host,
            username: environment.user,
            privateKeyPath: environment.ssh_key_path
        });

        await ssh.putFile(localPath, remotePath);
    }

    // ------------------------------------------------------------
    // Database Commands
    // ------------------------------------------------------------

    /**
     * Important: This only works for MariaDB
     * 
     * Imports the database in the databse container from the file system
     * 
     * @param project Environment's project 
     * @param environment Environment where the database will be imported
     * @param localPath Used only to determine the extension
     * @param remotePath Database file path inside the container
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async importDatabaseDesktop(project: any, environment: any, localPath: string, remotePath: string, identifier?: any): Promise<Message> {

        let command;
        const prefix = `docker exec -i db.${environment.machine_name}.${project.machine_name}.drt bash -c`;

        if (path.extname(localPath) == '.gz') {
            command = prefix + " " + `"gzip -dc ${remotePath} | /usr/bin/mariadb -udrupal -pdrupal drupal"`;
        } else {
            command = prefix + " " + `"/usr/bin/mariadb -udrupal -pdrupal drupal < ${remotePath}"`;
        }
        return await this.execDesktop(command, undefined, identifier);
    }

    /**
     * Imports the database in the cloud environment from the file system
     * 
     * @param environment Environment where the database will be imported
     * @param localPath Used only to determine the extension
     * @param remotePath Database file path in the cloud environment
     * @param identifier Action identifier
     */
    public async importDatabaseCloud(environment: any, localPath: string, remotePath: string, identifier?: any) {

        let command;

        if (path.extname(localPath) == '.gz') {
            command = `gunzip -c ${remotePath} | drush sql:cli`;
        } else {
            command = `drush sql:cli < ${remotePath}`;
        }

        // The result is the database dump output
        await this.runCloud(command, environment, identifier);
    }

    /**
     * Exports database from the container and save it in the user file system
     * 
     * @param project Environment's project 
     * @param environment Environment where the database will be exported
     * @param dumpPath User's file system path where the database will be exported
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async exportDatabaseDesktop(project: any, environment: any, dumpPath: string, identifier?: any): Promise<Message> {

        const prefix = `docker exec db.${environment.machine_name}.${project.machine_name}.drt`;

        // This is because new versions of MariaDB exports using utf8mb4_uca1400_ai_ci, but this not 
        // compatible with older versions. 
        // Note: this option can be later added in the UI as a feature
        const sufix =
            `/usr/bin/mariadb-dump --user=drupal --password=drupal --lock-tables --databases drupal |
            sed '/^\\/\\*!999999\\\\- enable the sandbox mode \\*\\//d' |
            sed 's/utf8mb4_uca1400_ai_ci/utf8mb4_unicode_ci/g' |
            gzip > ${dumpPath}`;

        const command = prefix + " " + sufix;
        return await this.execDesktop(command, undefined, identifier);
    }

    /**
     * Exports database in the cloud
     * 
     * @param environment Cloud environment
     * @param dumpName Database name
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async exportDatabaseCloud(environment: any, dumpName: string, identifier?: any): Promise<Message> {
        const cloudTemporalDirectory = "/tmp";
        const cloudTemporalPath = `${cloudTemporalDirectory}/${dumpName}`;
        const command = `drush sql:dump --gzip > ${cloudTemporalPath}`;
        const result = await this.runCloud(command, environment, identifier);
        result.data = cloudTemporalPath;
        return result;
    }

    // ------------------------------------------------------------
    // Run Commands
    // ------------------------------------------------------------

    /**
     * Runs a command in a desktop virtual environment. This functions is for the commands of the 
     * application, that is why they need to be wrapped by the Docker functionality
     * 
     * @param command Command to be run in the environment
     * @param project Environment's project
     * @param environment Environment where the command will be ran
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async runDesktop(command: string, project: any, environment: any, identifier?: string): Promise<Message> {
        const prefix = `docker exec -i ${environment.machine_name}.${project.machine_name}.drt bash`
        command = prefix + " " + `<<'EOF'\n${command}\nEOF`;
        return await this.execDesktop(command, undefined, identifier);
    }

    /**
     * Runs a command in a cloud environment. This functions is for the commands of the 
     * application, that is why they need to include the Drush path
     * 
     * @param command Command to be run in the environment
     * @param environment Environment where the command will be ran
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async runCloud(command: string, environment: any, identifier?: string): Promise<Message> {
        command = `export PATH=$PATH:${environment.drush_path} && ${command}`;
        return await this.execCloud(command, environment, identifier);
    }

    /**
     * Runs a raw command in a desktop or cloud environment. This function is used to run system
     * commands like "git" or "docker" in the environment
     * 
     * @param command Command to be run in the environment
     * @param environment Environment where the command will be ran
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    async runOS(command: string, environment: any, identifier?: any): Promise<Message> {
        if (!environment || environment.type == 'desktop') {
            return await this.execDesktop(command, environment, identifier);
        } else {
            return await this.execCloud(command, environment, identifier);
        }
    }

    // ------------------------------------------------------------
    // Execute Commands
    // ------------------------------------------------------------

    /**
     * Executes a command in the cloud server
     * 
     * @param command Command to be executed
     * @param environment Environment where the command will be executed
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    public async execCloud(command: string, environment: any, identifier?: string): Promise<Message> {

        return new Promise(async (resolve) => {

            const ssh = new NodeSSH();

            // This will contain the final output, will be used to save the log in the database
            let output = "";

            const that = this;

            await ssh.connect({
                host: environment.host,
                username: environment.user,
                privateKeyPath: environment.ssh_key_path,
            }).then(() => {
                return ssh.execCommand(command, {
                    cwd: environment.app_root,
                    onStdout(data: any) {
                        if (typeof identifier !== 'undefined') {
                            that.window.webContents.send('on-logger-response', {
                                identifier: identifier,
                                data: data.toString()
                            });
                        }
                        output += data.toString('utf8');
                    },
                    onStderr(data: any) {
                        if (typeof identifier !== 'undefined') {
                            that.window.webContents.send('on-logger-response', {
                                identifier: identifier,
                                data: data.toString()
                            });
                        }
                        output += data.toString('utf8');
                    }
                })
            }).then((result: any) => {

                if (result.code == 0) {
                    const finalResult = result.stdout ? result.stdout : result.stderr;
                    resolve(new Message(true, finalResult));
                } else {
                    resolve(new Message(false, result.stderr));
                }
            }).catch((err: any) => {

                resolve(new Message(false, err));
            });
        });
    }

    /**
     * Executes a command in the desktop computer
     * 
     * @param command Command to be executed
     * @param identifier Action identifier
     * @returns {Promise<Message>} A Promise Message object
     */
    public async execDesktop(command: string, environment?: any, identifier?: string): Promise<Message> {

        return new Promise((resolve) => {

            // Include Docker and Docker compose /usr/local/bin path
            // https://docs.docker.com/desktop/mac/permission-requirements/
            let processEnv = process.env;
            processEnv.PATH = processEnv.PATH + ":/usr/local/bin"

            const subProcess = spawn(command, {
                cwd: (environment && environment.app_root) ? environment.app_root : process.cwd(),
                env: processEnv,
                stdio: 'pipe',
                shell: true
            });

            // This will contain the final output, will be used to save the log in the database
            let output = "";

            subProcess.stdout!.on('data', (data: any) => {
                if (typeof identifier !== 'undefined') {
                    this.window.webContents.send('on-logger-response', {
                        identifier: identifier,
                        data: data.toString()
                    });
                }
                output += data;
            });
            subProcess.stderr!.on('data', (data: any) => {
                if (typeof identifier !== 'undefined') {
                    this.window.webContents.send('on-logger-response', {
                        identifier: identifier,
                        data: data.toString()
                    });
                }
                output += data;
            });
            subProcess.on('error', (error: any) => {
                if (typeof identifier !== 'undefined') {
                    this.window.webContents.send('on-logger-response', {
                        identifier: identifier,
                        data: error.toString()
                    });
                }
                output += error;
            });
            subProcess.on('exit', (_code: any) => { });
            subProcess.on('close', (code: any) => {

                if (code === 0) {
                    resolve(new Message(true, output.trim()));
                } else {
                    resolve(new Message(false, output.trim()));
                }
            });
        });
    }
}