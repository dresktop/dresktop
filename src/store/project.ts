import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
    state: () => {
        return {
            projects: [0],
        };
    },

    getters: {

        getProjects(): any {
            return this.projects;
        },
    },

    actions: {
        async load() {
            this.projects = await window.backendAPI.getProjects();
        },

        async save(payload: any) {
            const result = await window.backendAPI.createProject(payload);
            this.projects.push(result);
            return result;
        },

        async edit(payload: any) {
            const result = await window.backendAPI.editProject(payload);

            if (result) {

                let index = this.projects.findIndex((project: any) => project.id == result.id);

                if (index >= 0) {
                    this.projects.splice(index, 1, result);
                }
            }

            return result;
        },

        async delete(id: number) {
            const numberOfDeletedRows = await window.backendAPI.deleteProject(id);

            if (numberOfDeletedRows) {

                let index = this.projects.findIndex((project: any) => project.id == id);

                if (index >= 0) {
                    this.projects.splice(index, 1);
                }
            }

            return numberOfDeletedRows;
        }
    },
});