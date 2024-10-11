<script lang="ts" setup>
import { ref, watch, toRaw, onMounted } from 'vue';
import _ from 'lodash';
import { useVuelidate } from '@vuelidate/core'
import { requiredIf, minLength, maxLength, helpers } from '@vuelidate/validators'
import useInternationalization from '../../composables/translation';
import useClipboard from '../../composables/clipboard'
import { customAlphabet } from 'nanoid';

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
import Snackbar from './../Snackbar.vue';

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
        name: useInternationalization('labels.new'),
    },
    {
        key: 'import',
        name: useInternationalization('labels.import'),
    },
];

const selectedTab = ref("new");

const environmentTypeOptions = [
    {
        key: 'desktop',
        name: useInternationalization('labels.desktop'),
    },
    {
        key: 'cloud',
        name: useInternationalization('labels.cloud'),
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
    drupalAutoInstall: true,
    drupalUser: 'admin',
    drupalPass: '',
    drupalSiteName: '',
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
    drupalUser: {
        required: requiredIf(function () {
            return formValues.value.drupalAutoInstall == true;
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    drupalPass: {
        required: requiredIf(function () {
            return formValues.value.drupalAutoInstall == true;
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    drupalSiteName: {
        required: requiredIf(function () {
            return formValues.value.drupalAutoInstall == true;
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

const snackbarValue = ref("");
const showSnackbar = ref(false);

async function copyToClipboard() {
    useClipboard(formValues.value.drupalPass);
    snackbarValue.value = useInternationalization('snackbars.password_copied').value
    showSnackbar.value = true;
}

async function onSave() {

    // Shows the loader
    applicationStore.setLoader(true, useInternationalization('loaders.creating_project').value, 'loading');

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

        applicationStore.setLoader(true, useInternationalization('loaders.creating_environment').value);

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

            applicationStore.setLoader(true, useInternationalization('loaders.creating_infrastructure').value);

            // Creates and build infrastructure, then saves information
            // in the database
            await infrastructureStore.save(payloadInfrastructure, selectedAppRoot);

            // If the installation is new, we have download the Drupal 
            // files using Composer
            if (selectedTab.value == 'new') {

                // Updates loader description
                applicationStore.setLoader(true, useInternationalization('loaders.downloading_drupal').value);

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
            applicationStore.setLoader(true, useInternationalization('loaders.installing_drush').value);
            const resultDrush = await window.backendAPI.runCommand(commandDrush, toRaw(createdProject), toRaw(createdEnvironment));
            if (resultDrush) {
                console.log('Drush installed sucessfully.');
            } else {
                console.log('Problems installing Drush.');
            }

            if (formValues.value.drupalAutoInstall) {

                const autoInstallCommand = `drush site:install --db-url='mysql://drupal:drupal@database/drupal' --account-name='${formValues.value.drupalUser}' --account-pass='${formValues.value.drupalPass}' --site-name='${formValues.value.drupalSiteName}'`;

                applicationStore.setLoader(true, "AUTO INSTALLING");
                const resultDrush = await window.backendAPI.runCommand(autoInstallCommand, toRaw(createdProject), toRaw(createdEnvironment));
                if (resultDrush) {
                    console.log('AUTOINSTALL SUCCESS.');
                } else {
                    console.log('AUTOINSTALL ERROR.');
                }
            }

            applicationStore.setLoader(true, useInternationalization('loaders.files_owner').value);
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

function generatePassword() {
    const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()', 8);
    formValues.value.drupalPass = nanoid();
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

watch(() => formValues.value.projectName, (newVal) => {
    formValues.value.drupalSiteName = newVal;
});

const selectedGroup = ref();

onMounted(async () => {
    selectedGroup.value = groupStore.getGroups[0];
    generatePassword();

    if (props.onlyEnvironment) {
        const createdProject = projectStore.getProjects.find((project: any) => project.id == props.projectId);
        formValues.value.drupalSiteName = createdProject.name;
    }
});

</script>

<template>

    <Snackbar :content="snackbarValue" v-model:show="showSnackbar" />

    <template v-if="!props.onlyEnvironment">
        <Input :label="useInternationalization('labels.application_name')" v-model="formValues.projectName"
            :message="useInternationalization('labels.machine_name').value + `: ` + formValues.projectMachineName"
            :validator="$formValidation.projectName" />
        <Select :label="useInternationalization('labels.group')" :items="groupStore.getGroups"
            v-model:selected="selectedGroup" :all="false" />
        <div>
            <Checkbox :label="useInternationalization('labels.create_default_environment')" v-model="defaultEnvironment"
                class="mb-4" />
        </div>
    </template>

    <div v-if="defaultEnvironment">

        <!-- Environment name -->
        <Input :label="useInternationalization('labels.environment_name')" v-model="formValues.name"
            :message="useInternationalization('labels.machine_name').value + `: ` + formValues.machine_name"
            :validator="$formValidation.name" class="mb-4" />

        <Checkbox :label="useInternationalization('labels.enable_production_mode')" v-model="formValues.production_mode"
            class="mb-4" />

        <!-- Chooses desktop or cloud -->
        <Radio :label="useInternationalization('labels.environment_type')" v-model="formValues.type"
            :options="environmentTypeOptions" class="mb-4" />

        <Card color="bg-slate-100" colorDark="dark:bg-slate-900" classes="shadow-none">
            <template #content>

                <!-- Shows desktop form -->
                <div v-if="formValues.type == 'desktop'">
                    <Tabs :options="tabs" v-model="selectedTab">
                        <template #new>

                            <Checkbox :label="useInternationalization('labels.drupal_auto_install')"
                                v-model="formValues.drupalAutoInstall" class="mb-4" />

                            <div v-if="formValues.drupalAutoInstall">
                                <Card class="mb-4" color="bg-slate-200" colorDark="dark:bg-[#0b112a]"
                                    classes="shadow-none">
                                    <template #content>
                                        <Input message="" :label="useInternationalization('labels.user')"
                                            v-model="formValues.drupalUser" :validator="$formValidation.drupalUser" />

                                        <Input message="" :label="useInternationalization('labels.password')"
                                            type="password" @onPasswordRefresh="generatePassword"
                                            @onCopyToClipboard="copyToClipboard" :copy="true"
                                            v-model="formValues.drupalPass" :validator="$formValidation.drupalPass" />

                                        <Input message="" :label="useInternationalization('labels.site_name')"
                                            v-model="formValues.drupalSiteName"
                                            :validator="$formValidation.drupalSiteName" />
                                    </template>
                                </Card>
                            </div>

                            <Input @click="openDialog" :label="useInternationalization('labels.applications_root_path')"
                                :message="useInternationalization('messages.application_path')"
                                v-model="formValues.appRootNew" :validator="$formValidation.appRootNew"
                                :readonly='true' />
                            <Input :message="useInternationalization('messages.webroot_path')"
                                :label="useInternationalization('labels.webroot_path')" v-model="formValues.rootNew"
                                :validator="$formValidation.rootNew" :readonly='true' />

                        </template>
                        <template #import>
                            <Input @click="openDialog"
                                :label="useInternationalization('labels.imported_applications_path')"
                                :message="useInternationalization('messages.import_application_root')"
                                v-model="formValues.appRootImport" :validator="$formValidation.appRootImport"
                                :readonly='true' />
                            <Input :message="useInternationalization('messages.webroot_path')"
                                :label="useInternationalization('labels.webroot_path')" v-model="formValues.rootImport"
                                :validator="$formValidation.rootImport" />
                        </template>
                    </Tabs>
                    <div class="mb-4">
                        <div class="font-medium mb-1">{{ useInternationalization('labels.services') }}</div>
                        <Checkbox label="Adminer" v-model="infrastructurePayload.services.adminer" />
                        <Checkbox label="Mailpit" v-model="infrastructurePayload.services.mail" />
                    </div>
                </div>

                <!-- Shows cloud form -->
                <div v-if="formValues.type == 'cloud'">
                    <Input :label="useInternationalization('labels.uri')" v-model="formValues.uri"
                        :validator="$formValidation.uri"
                        :message="useInternationalization('labels.example').value + ` https://www.example.com`" />
                    <Input :label="useInternationalization('labels.host')" v-model="formValues.host"
                        :validator="$formValidation.host"
                        :message="useInternationalization('labels.example').value + ` www.example.com, 192.168.1.1, etc`" />
                    <Input :label="useInternationalization('labels.user')" v-model="formValues.user"
                        :validator="$formValidation.user"
                        :message="useInternationalization('labels.example').value + ` root, admin, etc`" />
                    <Input :label="useInternationalization('labels.ssh_key_path')" v-model="formValues.ssh_key_path"
                        :message="useInternationalization('labels.example').value + ` /Users/user/.ssh/id_rsa`"
                        :validator="$formValidation.ssh_key_path" />
                    <Input :message="useInternationalization('labels.example').value + ` /var/www/html`"
                        :label="useInternationalization('labels.applications_root_path')"
                        v-model="formValues.appRootImport" :validator="$formValidation.appRootImport" />
                    <Input :message="useInternationalization('labels.example').value + ` /var/www/html/web`"
                        :label="useInternationalization('labels.webroot_path')" v-model="formValues.rootImport"
                        :validator="$formValidation.rootImport" />
                    <Input
                        :message="useInternationalization('labels.example').value + ` /var/www/html/vendor/drush/drush/`"
                        :label="useInternationalization('labels.drush_path')" v-model="formValues.drush_path"
                        :validator="$formValidation.drush_path" />
                </div>
            </template>
        </Card>
    </div>
</template>
<style></style>