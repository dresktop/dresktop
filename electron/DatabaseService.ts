
import { Project as ProjectModel } from './models/Project'
import { Environment as EnvironmentModel } from './models/Environment'
import { Infrastructure as InfrastructureModel } from './models/Infrastructure'
import { Settings as SettingsModel } from './models/Settings'
import { Logger as LoggerModel } from './models/Logger'
import { Group as GroupModel } from './models/Group'

export class DatabaseService {

    public static async createProject(project: any) {
        return await ProjectModel.query().insert(project);
    }

    public static async editProject(project: any) {
        await ProjectModel.query()
            .patch({ name: project.name })
            .where('id', '=', project.id);

        return project;
    }

    public static async getProjects() {
        return await ProjectModel.query();
    }

    public static async deleteProject(projectId: any) {
        return await ProjectModel.query().deleteById(projectId);
    }

    public static async createEnvironment(environment: any) {
        return await EnvironmentModel.query().insert(environment);
    }

    public static async editEnvironment(environment: any) {
        await EnvironmentModel.query()
            .patch({
                name: environment.name,
                root: environment.root,
                type: environment.type,
                host: environment.host,
                user: environment.user,
                uri: environment.uri,
                ssh_key_path: environment.ssh_key_path,
                production_mode: environment.production_mode,
            })
            .where('id', '=', environment.id);

        return environment;
    }

    public static async deleteEnvironment(environmentId: any) {
        return await EnvironmentModel.query().deleteById(environmentId);
    }

    public static async getEnvironments() {
        return await EnvironmentModel.query();
    }

    public static async getEnvironment(id: any) {
        return await EnvironmentModel.query().findById(id);;
    }

    public static async createInfrastructure(infrastructure: any) {
        return await InfrastructureModel.query().insert({
            file_path: infrastructure.file_path,
            environment_id: infrastructure.environment_id,
            services: JSON.stringify(infrastructure.services),
        });
    }

    public static async getInfrastructures() {
        const result = await InfrastructureModel.query();

        return result.map(function (infrastructure: any) {
            return {
                file_path: infrastructure.file_path,
                services: JSON.parse(infrastructure?.services),
                environment_id: infrastructure.environment_id,
            }
        });
    }

    public static async getInfrastructure(environmentId: any) {

        const result: any = await InfrastructureModel.query().findOne({
            environment_id: environmentId
        });

        if (result && result.services) {
            return {
                file_path: result.file_path,
                services: JSON.parse(result?.services),
                environment_id: result.environment_id,
            }
        } else {
            return false;
        }
    }

    public static async saveSettings(setting: any) {

        await SettingsModel.query()
            .patch({ value: setting.val })
            .where('key', '=', setting.key);

        setting.value = setting.val;

        delete setting.val;

        return setting;
    }

    public static async getSettings() {
        return await SettingsModel.query();
    }

    // ------------------------------------------------------------
    // Logger
    // ------------------------------------------------------------

    public static async getLogs(environmentId: number) {
        return await LoggerModel.query().where({ 'environment_id': environmentId });
    }

    public static async saveLog(logs: any, environmentId: number) {
        return await LoggerModel.query().insert({
            identifier: logs.identifier,
            command: logs.command,
            result: logs.result.message,
            environment_id: environmentId,
            executed: logs.executed
        });
    }

    public static async deleteLogs(environmentId: any) {
        return await LoggerModel.query().delete()
            .where('environment_id', '=', environmentId);
    }

    public static async updateLog(result: any, identifier: string) {
        const resultPatch = await LoggerModel.query()
            .patch({
                result: result.message,
                status: result.success
            })
            .where('identifier', '=', identifier);

        return resultPatch;
    }

    // ------------------------------------------------------------
    // Groups
    // ------------------------------------------------------------

    public static async getGroups() {
        return await GroupModel.query();
    }

    public static async saveGroup(group: any) {
        return await GroupModel.query().insert({
            name: group.name,
            color: group.color
        });
    }

    public static async deleteGroup(id: any) {

        try {
            // Delete operation will return an 1 if success
            return await GroupModel.query().delete()
                .where('id', '=', id);
        } catch (error) {
            return false;
        }
    }

    public static async editGroup(group: any) {
        await GroupModel.query()
            .patch({
                name: group.name,
                color: group.color
            })
            .where('id', '=', group.id);

        return group;
    }
}