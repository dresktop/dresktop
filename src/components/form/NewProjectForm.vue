<script lang="ts" setup>
import { ref, watch, toRaw, onMounted } from 'vue';
// import * as path from 'path';
// import { promiseTimeout } from '@vueuse/core'
import _ from 'lodash';
import { useVuelidate } from '@vuelidate/core'
import { requiredIf, minLength, maxLength, helpers } from '@vuelidate/validators'

import { useProjectStore } from './../../store/project';
import { useEnvironmentStore } from './../../store/environment';
import { useInfrastructureStore } from './../../store/infrastructure';
import { useApplicationStore } from './../../store/application';
import { useSettingsStore } from '../../store/settings';
import { useGroupStore } from '../../store/group';

import Tabs from './../Tabs.vue';
import Card from './../Card.vue';
import Input from './../form/Input.vue';
import Checkbox from './../form/Checkbox.vue';
import Radio from './../form/Radio.vue'
import Select from './../form/Select.vue';

const props = defineProps(['form-validation', 'onlyEnvironment', 'projectId']);
const emit = defineEmits(['update:form-validation']);
defineExpose({ onSave })

const projectStore = useProjectStore();
const environmentStore = useEnvironmentStore();
const infrastructureStore = useInfrastructureStore();
const applicationStore = useApplicationStore();
const settingsStore = useSettingsStore();
const groupStore = useGroupStore();

const tabs = [
    {
        key: 'new',
        name: 'New',
    },
    {
        key: 'import',
        name: 'Import',
    },
];

const selectedTab = ref("new");

const environmentTypeOptions = [
    {
        key: 'desktop',
        name: 'Desktop'
    },
    {
        key: 'cloud',
        name: 'Cloud'
    }
];

const rootPathNewIsValid = ref(false);

const ssh_key_path: any = settingsStore.settings.find((setting: any) => setting.key == 'ssh_key_path');

const formValues = ref({
    projectName: "",
    projectMachineName: "",
    name: "",
    machine_name: "",
    project_id: null,
    type: "desktop",
    rootNew: "",
    appRootNew: "",
    rootImport: "",
    appRootImport: "",
    host: "",
    user: "",
    ssh_key_path: ssh_key_path && ssh_key_path.value ? ssh_key_path.value : "",
    uri: "",
    drush_path: "",
    production_mode: 0
});

const infrastructurePayload = ref({
    environment_id: 0,
    file_path: "",
    machine_name: "",
    services: {
        adminer: false,
        mail: false
    }
});

const formRules = {
    projectName: {
        required: requiredIf(function (): boolean {
            return typeof props.onlyEnvironment == "undefined";
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    projectMachineName: {
        required: requiredIf(function (): boolean {
            return props.onlyEnvironment === false;
        }),
        $autoDirty: true
    },
    name: {
        required: requiredIf(function (): boolean {
            return defaultEnvironment.value === true;
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    rootNew: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && selectedTab.value == 'new' && formValues.value.type == 'desktop';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    appRootNew: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && selectedTab.value == 'new' && formValues.value.type == 'desktop';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        checkFolderIsNotEmpty: helpers.withMessage('Folder is not empty.', function () {
            // This check will be executed only when we are in desktop -> new. So we return "true" in the case
            // of type = cloud and when type is "desktop", but the tab is "import". When we return true the validation is skipped
            return defaultEnvironment.value == false || (formValues.value.type == 'cloud' || (formValues.value.type == 'desktop' && selectedTab.value == 'import')) ? true : rootPathNewIsValid.value;
            // return defaultEnvironment.value == false;
        }),
        $autoDirty: true
    },
    rootImport: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && selectedTab.value == 'import';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    appRootImport: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && selectedTab.value == 'import';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    host: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    user: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    uri: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    ssh_key_path: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    drush_path: {
        required: requiredIf(function () {
            return defaultEnvironment.value == true && formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
}

const $formValidation = useVuelidate(formRules, formValues);

const defaultEnvironment = ref(true);

async function onSave() {

    // Shows the loader
    applicationStore.setLoader(true, 'Started the creation of the application', 'loading');

    let createdProject;

    // First check if the form is only for the environment
    if (!props.onlyEnvironment) {

        // Because is not only for environment, it needs to create
        // the project first
        const payloadProject = {
            name: formValues.value.projectName,
            machine_name: formValues.value.projectMachineName,
            group_id: selectedGroup.value.id
        };

        // Creates project in the database
        createdProject = await projectStore.save(payloadProject);

    } else {

        // In case the form is only for the creation of the environment, we will need to use 
        // the 'projectId' props in order to load the project from the store
        createdProject = projectStore.getProjects.find((project: any) => project.id == props.projectId);
    }

    // Checks if the default environment needs to be created
    if (defaultEnvironment.value) {

        // Adds the project id reference to the environment payload
        formValues.value.project_id = createdProject.id;

        if (formValues.value.type == "desktop") {
            formValues.value.uri = 'https://' + formValues.value.machine_name + '.' + createdProject.machine_name + '.drt.localhost';
            formValues.value.host = formValues.value.machine_name + '.' + createdProject.machine_name + '.drt.localhost';
        }

        const selectedRoot = (selectedTab.value == 'new' && formValues.value.type != 'cloud') ? formValues.value.rootNew : formValues.value.rootImport;

        const selectedAppRoot = (selectedTab.value == 'new' && formValues.value.type != 'cloud') ? formValues.value.appRootNew : formValues.value.appRootImport;

        // Parses environment payload
        // const payloadEnvironment = toRaw(formValues.value);
        const payloadEnvironment = {
            name: formValues.value.name,
            machine_name: formValues.value.machine_name,
            project_id: formValues.value.project_id,
            type: formValues.value.type,
            root: selectedRoot,
            app_root: selectedAppRoot,
            host: formValues.value.host,
            user: formValues.value.user,
            ssh_key_path: formValues.value.ssh_key_path ? formValues.value.ssh_key_path : "",
            uri: formValues.value.uri,
            drush_path: formValues.value.drush_path,
            production_mode: formValues.value.production_mode,
        };

        applicationStore.setLoader(true, 'Started the creation of the environment');

        // Creates environment in the database
        const createdEnvironment = await environmentStore.save(payloadEnvironment);

        // If the environment is desktop, we will need to create 
        if (formValues.value.type == 'desktop') {

            // infrastructure machine name environment_machine_name + project_machine_name
            const infrastructureMachineName = createdEnvironment.machine_name + "." + createdProject.machine_name;

            const payloadInfrastructure = toRaw(infrastructurePayload.value);

            payloadInfrastructure.environment_id = createdEnvironment.id;
            payloadInfrastructure.file_path = '';
            payloadInfrastructure.machine_name = infrastructureMachineName;

            applicationStore.setLoader(true, 'Started the creation of the infrastructure');

            // Creates and build infrastructure, then saves information
            // in the database
            await infrastructureStore.save(payloadInfrastructure, selectedAppRoot);

            // If the installation is new, we have download the Drupal 
            // files using Composer
            if (selectedTab.value == 'new') {

                // Updates loader description
                applicationStore.setLoader(true, 'Downloading Drupal');

                // First download the Drupal project
                const commandComposer = `COMPOSER_ALLOW_SUPERUSER=1 composer create-project drupal/recommended-project .`;
                const resultComposer = await window.backendAPI.runCommand(commandComposer, toRaw(createdProject), toRaw(createdEnvironment));

                if (resultComposer) {
                    console.log('Drupal installed via Composer.');
                } else {
                    console.log('Problems install Drupal via Composer.');
                }
            }

            // Install Drush
            const commandDrush = "COMPOSER_ALLOW_SUPERUSER=1 composer require drush/drush";
            applicationStore.setLoader(true, 'Installing Drush');
            const resultDrush = await window.backendAPI.runCommand(commandDrush, toRaw(createdProject), toRaw(createdEnvironment));
            if (resultDrush) {
                console.log('Drush installed sucessfully.');
            } else {
                console.log('Problems installing Drush.');
            }

            applicationStore.setLoader(true, 'Updating the settings file owner');
            // Change default.settings.php owner
            // const commandOwner = "chown www-data:www-data /opt/drupal/web/sites/default/default.settings.php";
            const commandOwner = "chown -R www-data:www-data /opt/drupal";
            const resultOwner = await window.backendAPI.runCommand(commandOwner, toRaw(createdProject), toRaw(createdEnvironment));
            if (resultOwner) {
                console.log('Owner update.');
            } else {
                console.log('Problems updating owner.');
            }
        }
    }

    // Hides the loader
    applicationStore.setLoader(false);
}

const dialogIsOpen = ref(false);

async function openDialog() {

    // This avoids open multiple windows when clicked
    // several times
    if (!dialogIsOpen.value) {

        dialogIsOpen.value = true;

        // Gets the result of the file ui prompt
        const result = await window.backendAPI.openDialog('directory');
        if (!result.canceled) {

            const selectedPath = result.filePaths[0];

            const selectedPathIsEmpty = await window.backendAPI.checkFolderIsEmpty(selectedPath);

            if (selectedTab.value == 'new') {
                formValues.value.appRootNew = selectedPath;
                formValues.value.rootNew = await window.backendAPI.pathJoin([selectedPath, "web"]);

                if (selectedPathIsEmpty) {
                    rootPathNewIsValid.value = true;
                } else {
                    rootPathNewIsValid.value = false;
                }

            } else {
                formValues.value.appRootImport = selectedPath;
                formValues.value.rootImport = await window.backendAPI.pathJoin([selectedPath, "web"]);
            }
        }
        dialogIsOpen.value = false;
    }
}

// ------------------------------------
// Watchers
// ------------------------------------

watch(() => formValues.value.projectName, (newVal) => {
    formValues.value.projectMachineName = _.kebabCase(newVal);
});

watch(() => formValues.value.name, (newVal) => {
    formValues.value.machine_name = _.kebabCase(newVal);
});

watch($formValidation, (value) => {
    if (value.$invalid === true) {
        emit('update:form-validation', false);
    } else {
        emit('update:form-validation', true);
    }
});

const selectedGroup = ref();

onMounted(async () => {
    // await groupStore.load();
    selectedGroup.value = groupStore.getGroups[0];
});

</script>

<template>
    <template v-if="!props.onlyEnvironment">
        <Input label="Application Name" v-model="formValues.projectName"
            :message="`Machine name: ` + formValues.projectMachineName" :validator="$formValidation.projectName" />
        <Select label="Group:" :items="groupStore.getGroups" v-model:selected="selectedGroup" :all="false" />
        <div>
            <Checkbox label="Create default environment" v-model="defaultEnvironment" class="mb-4" />
        </div>
    </template>

    <div v-if="defaultEnvironment">

        <!-- Environment name -->
        <Input label="Environment Name" v-model="formValues.name" :message="`Machine name: ` + formValues.machine_name"
            :validator="$formValidation.name" class="mb-4" />

        <Checkbox label="Enable production mode" v-model="formValues.production_mode" class="mb-4" />

        <!-- Chooses desktop or cloud -->
        <Radio label="Environment type" v-model="formValues.type" :options="environmentTypeOptions" class="mb-4" />

        <Card color="bg-slate-100" colorDark="dark:bg-slate-900" classes="shadow-none">
            <template #content>

                <!-- Shows desktop form -->
                <div v-if="formValues.type == 'desktop'">
                    <div class="mb-4">
                        <div class="font-medium mb-1">Services</div>
                        <Checkbox label="Adminer" v-model="infrastructurePayload.services.adminer" />
                        <Checkbox label="Mailpit" v-model="infrastructurePayload.services.mail" />
                    </div>
                    <Tabs :options="tabs" v-model="selectedTab">
                        <template #new>
                            <Input @click="openDialog" label="Application's root path"
                                message="Select the new Drupal application path. It needs to be empty."
                                v-model="formValues.appRootNew" :validator="$formValidation.appRootNew"
                                :readonly='true' />
                            <Input message="Read only. Directory for the web root folder" label="Web root path"
                                v-model="formValues.rootNew" :validator="$formValidation.rootNew" :readonly='true' />
                        </template>
                        <template #import>
                            <Input @click="openDialog" label="Path of the application to be imported"
                                message="Select the Drupal root folder you want to import."
                                v-model="formValues.appRootImport" :validator="$formValidation.appRootImport"
                                :readonly='true' />
                            <Input message="Directory for the web root folder" label="Web root path"
                                v-model="formValues.rootImport" :validator="$formValidation.rootImport" />
                        </template>
                    </Tabs>
                </div>

                <!-- Shows cloud form -->
                <div v-if="formValues.type == 'cloud'">
                    <Input label="Uri" v-model="formValues.uri" :validator="$formValidation.uri"
                        message="E.g. https://www.example.com" />
                    <Input label="Host" v-model="formValues.host" :validator="$formValidation.host"
                        message="E.g. www.example.com, 192.168.1.1, etc" />
                    <Input label="User" v-model="formValues.user" :validator="$formValidation.user"
                        message="E.g. root, admin, etc" />
                    <Input label="Ssh key path" v-model="formValues.ssh_key_path" message="E.g. /Users/user/.ssh/id_rsa"
                        :validator="$formValidation.ssh_key_path" />
                    <Input message="E.g. /var/www/html" label="Application's root directory"
                        v-model="formValues.appRootImport" :validator="$formValidation.appRootImport" />
                    <Input message="E.g. /var/www/html/web" label="Web root directory" v-model="formValues.rootImport"
                        :validator="$formValidation.rootImport" />
                    <Input message="E.g. /var/www/html/vendor/drush/drush/" label="Drush directory"
                        v-model="formValues.drush_path" :validator="$formValidation.drush_path" />
                </div>
            </template>
        </Card>
    </div>
</template>
<style></style>