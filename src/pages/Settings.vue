<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from './../store/settings';
import ButtonIcon from './../components/ButtonIcon.vue';
import Page from './../components/Page.vue'
import Card from './../components/Card.vue';
import EditSettingsModal from '../components/modals/EditSettingsModal.vue';

const settingsStore = useSettingsStore();

const showNewSettingModal = ref(false);
const selectedSetting = ref({
    key: '',
    name: '',
    value: '',
    message: ''
});

function onClickSettingEdit(settingKey: string) {
    selectedSetting.value = settingsStore.getSettings.find((setting: any) => setting.key == settingKey);
    showNewSettingModal.value = true;
}

</script>

<template>

    <!-- Modal New Ssh Key -->
    <EditSettingsModal v-model:show="showNewSettingModal" :selectedSetting="selectedSetting" />

    <Page>
        <template #title>
            <div class="flex flex-row items-center">
                <span>Settings</span>
            </div>
        </template>
        <template #content>
            <Card class="bg-white h-full">
                <template #content>
                    <template v-if="settingsStore.getSettings.length">
                        <template v-for="(setting, _index) in settingsStore.getSettings" :key="index">
                            <div class="border-b border-slate-200 dark:border-slate-900 select-none">
                                <div class="
                                flex
                                flex-row
                                justify-between
                                justify-items-center
                                items-center
                                py-3
                                pl-4
                                pr-2
                                transition-all
                                ease-out
                                hover:bg-blue-50 dark:hover:bg-slate-900
                                hover:text-blue-500">
                                    <div>
                                        <div class="font-bold">
                                            {{ setting.name }}
                                        </div>
                                        <div>
                                            {{ setting.value }}
                                        </div>
                                    </div>
                                    <div>
                                        <ButtonIcon v-on:click.prevent="onClickSettingEdit(setting.key)" icon="edit"
                                            type="tertiary" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </template>
                </template>
            </Card>
        </template>
    </Page>
</template>