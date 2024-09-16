import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './style.css'
import App from './App.vue'
import router from './router'
import VueCodemirror from 'vue-codemirror'

import i18next from 'i18next';
import I18NextVue from 'i18next-vue';

const translations = await window.backendAPI.getTranslations();

const languages: any = {};

for (const lang in translations) {
  if (translations.hasOwnProperty(lang)) {
    languages[lang] = {
      frontend: {
        frontend: translations[lang].frontend
      }
    };
  }
}

i18next.init({
  lng: 'en',
  interpolation: {
    escapeValue: false
  },
  defaultNS: "frontend",
  debug: true,
  fallbackLng: 'en',
  resources: languages
});

// ---------------------------------
// Typings
// https://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
// ---------------------------------
export interface IBackendAPI {
  getAppVersion: () => Promise<string>,
  getTranslations: () => Promise<any>,
  reloadApp: () => Promise<string>,
  openDialog: (type: string) => Promise<any>,
  pathJoin: (paths: Array<string>) => Promise<any>,
  getUserDocumentsPath: () => Promise<any>,
  getUserDataPath: () => Promise<any>,
  getProjects: () => Promise<any>,
  createProject: (project: any) => Promise<any>,
  editProject: (project: any) => Promise<any>,
  deleteProject: (id: any) => Promise<any>,
  getEnvironment: (id: number) => Promise<any>,
  getEnvironments: () => Promise<any>,
  createEnvironment: (environment: any) => Promise<any>,
  editEnvironment: (environment: any) => Promise<any>,
  deleteEnvironment: (id: any) => Promise<any>,
  getInfrastructures: () => Promise<any>,
  getInfrastructure: (environmentId: number) => Promise<any>,
  createInfrastructure: (infrastructure: any, environmentRoot: string) => Promise<any>,
  powerInfrastructure: (filePath: any, flag: boolean) => Promise<any>,
  statusInfrastructure: (filePath: any) => Promise<any>,
  runCommand: (command: string, project: any, environment: any, identifier?: string) => Promise<any>,
  runOS: (command: string, environment: any, identifier?: string) => Promise<any>,
  execDesktop: (command: string) => Promise<any>,
  exportDatabase: (project: any, environment: any, path: string, identifier?: string) => Promise<any>,
  importDatabase: (project: any, environment: any, path: string, identifier?: string) => Promise<any>,
  syncDatabase: (project: any, environment: any, environmentFrom: any, identifier?: string) => Promise<any>,
  deploy: (project: any, environment: any, payload: any, identifier?: string) => Promise<any>,
  syncFiles: (environment: any, environmentFrom: any, identifier?: string) => Promise<any>,
  openUriBrowser: (uri: string) => Promise<any>,
  getSettings: () => Promise<any>,
  saveSettings: (key: any) => Promise<any>,
  activateService: (project: any, environment: any, service: string, status: any, filePath: string) => Promise<any>,
  copyToClipboard: (text: any) => Promise<any>,
  checkFolderIsEmpty: (path: string) => Promise<any>,
  checkForUpdates: () => Promise<any>,
  installUpdates: () => Promise<any>,
  checkCaddy: () => Promise<any>,
  checkNetwork: () => Promise<any>,
  checkRsync: () => Promise<any>,
  getLogs: (environmentId: number) => Promise<any>,
  saveLog: (log: any, environmentId: number) => Promise<any>,
  deleteLogs: (environmentId: number) => Promise<any>,
  updateLog: (result: any, identifier: string) => Promise<any>,
  getGroups: () => Promise<any>,
  saveGroup: (group: any) => Promise<any>,
  editGroup: (group: any) => Promise<any>,
  deleteGroup: (id: number) => Promise<any>,
}

declare global {
  interface Window {
    backendAPI: IBackendAPI
  }
}

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(router)
  .use(VueCodemirror)
  .use(I18NextVue, { i18next })
  .mount('#app');