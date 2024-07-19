<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';
import _ from 'lodash';

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Icon from './../Icon.vue';
import Select from './../form/Select.vue';
import Radio from './../form/Radio.vue';
import Input from './../form/Input.vue';
import Checkbox from './../form/Checkbox.vue';
import Card from './../Card.vue';
import Alert from './../Alert.vue';
import Textarea from './../form/Textarea.vue';

import { useSettingsStore } from '../../store/settings';

const props = defineProps(['show', 'projectEnvironments', 'currentEnvironment']);
const emit = defineEmits(['update:show', 'onDeploy']);
const settingsStore = useSettingsStore();

const downloads: any = settingsStore.settings.find((setting: any) => setting.key == 'downloads');

const actions = ref([{
    name: "Backup database",
    type: "pre-deployment",
    key: "backup-database",
    path: downloads && downloads.value ? downloads.value : "",
    value: true
}, {
    name: "Turn on Drupal maintenance mode",
    type: "pre-deployment",
    key: "turnon-maintenance-mode",
    value: true
}, {
    name: "Clear all Drupal caches",
    type: "pre-deployment",
    key: "clear-cache",
    value: true
}, {
    name: "Vendor updates",
    type: "deployment",
    key: "vendor",
    vendor: {
        selected: "composer",
        options: [
            {
                key: 'composer',
                name: 'Run Composer install'
            },
            // {
            //     key: 'rsync',
            //     name: 'Sync vendor folder'
            // }
        ]
    },
    value: true
}, {
    name: "Run database updates",
    type: "post-deployment",
    key: "database-updates",
    value: true
}, {
    name: "Import configuration",
    type: "post-deployment",
    key: "import-configuration",
    value: true
}, {
    name: "Sanitize Database",
    type: "post-deployment",
    key: "sanitize-database",
    value: false
}, {
    name: "Clear all Drupal caches",
    type: "post-deployment",
    key: "clear-cache",
    value: true
}, {
    name: "Turn off Drupal maintenance mode",
    type: "post-deployment",
    key: "turnoff-maintenance-mode",
    value: true
}]
);

const commitMessage = ref("");

const dialogIsOpen = ref(false);

async function openDialog(action: any) {

    if (!dialogIsOpen.value) {

        dialogIsOpen.value = true;

        // Gets the result of the file ui prompt
        const result = await window.backendAPI.openDialog('directory');
        if (!result.canceled) {

            action.path = result.filePaths[0];

        }
        dialogIsOpen.value = false;
    }
}

async function onDeploy() {

    const payload = {
        environmentFrom: toRaw(selectedEnvironmentFrom.value),
        actions: toRaw(actions.value),
        commitMessage: toRaw(commitMessage.value)
    };

    emit('onDeploy', payload);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

let selectedEnvironmentFrom = ref();

const showAlert = ref(true);

const showError = ref(false);
showError.value = (props.projectEnvironments && !props.projectEnvironments.length) ? true : false;

// This watch is to assign a default value when the component is displayed
watch(() => props.projectEnvironments, (_value) => {
    if (props.projectEnvironments.length) {
        selectedEnvironmentFrom.value = props.projectEnvironments[0];
    }
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> Deploy </h2>
            </template>
            <template #content>

                <Alert :show="!props.projectEnvironments.length" type="error"
                    :text="`You need to create an environment to be the source of the deployment.`" class="mb-4" />

                <Alert v-if="(selectedEnvironmentFrom && typeof selectedEnvironmentFrom.name !== 'undefined')"
                    v-model:show="showAlert" type="warning"
                    :text="`A new tag will be created from <strong>${selectedEnvironmentFrom.name}</strong> and deployed to <strong>${props.currentEnvironment.name}</strong>`"
                    class="mb-4" closable="true" />

                <div class="flex flex-row gap-4 h-full items-center">
                    <div class="basis-1/2 h-full">
                        <Select label="From:" :items="props.projectEnvironments"
                            v-model:selected="selectedEnvironmentFrom" />
                    </div>
                    <div>
                        <Icon name="right" class="" />
                    </div>
                    <div class="basis-1/2 h-full">
                        <Input label="To:" v-model="props.currentEnvironment.name" :readonly='true'
                            message="Full path of the file. Allowed formats .sql and .gz" />
                    </div>
                </div>
                <div class="mb-3">
                    <Textarea v-model="commitMessage" rows="3" label="Optional commit message" />
                </div>
                <div>
                    <Card color="bg-slate-100" colorDark="dark:bg-slate-900" classes="shadow-none" class="mb-4">
                        <template #content>
                            <div class="mb-5">
                                <div class="text-lg font-semibold">
                                    Deployment steps
                                </div>
                                <div>
                                    The following steps will be run in the order of the list.
                                </div>
                            </div>
                            <template v-for="(action, _index) in actions" :key="_index">
                                <Checkbox :label="`${action.name} (${action.type})`" v-model="action.value"
                                    class="mb-4" />
                                <div v-if="action.value && (typeof action.path !== 'undefined')"
                                    class="mb-4 py-1 px-5 dar">
                                    <Input label="Folder path" v-model="action.path" @click="openDialog(action)"
                                        :readonly='true' message="Path where the database dump will be downloaded." />
                                </div>
                                <div v-if="action.value && (typeof action.vendor !== 'undefined')"
                                    class="mb-4 py-1 px-5">
                                    <Radio label="Select how to deploy vendor updates" v-model="action.vendor.selected"
                                        :options="action.vendor.options" class="" direction="col" />
                                </div>
                            </template>
                        </template>
                    </Card>
                </div>
            </template>
            <template #footer>
                <Button text="Deploy" @click="onDeploy" class="mr-2 disabled:opacity-75"
                    :disabled="!props.projectEnvironments.length" />
                <Button @click="emit('update:show', false)" text="Cancel" type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>