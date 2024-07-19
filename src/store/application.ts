import { defineStore } from 'pinia';

export const useApplicationStore = defineStore('application', {
    state: () => {
        return {
            drawer: true,
            loader: false,
            loaderMessage: "",
            loaderStatus: "",
            userDataPath: "",
            userDocumentsPath: "",
            newUpdate: "",
            appVersion: "",
            newAppVersionObject: false
        };
    },

    getters: {
        getLoader(): boolean {
            return this.loader;
        },
        getLoaderMessage(): string {
            return this.loaderMessage;
        },
        getLoaderStatus(): string {
            return this.loaderStatus;
        },
        getDrawer(): boolean {
            return this.drawer;
        },
        getUserDataPath(): string {
            return this.userDataPath;
        },
        getUserDocumentsPath(): string {
            return this.userDocumentsPath;
        },
        getAppVersion(): any {
            return this.appVersion;
        },
        getNewAppVersionObject(): any {
            return this.newAppVersionObject;
        }
    },

    actions: {
        async toogleDrawer() {
            this.drawer = !this.drawer;
        },
        async setDrawer(drawer: boolean) {
            this.drawer = drawer;
        },
        async setLoader(loader: boolean, message: string = '', status: string = '') {
            this.loader = loader;
            this.loaderMessage = message;
            this.loaderStatus = status;
        },
        async loadUserDataPath() {
            this.userDataPath = await window.backendAPI.getUserDataPath();
        },
        async loadUserDocumentsPath() {
            const result = await window.backendAPI.getUserDocumentsPath();
            this.userDocumentsPath = result;
        },
        async setAppVersion(version: string) {
            this.appVersion = version;
        },
        async setNewAppVersionObject(object: any) {
            this.newAppVersionObject = object;
        },
    },
});