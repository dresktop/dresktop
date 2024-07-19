import { defineStore } from 'pinia';

export const useEnvironmentStore = defineStore('environment', {
    state: () => {
        return {
            environments: [0],
        };
    },

    getters: {
        getEnvironments(): any {
            return this.environments;
        },
    },

    actions: {

        // Loads all the environments
        async load() {
            this.environments = await window.backendAPI.getEnvironments();
        },

        async loadOne(id: number) {
            return await window.backendAPI.getEnvironment(id);
        },

        async save(environment: any) {
            const result = await window.backendAPI.createEnvironment(environment);
            this.environments.push(result);
            return result;
        },

        async edit(payload: any) {
            const result = await window.backendAPI.editEnvironment(payload);

            if (result) {

                let index = this.environments.findIndex((environment: any) => environment.id == result.id);

                if (index >= 0) {
                    this.environments.splice(index, 1, result);
                }
            }

            return result;
        },

        async delete(id: number) {
            const numberOfDeletedRows = await window.backendAPI.deleteEnvironment(id);

            if (numberOfDeletedRows) {

                let index = this.environments.findIndex((environment: any) => environment.id == id);

                if (index >= 0) {
                    this.environments.splice(index, 1);
                }
            }

            return numberOfDeletedRows;
        }
    },
});