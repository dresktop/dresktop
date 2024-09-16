<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';
import _ from 'lodash';
import useInternationalization from '../../composables/translation';

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
    name: useInternationalization('labels.backup_database'),
    type: "pre-deployment",
    key: "backup-database",
    path: downloads && downloads.value ? downloads.value : "",
    value: true
}, {
    name: useInternationalization('labels.turn_on_maintenance_mode'),
    type: "pre-deployment",
    key: "turnon-maintenance-mode",
    value: true
}, {
    name: useInternationalization('labels.clear_drupal_caches'),
    type: "pre-deployment",
    key: "clear-cache",
    value: true
}, {
    name: useInternationalization('labels.vendor_updates_option'),
    type: "deployment",
    key: "vendor",
    vendor: {
        selected: "composer",
        options: [
            {
                key: 'composer',
                name: useInternationalization('labels.run_composer_install'),
            },
        ]
    },
    value: true
}, {
    name: useInternationalization('labels.run_database_updates'),
    type: "post-deployment",
    key: "database-updates",
    value: true
}, {
    name: useInternationalization('labels.import_configuration'),
    type: "post-deployment",
    key: "import-configuration",
    value: true
}, {
    name: useInternationalization('labels.sanitize_database'),
    type: "post-deployment",
    key: "sanitize-database",
    value: false
}, {
    name: useInternationalization('labels.clear_all_drupal_caches'),
    type: "post-deployment",
    key: "clear-cache",
    value: true
}, {
    name: useInternationalization('labels.turn_off_maintenance_mode'),
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

    // We need to do this updates in the values of the object, because i18next
    // creates references in the values I have to display the text so they need to be
    // raw and sometimes is not in the top level
    const actionsRaw = toRaw(actions.value).map(function (action: any) {

        // Updates the name of the current action
        // This is because i18next created references
        let result = {
            ...action,
            name: toRaw(action.name.value)
        }

        // Vendor has more references nested
        if (typeof action.vendor !== "undefined") {

            // Inside the property vendor, there is an array with option values. We also need to
            // raw the values in those options
            const optionsRaw = toRaw(action.vendor.options).map(function (option: any) {
                return {
                    ...option,
                    name: toRaw(option.name.value)
                }
            });

            // Opdates the original array
            result = {
                ...result,
                vendor: optionsRaw
            }
        }

        return result;
    });

    const payload = {
        environmentFrom: toRaw(selectedEnvironmentFrom.value),
        actions: actionsRaw,
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
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.deploy') }} </h2>
            </template>
            <template #content>

                <Alert :show="!props.projectEnvironments.length" type="error"
                    :text="useInternationalization('alerts.deploy_environment_source').value" class="mb-4" />

                <Alert v-if="(selectedEnvironmentFrom && typeof selectedEnvironmentFrom.name !== 'undefined')"
                    v-model:show="showAlert" type="warning"
                    :text="useInternationalization('alerts.deploy_new_tag').value + ` <strong>${selectedEnvironmentFrom.name}</strong>. ` + useInternationalization('alerts.deploy_to').value + ` <strong>${props.currentEnvironment.name}</strong>`"
                    class="mb-4" closable="true" />

                <div class="flex flex-row gap-4 h-full items-center">
                    <div class="basis-1/2 h-full">
                        <Select :label="useInternationalization('labels.from').value + `:`"
                            :items="props.projectEnvironments" v-model:selected="selectedEnvironmentFrom" />
                    </div>
                    <div>
                        <Icon name="right" class="" />
                    </div>
                    <div class="basis-1/2 h-full">
                        <Input :label="useInternationalization('labels.to').value + `:`"
                            v-model="props.currentEnvironment.name" :readonly='true'
                            :message="useInternationalization('messages.database_path')" />
                    </div>
                </div>
                <div class="mb-3">
                    <Textarea v-model="commitMessage" rows="3"
                        :label="useInternationalization('labels.commit_message')" />
                </div>
                <div>
                    <Card color="bg-slate-100" colorDark="dark:bg-slate-900" classes="shadow-none" class="mb-4">
                        <template #content>
                            <div class="mb-5">
                                <div class="text-lg font-semibold">
                                    {{ useInternationalization('labels.deployment_steps') }}
                                </div>
                                <div>
                                    {{ useInternationalization('labels.deployment_steps_description') }}
                                </div>
                            </div>
                            <template v-for="(action, _index) in actions" :key="_index">
                                <Checkbox :label="`${action.name} (${action.type})`" v-model="action.value"
                                    class="mb-4" />
                                <div v-if="action.value && (typeof action.path !== 'undefined')"
                                    class="mb-4 py-1 px-5 dar">
                                    <Input :label="useInternationalization('labels.folder_path')" v-model="action.path"
                                        @click="openDialog(action)" :readonly='true'
                                        :message="useInternationalization('labels.database_path_download')" />
                                </div>
                                <div v-if="action.value && (typeof action.vendor !== 'undefined')"
                                    class="mb-4 py-1 px-5">
                                    <Radio :label="useInternationalization('labels.vendor_updates_option')"
                                        v-model="action.vendor.selected" :options="action.vendor.options" class=""
                                        direction="col" />
                                </div>
                            </template>
                        </template>
                    </Card>
                </div>
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.deploy')" @click="onDeploy"
                    class="mr-2 disabled:opacity-75" :disabled="!props.projectEnvironments.length" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>