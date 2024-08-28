import { ipcMain } from 'electron';
import { Core } from './Core'
export class MessageManager {

    core: Core;

    constructor(core: Core) {
        this.core = core;
    }

    async init() {

        const that = this;

        ipcMain.handle('getAppVersion', async function (_) {
            return await that.core.getAppVersion();
        });
        ipcMain.handle('reloadApp', async function (_) {
            return await that.core.reloadApp();
        });
        ipcMain.handle('checkFolderIsEmpty', async function (_, path: string) {
            return await that.core.checkFolderIsEmpty(path);
        });
        ipcMain.handle('openDialog', async function (_: any, type: string) {
            return await that.core.openDialog(type);
        });
        ipcMain.handle('pathJoin', async function (_: any, paths: Array<string>) {
            return await that.core.pathJoin(paths);
        });
        ipcMain.handle('getUserDocumentsPath', async function () {
            return await that.core.getUserDocumentsPath();
        });
        ipcMain.handle('getUserDataPath', async function () {
            return await that.core.getUserDataPath();
        });
        ipcMain.handle('getUserDownloadsPath', async function () {
            return await that.core.getUserDownloadsPath();
        });
        ipcMain.handle('getProjects', async function () {
            return await that.core.getProjects();
        });
        ipcMain.handle('createProject', async function (_, project: any) {
            return await that.core.createProject(project)
        });
        ipcMain.handle('editProject', async function (_, project: any) {
            return await that.core.editProject(project)
        });
        ipcMain.handle('deleteProject', async function (_, projectId: any) {
            return await that.core.deleteProject(projectId)
        });
        ipcMain.handle('getEnvironment', async function (_, id: number) {
            return await that.core.getEnvironment(id);
        });
        ipcMain.handle('getEnvironments', async function () {
            return await that.core.getEnvironments();
        });
        ipcMain.handle('createEnvironment', async function (_, environment: any) {
            return await that.core.createEnvironment(environment)
        });
        ipcMain.handle('editEnvironment', async function (_, environment: any) {
            return await that.core.editEnvironment(environment)
        });
        ipcMain.handle('deleteEnvironment', async function (_, environmentId: any) {
            return await that.core.deleteEnvironment(environmentId)
        });
        ipcMain.handle('getInfrastructures', async function () {
            return await that.core.getInfrastructures();
        });
        ipcMain.handle('getInfrastructure', async function (_, environmentId: number) {
            return await that.core.getInfrastructure(environmentId);
        });
        ipcMain.handle('createInfrastructure', async function (_, infrastructure: any, environmentRoot: string) {
            return await that.core.createInfrastructure(infrastructure, environmentRoot)
        });
        ipcMain.handle('powerInfrastructure', async function (_, filePath: string, flag: boolean) {
            return await that.core.powerInfrastructure(filePath, flag);
        });
        ipcMain.handle('statusInfrastructure', async function (_, filePath: string) {
            return await that.core.statusInfrastructure(filePath);
        });
        ipcMain.handle('runCommand', async function (_, command: string, project: any, environment: any, identifier?: string) {
            return await that.core.runCommand(command, project, environment, identifier);
        });
        ipcMain.handle('runOS', async function (_, command: string, environment: any, identifier?: string) {
            return await that.core.runOS(command, environment, identifier);
        });
        ipcMain.handle('execDesktop', async function (_, command: string) {
            return await that.core.execDesktop(command);
        });
        ipcMain.handle('exportDatabase', async function (_, project: any, environment: any, path: string, identifier?: string) {
            return await that.core.exportDatabase(project, environment, path, identifier);
        });
        ipcMain.handle('importDatabase', async function (_, project: any, environment: any, path: string, identifier?: string) {
            return await that.core.importDatabase(project, environment, path, identifier);
        });
        ipcMain.handle('syncDatabase', async function (_, project: any, environment: any, environmentFrom: any, identifier?: string) {
            return await that.core.syncDatabase(project, environment, environmentFrom, identifier);
        });
        ipcMain.handle('deploy', async function (_, project: any, environment: any, payload: any, identifier?: string) {
            return await that.core.deploy(project, environment, payload, identifier);
        });
        ipcMain.handle('syncFiles', async function (_, environment: any, environmentFrom: any, identifier?: string) {
            return await that.core.syncFiles(environment, environmentFrom, identifier);
        });
        ipcMain.handle('openUriBrowser', async function (_, uri: string) {
            return await that.core.openUriBrowser(uri);
        });
        ipcMain.handle('getSettings', async function (_) {
            return await that.core.getSettings();
        });
        ipcMain.handle('saveSettings', async function (_, key: any) {
            return await that.core.saveSettings(key)
        });
        ipcMain.handle('activateService', async function (_, project: any, environment: any, service: string, status: any, filePath: string) {
            return await that.core.activateService(project, environment, service, status, filePath)
        });
        ipcMain.handle('copyToClipboard', async function (_, text: any) {
            return await that.core.copyToClipboard(text);
        });
        ipcMain.handle('installUpdates', async function (_) {
            return await that.core.installUpdates();
        });
        ipcMain.handle('checkForUpdates', async function (_) {
            return await that.core.checkForUpdates();
        });
        ipcMain.handle('checkCaddy', async function (_) {
            return await that.core.checkCaddy();
        });
        ipcMain.handle('checkNetwork', async function (_) {
            return await that.core.checkNetwork();
        });
        ipcMain.handle('checkRsync', async function (_) {
            return await that.core.checkRsync();
        });
        ipcMain.handle('getLogs', async function (_, environmentId: number) {
            return await that.core.getLogs(environmentId);
        });
        ipcMain.handle('saveLog', async function (_, log: any, environmentId: number) {
            return await that.core.saveLog(log, environmentId);
        });
        ipcMain.handle('deleteLogs', async function (_, environmentId: number) {
            return await that.core.deleteLogs(environmentId);
        });
        ipcMain.handle('updateLog', async function (_, result: any, identifier: string) {
            return await that.core.updateLog(result, identifier);
        });
        ipcMain.handle('getGroups', async function (_) {
            return await that.core.getGroups();
        });
        ipcMain.handle('saveGroup', async function (_, group: any) {
            return await that.core.saveGroup(group);
        });
        ipcMain.handle('deleteGroup', async function (_, id: number) {
            return await that.core.deleteGroup(id);
        });
        ipcMain.handle('editGroup', async function (_, group: any) {
            return await that.core.editGroup(group);
        });
    }
}