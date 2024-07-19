import { defineStore } from 'pinia';

export const useInfrastructureStore = defineStore('infrastructure', {
    state: () => {
        return {
            infrastructures: [0],
        };
    },

    getters: {
        getInfrastructures(): any {
            return this.infrastructures;
        },
    },

    actions: {
        async load() {
            this.infrastructures = await window.backendAPI.getInfrastructures();
        },

        async loadOne(environmentId: number) {
            return await window.backendAPI.getInfrastructure(environmentId);
        },

        async save(infrastructure: any, environmentRoot: string) {
            const result = await window.backendAPI.createInfrastructure(infrastructure, environmentRoot);
            this.infrastructures.push(result);
            return result;
        },
    },
});