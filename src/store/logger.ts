import { defineStore } from 'pinia';

export const useLoggerStore = defineStore('logger', {
    state: () => {
        return {
            environmentLogs: [] as Array<any>,
        };
    },

    getters: {

        getLogs(): any {
            return this.environmentLogs;
        },
    },

    actions: {
        async load(environmentId: number) {
            this.environmentLogs = await window.backendAPI.getLogs(environmentId);
        },

        async save(log: any, environmentId: number) {
            const result: any = await window.backendAPI.saveLog(log, environmentId);
            this.environmentLogs.push(result);
            return result;
        },

        async update(result: any, identifier: string) {
            await window.backendAPI.updateLog(result, identifier);
        },

        // Delete all the logs of an environment
        async delete(environmentId: number) {
            const numberOfDeletedRows = await window.backendAPI.deleteLogs(environmentId);

            if (numberOfDeletedRows) {
                this.environmentLogs = []
            }

            return numberOfDeletedRows;
        }
    },
});