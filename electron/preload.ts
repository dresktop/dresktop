import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('backendAPI', {
  async getAppVersion() {
    return await ipcRenderer.invoke('getAppVersion');
  },
  async reloadApp() {
    return await ipcRenderer.invoke('reloadApp');
  },
  async checkFolderIsEmpty(path: string) {
    return await ipcRenderer.invoke('checkFolderIsEmpty', path);
  },
  async openDialog(type: string) {
    return await ipcRenderer.invoke('openDialog', type);
  },
  async pathJoin(paths: Array<string>) {
    return await ipcRenderer.invoke('pathJoin', paths);
  },
  async getUserDocumentsPath() {
    return await ipcRenderer.invoke('getUserDocumentsPath');
  },
  async getUserDataPath() {
    return await ipcRenderer.invoke('getUserDataPath');
  },
  async getUserDownloadsPath() {
    return await ipcRenderer.invoke('getUserDownloadsPath');
  },
  async getProjects() {
    return await ipcRenderer.invoke('getProjects');
  },
  async createProject(project: any) {
    return await ipcRenderer.invoke('createProject', project);
  },
  async editProject(project: any) {
    return await ipcRenderer.invoke('editProject', project);
  },
  async deleteProject(projectId: number) {
    return await ipcRenderer.invoke('deleteProject', projectId);
  },
  async getEnvironment(id: number) {
    return await ipcRenderer.invoke('getEnvironment', id);
  },
  async getEnvironments() {
    return await ipcRenderer.invoke('getEnvironments');
  },
  async createEnvironment(environment: any) {
    return await ipcRenderer.invoke('createEnvironment', environment);
  },
  async editEnvironment(environment: any) {
    return await ipcRenderer.invoke('editEnvironment', environment);
  },
  async deleteEnvironment(environmentId: number) {
    return await ipcRenderer.invoke('deleteEnvironment', environmentId);
  },
  async getInfrastructures() {
    return await ipcRenderer.invoke('getInfrastructures');
  },
  async getInfrastructure(environmentId: number) {
    return await ipcRenderer.invoke('getInfrastructure', environmentId);
  },
  async createInfrastructure(infrastructure: any, environmentRoot: string) {
    return await ipcRenderer.invoke('createInfrastructure', infrastructure, environmentRoot);
  },
  async powerInfrastructure(filePath: string, flag: boolean) {
    return await ipcRenderer.invoke('powerInfrastructure', filePath, flag);
  },
  async statusInfrastructure(filePath: string) {
    return await ipcRenderer.invoke('statusInfrastructure', filePath);
  },
  async runCommand(command: string, project: any, environment: any, identifier?: string) {
    return await ipcRenderer.invoke('runCommand', command, project, environment, identifier);
  },
  async runOS(command: string, environment?: any, identifier?: string) {
    return await ipcRenderer.invoke('runOS', command, environment, identifier);
  },
  async exportDatabase(project: any, environment: any, path: string, identifier?: string) {
    return await ipcRenderer.invoke('exportDatabase', project, environment, path, identifier);
  },
  async importDatabase(project: any, environment: any, path: string, identifier?: string) {
    return await ipcRenderer.invoke('importDatabase', project, environment, path, identifier);
  },
  async syncDatabase(project: any, environment: any, environmentFrom: any, identifier?: string) {
    return await ipcRenderer.invoke('syncDatabase', project, environment, environmentFrom, identifier);
  },
  async deploy(project: any, environment: any, payload: any, identifier?: string) {
    return await ipcRenderer.invoke('deploy', project, environment, payload, identifier);
  },
  async syncFiles(environment: any, environmentFrom: any, identifier?: string) {
    return await ipcRenderer.invoke('syncFiles', environment, environmentFrom, identifier);
  },
  async openUriBrowser(uri: string) {
    return await ipcRenderer.invoke('openUriBrowser', uri);
  },
  async getSettings() {
    return await ipcRenderer.invoke('getSettings');
  },
  async saveSettings(key: any) {
    return await ipcRenderer.invoke('saveSettings', key);
  },
  async activateService(project: any, environment: any, service: string, status: any, filePath: string) {
    return await ipcRenderer.invoke('activateService', project, environment, service, status, filePath);
  },
  async copyToClipboard(text: any) {
    return await ipcRenderer.invoke('copyToClipboard', text);
  },
  async checkForUpdates() {
    return await ipcRenderer.invoke('checkForUpdates');
  },
  async installUpdates() {
    return await ipcRenderer.invoke('installUpdates');
  },
  async checkCaddy() {
    return await ipcRenderer.invoke('checkCaddy');
  },
  async checkNetwork() {
    return await ipcRenderer.invoke('checkNetwork');
  },
  async checkRsync() {
    return await ipcRenderer.invoke('checkRsync');
  },
  async getLogs(environmentId: number) {
    return await ipcRenderer.invoke('getLogs', environmentId);
  },
  async saveLog(log: any, environmentId: number) {
    return await ipcRenderer.invoke('saveLog', log, environmentId);
  },
  async deleteLogs(environmentId: number) {
    return await ipcRenderer.invoke('deleteLogs', environmentId);
  },
  async updateLog(result: any, identifier: string) {
    return await ipcRenderer.invoke('updateLog', result, identifier);
  },
  async getGroups() {
    return await ipcRenderer.invoke('getGroups');
  },
  async saveGroup(group: any) {
    return await ipcRenderer.invoke('saveGroup', group);
  },
  async deleteGroup(id: number) {
    return await ipcRenderer.invoke('deleteGroup', id);
  },
  async editGroup(group: any) {
    return await ipcRenderer.invoke('editGroup', group);
  },

})

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit);
  },
})