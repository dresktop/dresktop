import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => {
        return {
            settings: [0],
        };
    },

    getters: {
        getSettings(): any {
            return this.settings;
        },
    },

    actions: {
        async load() {
            this.settings = await window.backendAPI.getSettings();
        },

        async save(payload: any) {
            const result = await window.backendAPI.saveSettings(payload);

            if (result) {

                let index = this.settings.findIndex((setting: any) => setting.key == result.key);

                if (index >= 0) {
                    this.settings.splice(index, 1, result);
                }
            }

            return result;
        },
    },
});