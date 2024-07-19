import { defineStore } from 'pinia';

export const useGroupStore = defineStore('group', {
    state: () => {
        return {
            groups: [{}],
        };
    },

    getters: {

        getGroups(): any {
            return this.groups;
        },
    },

    actions: {
        async load() {
            this.groups = await window.backendAPI.getGroups();
        },

        async save(group: any) {
            const result: any = await window.backendAPI.saveGroup(group);
            this.groups.push(result);
            return result;
        },

        async edit(group: any) {
            const result = await window.backendAPI.editGroup(group);

            if (result) {

                let index = this.groups.findIndex((group: any) => group.id == result.id);

                if (index >= 0) {
                    this.groups.splice(index, 1, result);
                }
            }

            return result;
        },

        // Deletes group
        async delete(id: number) {

            const numberOfDeletedRows = await window.backendAPI.deleteGroup(id);

            if (numberOfDeletedRows) {

                let index = this.groups.findIndex((group: any) => group.id == id);

                if (index >= 0) {
                    this.groups.splice(index, 1);
                }
            }

            return numberOfDeletedRows;
        }
    },
});