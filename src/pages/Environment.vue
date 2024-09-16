<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRaw, computed } from 'vue';
import { useRoute } from 'vue-router';
import useInternationalization from '../composables/translation';

// Stores
import { useEnvironmentStore } from './../store/environment';
import { useInfrastructureStore } from './../store/infrastructure';
import { useProjectStore } from './../store/project';
import { useLoggerStore } from './../store/logger';

// Modals
import DeployModal from './../components/modals/DeployModal.vue';
import ScriptModal from './../components/modals/ScriptModal.vue';
import PHPModal from './../components/modals/PHPModal.vue';
import ExportDatabaseModal from './../components/modals/ExportDatabaseModal.vue';
import ImportDatabaseModal from './../components/modals/ImportDatabaseModal.vue';
import SyncDatabaseModal from './../components/modals/SyncDatabaseModal.vue';
import SyncFilesModal from './../components/modals/SyncFilesModal.vue';
import EditEnvironmentModal from './../components/modals/EditEnvironmentModal.vue';
import SwitchCodeModal from './../components/modals/SwitchCodeModal.vue';

// Components
import Page from './../components/Page.vue'
import Button from './../components/Button.vue';
import Checkbox from './../components/form/Checkbox.vue';
import Card from './../components/Card.vue';
import Icon from './../components/Icon.vue';
import Tooltip from './../components/Tooltip.vue';
import EnvironmentMenu from './../components/environment/Menu.vue';
import ItemLog from './../components/log/ItemLog.vue';

// Composables
import useUriBrowser from '../composables/uriBrowser'
import useBackend from '../composables/backend';
import useLogger from '../composables/logger';

const { checkRsyncIsActive } = useBackend();
const { saveLog, outputLog, updateLogStatus, initLog } = useLogger();

const environmentStore = useEnvironmentStore();
const infrastructureStore = useInfrastructureStore();
const projectStore = useProjectStore();
const loggerStore = useLoggerStore();

const route = useRoute();

const servicesStatus = ref();

const computedEnvironment = computed(function () {
    const result = environmentStore.getEnvironments.find(function (environment: any) {
        return environment.id == Number(route.params.eid);
    });

    return result;
});

const servicesNames = ref({
    git: {
        name: 'Git',
        checked: true,
        actions: [
            {
                icon: 'switch',
                type: "link",
                label: useInternationalization('buttons.switch'),
                onClick: function () {
                    showSwitchCodeModal.value = true;
                }
            }
        ]
    },
    database: {
        name: useInternationalization('labels.database'),
        checked: true,
        actions: [
            {
                icon: 'importDatabase',
                type: "link",
                label: useInternationalization('buttons.import'),
                productionMode: computed(() => computedEnvironment.value.production_mode),
                onClick: function () {
                    showImportDatabaseModal.value = true;
                }
            },
            {
                icon: 'exportDatabase',
                type: "link",
                label: useInternationalization('buttons.export'),
                onClick: function () {
                    showExportDatabseModal.value = true;
                }
            },
            {
                icon: 'sync',
                type: "link",
                label: useInternationalization('buttons.sync'),
                productionMode: computed(() => computedEnvironment.value.production_mode),
                onClick: function () {
                    showSyncDatabseModal.value = true;
                }
            },
        ]
    },
    files: {
        name: useInternationalization('labels.files'),
        checked: true,
        actions: [
            {
                icon: 'sync',
                type: "link",
                label: useInternationalization('buttons.sync'),
                productionMode: computed(() => computedEnvironment.value.production_mode),
                onClick: function () {
                    showSyncFilesModal.value = true;
                }
            },
        ]
    },
    adminer: {
        name: 'Adminer',
        checked: ref(false),
        actions: [
            {
                icon: 'externalLink',
                type: "link",
                label: useInternationalization('buttons.open').value + ' Adminer',
                onClick: function (host: string) {
                    useUriBrowser('https://' + 'adminer.' + host)
                }
            }
        ]
    },
    mail: {
        name: 'Mailpit',
        checked: ref(false),
        actions: [
            {
                icon: 'externalLink',
                type: "link",
                label: useInternationalization('buttons.open').value + ' Mailpit',
                onClick: function (host: string) {
                    useUriBrowser('https://' + 'mail.' + host)
                }
            }
        ]
    },
});

// Modals
const showScriptModal = ref(false);
const showPHPModal = ref(false);
const showExportDatabseModal = ref(false);
const showImportDatabaseModal = ref(false);
const showSyncDatabseModal = ref(false);
const showSyncFilesModal = ref(false);
const showEditEnvironmentModal = ref(false);
const showSwitchCodeModal = ref(false);
const showDeployModal = ref(false);

const project = ref();
const environment = ref();
const infrastructureStatus = ref();
const intervalInfrastructure = ref();
const git = ref({
    initialCheck: false,
    enabled: false,
    current: ''
});
const rsync = ref({
    enabled: false,
});

const infrastructure = computed(function () {
    return infrastructureStore.getInfrastructures.find((infrastructure: any) => infrastructure.environment_id == Number(route.params.eid));
});

const CHECK_INFRASTRUCTURE_INTERVAL = 5000;

async function onPowerClick(flag: boolean) {
    await window.backendAPI.powerInfrastructure(infrastructure.value.file_path, flag);
}

async function checkInfrastructure() {

    // Gets the infrastructure status
    servicesStatus.value = await window.backendAPI.statusInfrastructure(infrastructure.value.file_path);

    // Checks if exists at least one service.
    if (servicesStatus.value.length) {

        // Gets the status only for Drupal, it will be used for the power on and off
        const drupalStatus = servicesStatus.value.find((service: any) => service.Service == 'drupal');

        infrastructureStatus.value = drupalStatus.State;

        // Then loops over all services status
        for (let i = 0; i < servicesStatus.value.length; i++) {

            // Checks the array value is of type service (it also returns other values)
            if (typeof servicesStatus.value[i].Service !== 'undefined') {

                // Checks the service returned by the system matches some of the services names in the component
                // @ts-ignore
                if (typeof servicesNames.value[servicesStatus.value[i].Service] !== 'undefined') {

                    // If the search matches, the checked status values will be updated
                    // @ts-ignore
                    servicesNames.value[servicesStatus.value[i].Service].checked = (servicesStatus.value[i].State == 'running' ? true : false);
                }
            }
        }
    }
}

async function syncFiles(environmentFrom: any) {
    const identifier = await saveLog("Sync files", { message: "" }, computedEnvironment.value.id);
    const result = await window.backendAPI.syncFiles(toRaw(computedEnvironment.value), toRaw(environmentFrom), identifier);
    await updateLogStatus(identifier, result);

    // The user and group permissions will be updated because rsync updates the permissions to 48:48
    if (result.success) {

        // In desktop we need to update the permissions of the files in the Drupal container 
        // because they are updated by Rsync container
        if (computedEnvironment.value.type == 'desktop') {

            // Gets the files folder path
            const filesPath = "/opt/drupal/web/sites/default/files";

            // After the rsync, files ownership is changed, so we have to change it back to the owner 
            // of the files folder
            const commandOwner = `chown -R www-data:www-data ${filesPath}`;

            // Runs the files owner update
            await window.backendAPI.runCommand(commandOwner, toRaw(project.value), toRaw(computedEnvironment.value));
        }

        /*
        // Gets the files folder path
        const filesPath = await window.backendAPI.pathJoin([computedEnvironment.value.root, "sites/default/files"]);

        // After the rsync, files ownership is changed, so we have to change it back to the owner 
        // of the files folder
        const commandOwner = `chown -R $(stat -c '%u:%g' ${filesPath}) ${filesPath}`;

        // Runs the files owner update
        await window.backendAPI.runCommand(commandOwner, toRaw(project.value), toRaw(computedEnvironment.value));
        */
    }
}

async function deploy(payload: any) {

    const identifier = await saveLog(useInternationalization('labels.deploy').value, { message: "" }, computedEnvironment.value.id);
    const result = await window.backendAPI.deploy(toRaw(project.value), toRaw(computedEnvironment.value), payload, identifier);
    await updateLogStatus(identifier, result);
    await checkGit();
}

async function syncDatabase(environmentFrom: any) {
    const identifier = await saveLog(useInternationalization('labels.sync_database').value, { message: "" }, computedEnvironment.value.id);
    const result = await window.backendAPI.syncDatabase(toRaw(project.value), toRaw(computedEnvironment.value), toRaw(environmentFrom), identifier);
    await updateLogStatus(identifier, result);
}

async function importDatabase(path: string) {
    const identifier = await saveLog(useInternationalization('labels.import_datatabase').value, { message: "" }, computedEnvironment.value.id);
    const result = await window.backendAPI.importDatabase(toRaw(project.value), toRaw(computedEnvironment.value), path, identifier);
    await updateLogStatus(identifier, result);
}

async function exportDatabase(path: string) {
    const identifier = await saveLog(useInternationalization('labels.export_datatabase').value, { message: "" }, computedEnvironment.value.id);
    const result = await window.backendAPI.exportDatabase(toRaw(project.value), toRaw(computedEnvironment.value), path, identifier);
    await updateLogStatus(identifier, result);
}

async function switchCode(branchName: any) {
    const root = toRaw(computedEnvironment.value).root;
    const identifier = await saveLog(useInternationalization('labels.switch_code').value, { message: "" }, computedEnvironment.value.id);
    const result = await window.backendAPI.runOS(`cd ${root} && git checkout ${branchName}`, toRaw(computedEnvironment.value), identifier);
    await updateLogStatus(identifier, result);

    if (result.success) {
        git.value.current = branchName;
    } else {
        console.log("Error: problems ");
    }
}

async function runCommand(command: string) {
    const identifier = await saveLog(command, { message: "" }, computedEnvironment.value.id);
    const result = await window.backendAPI.runCommand(command, toRaw(project.value), toRaw(computedEnvironment.value), identifier);
    await updateLogStatus(identifier, result);
}

async function onServiceCheck(service: string, status: any) {
    await window.backendAPI.activateService(toRaw(project.value), toRaw(computedEnvironment.value), service, status, infrastructure.value.file_path);
    await window.backendAPI.powerInfrastructure(infrastructure.value.file_path, true);
}

async function onEditEnvironment() {
    showEditEnvironmentModal.value = true;
}

/**
 * 
 */
async function checkGit() {

    let result = await window.backendAPI.runOS(`cd ${computedEnvironment.value.root} && git symbolic-ref --short -q HEAD || git describe --tags --exact-match`, toRaw(computedEnvironment.value));

    if (result.success) {
        git.value.enabled = true;
        git.value.current = result.message
    } else {
        git.value.enabled = false;
        git.value.current = "";
    }

    git.value.initialCheck = true;
}

// ---------------------------------------------
// Events
// ---------------------------------------------

async function onMenuClick(action: any) {
    switch (action) {
        case 'script':
            showScriptModal.value = true
            break;
        case 'php':
            showPHPModal.value = true
            break;
        case 'clear':
            outputLog.value.splice(0);
            loggerStore.delete(computedEnvironment.value.id);
            break;
        case 'cr':
            runCommand('drush cr');
            break;
        case 'cron':
            runCommand('drush cron -v');
            break;
        case 'importConfig':
            runCommand('drush config:import');
            break;
        case 'exportConfig':
            runCommand('drush config:export');
            break;
        case 'deploy':
            showDeployModal.value = true
            break;
        case 'update':
            runCommand('COMPOSER_ALLOW_SUPERUSER=1 composer update "drupal/core-*" --with-all-dependencies && drush updatedb && drush cache:rebuild');
            break;
    }
}

const projectEnvironments = computed(function () {
    if (project.value && computedEnvironment.value) {
        return environmentStore.getEnvironments
            .filter(function (env: any) {
                return (env.project_id == project.value.id) && (env.id != computedEnvironment.value.id);
            })
        // .map(function (env: any) {
        //     return { key: env.id, name: env.name };
        // });
    }
});

// ---------------------------------------------
// Lifecycle
// ---------------------------------------------

onUnmounted(() => {
    clearInterval(intervalInfrastructure.value);
});

onMounted(async () => {

    // Loads environment information
    environment.value = await environmentStore.loadOne(Number(route.params.eid));

    // Loads the environment's project in order to use the project's machine name
    project.value = projectStore.getProjects.find((project: any) => project.id == environment.value.project_id);

    await initLog(computedEnvironment.value.id);

    // Executes only if the environment has infrastructure
    if (infrastructure.value) {

        checkInfrastructure();

        intervalInfrastructure.value = setInterval(() => {
            checkInfrastructure()
        }, CHECK_INFRASTRUCTURE_INTERVAL);
    }

    await checkGit();

    rsync.value.enabled = await checkRsyncIsActive(toRaw(project.value), toRaw(computedEnvironment.value));
});

</script>

<template>

    <!-- Deploy Environment -->
    <DeployModal v-model:show="showDeployModal" :projectEnvironments="projectEnvironments"
        :currentEnvironment="environment" @onDeploy="deploy" />

    <!-- Modal New Task -->
    <ScriptModal v-model:show="showScriptModal" @onRunCommand="runCommand" />

    <!-- Modal New Task -->
    <PHPModal v-model:show="showPHPModal" @onRunCommand="runCommand" />

    <!-- Modal Export Database -->
    <ExportDatabaseModal v-model:show="showExportDatabseModal" @onExportDatabase="exportDatabase" />

    <!-- Modal Import Database -->
    <ImportDatabaseModal v-model:show="showImportDatabaseModal" @onImportDatabase="importDatabase" />

    <!-- Modal Edit Environment -->
    <EditEnvironmentModal v-model:show="showEditEnvironmentModal" :environment="environment" />

    <!-- Modal Sync Database -->
    <SyncDatabaseModal v-model:show="showSyncDatabseModal" :projectEnvironments="projectEnvironments"
        :currentEnvironment="environment" @onSyncDatabase="syncDatabase" />

    <!-- Modal Sync Files -->
    <SyncFilesModal v-model:show="showSyncFilesModal" :projectEnvironments="projectEnvironments"
        :currentEnvironment="environment" @onSyncFiles="syncFiles" />

    <!-- Switch Code -->
    <SwitchCodeModal :currentBranch="git.current" v-model:show="showSwitchCodeModal" @onSwitchCode="switchCode"
        :environment="computedEnvironment" />

    <Page>
        <template #pretitle></template>
        <template #title>
            <div v-if="environment" class="flex flex-row items-center">
                <span>
                    <Icon :name="computedEnvironment.type == 'cloud' ? 'cloud' : 'desktop'" class="h-8 w-8 mr-2" />
                </span>
                <span>
                    {{ computedEnvironment.name }}
                </span>
            </div>
        </template>
        <template #nav>
            <router-link to="/">
                <Button :text="useInternationalization('buttons.applications')" type="tertiary" icon="projects"
                    size="sm" class="
                    w-fit 
                    mb-0
                    text-slate-700 
                    dark:text-white" />
            </router-link>
            <div class="mx-2">|</div>
            <Button v-if="computedEnvironment" @click="useUriBrowser(computedEnvironment.uri)"
                :text="useInternationalization('buttons.open_website')" type="tertiary" icon="externalLink"
                :iconRight="true" size="sm" class="
                w-fit 
                mb-0
                text-slate-700 
                dark:text-white
               " />
        </template>
        <template #menu>
            <div class="flex flex-row space-x-1 items-center">
                <template v-if="infrastructure">
                    <Button v-if="infrastructureStatus == 'running'" @click="onPowerClick(false)"
                        :text="useInternationalization('buttons.powered_on')" type="primary" icon="play"
                        class="w-fit bg-green-600 border-green-600 hover:bg-green-700" />

                    <Button v-if="infrastructureStatus == 'exited'" @click="onPowerClick(true)"
                        :text="useInternationalization('buttons.powered_off')" type="primary" icon="stop"
                        class="w-fit bg-slate-400 border-slate-400 hover:bg-slate-500" />
                </template>
                <Button @click="onEditEnvironment" :text="useInternationalization('buttons.edit')" type="tertiary"
                    icon="edit" class="w-fit" />
            </div>
        </template>
        <template #content>
            <div class="flex flex-col w-full gap-4 h-full">
                <div class="flex flex-row gap-4 h-full">

                    <!-- left -->
                    <div class="flex-1 basis-1/3 h-full">
                        <div class="flex flex-col w-full gap-4 h-full">

                            <!-- Log -->
                            <Card color="bg-slate-800" colorDark="dark:bg-[#040608]" classes="h-full">
                                <template #title>
                                    <span class="text-white">{{ useInternationalization('titles.log') }}</span>
                                </template>
                                <template #menu>
                                    <EnvironmentMenu @onClick="onMenuClick" :gitIsEnabled="git.enabled && git.current"
                                        rsyncIsEnabled="rsync.enabled"
                                        :disabled="infrastructureStatus && (infrastructureStatus != 'running')" />
                                </template>
                                <template #content>
                                    <div class="flex flex-col text-gray-300 gap-4 overflow-y-auto">
                                        <template v-for="(item, _index) in outputLog.slice().reverse()" :key="_index">
                                            <ItemLog :item="item" />
                                        </template>
                                        <div v-if="!outputLog.length" class="p-2"
                                            v-html="useInternationalization('labels.log_welcome').value"></div>
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </div>

                    <!-- right -->
                    <div class="flex flex-col flex-1 max-w-64 gap-4 h-full">
                        <Card class="bg-whitebasis-1/4 overflow-y-auto max-h-32">
                            <template #title>
                                <template v-if="project">
                                    <div class="flex flex-row items-center">
                                        <span>{{ project.name }}</span>
                                        <Tooltip v-if="computedEnvironment.production_mode"
                                            :content="useInternationalization('labels.production_mode').value">
                                            <Icon name="lock" class="h-4 w-4 ml-2" />
                                        </Tooltip>
                                    </div>
                                </template>
                            </template>
                            <template #content>
                                <div class="text-sm">
                                    {{ useInternationalization('labels.on_branch') }}:
                                    <span class="font-bold" v-if="git && !git.initialCheck">checking git...</span>
                                    <span class="font-bold" v-if="git && git.initialCheck && git.current">{{ git.current
                                        }}</span>
                                    <span class="font-bold" v-if="git && git.initialCheck && !git.current">Git not
                                        found</span>
                                </div>
                            </template>
                        </Card>
                        <Card class="basis-3/4 overflow-y-auto grow">
                            <template #title>
                                {{ useInternationalization('labels.services') }}
                            </template>
                            <template #content>
                                <div class="hover:bg-cyan-500/5 p-2">
                                    <template v-for="(_service, serviceIndex) in servicesNames" :key="serviceIndex">
                                        <div v-if="(
                                            (serviceIndex == 'database') ||
                                            (serviceIndex == 'files' && rsync.enabled) ||
                                            (serviceIndex == 'git' && (git.enabled && git.current)) ||
                                            (serviceIndex == 'adminer' && infrastructure) ||
                                            (serviceIndex == 'mail' && infrastructure)
                                        )">

                                            <!-- Sub section name -->
                                            <div class="flex flex-row justify-between items-center mb-3">
                                                <h2 class="font-light uppercase text-sm">
                                                    {{ servicesNames[serviceIndex].name }}
                                                </h2>
                                                <div
                                                    v-if="serviceIndex != 'database' && serviceIndex != 'files' && serviceIndex != 'git'">
                                                    <Tooltip
                                                        :content="useInternationalization('labels.activate').value">
                                                        <Checkbox
                                                            :disabled="infrastructureStatus && (infrastructureStatus != 'running')"
                                                            v-model="servicesNames[serviceIndex].checked"
                                                            @click="onServiceCheck(serviceIndex, !servicesNames[serviceIndex].checked)" />
                                                    </Tooltip>
                                                </div>
                                            </div>

                                            <!-- Sub section options -->
                                            <div class="flex flex-col mb-4">
                                                <template
                                                    v-for="(action, _serviceOptionsIndex) in servicesNames[serviceIndex].actions">
                                                    <!-- @vue-ignore -->
                                                    <Button
                                                        :disabled="(infrastructureStatus && (infrastructureStatus != 'running')) || !servicesNames[serviceIndex].checked || (servicesNames[serviceIndex].actions[_serviceOptionsIndex].productionMode == true)"
                                                        @click="action.onClick(computedEnvironment.host)"
                                                        :text="action.label" type="tertiary" :icon="action.icon" class="
                                                            w-full 
                                                            mb-1
                                                            py-1
                                                          text-slate-700 dark:text-white
                                                          hover:bg-blue-700 hover:text-white" size="sm" />
                                                </template>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
        </template>
    </Page>
</template>