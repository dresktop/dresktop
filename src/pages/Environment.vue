<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRaw, computed } from 'vue';
import { useRoute } from 'vue-router';
import useInternationalization from '../composables/translation';

// Stores
import { useEnvironmentStore } from './../store/environment';
import { useInfrastructureStore } from './../store/infrastructure';
import { useProjectStore } from './../store/project';

// Modals
import EditEnvironmentModal from './../components/modals/EditEnvironmentModal.vue';

// Components
import Page from './../components/Page.vue'
import Button from './../components/Button.vue';
import Icon from './../components/Icon.vue';
import Tabs from './../components/Tabs.vue';

// Environment sections
import EnvironmentDashboard from '../components/environment/Dashboard.vue'
import EnvironmentPatches from './../components/environment/Patches.vue'

// // Composables
// import useUriBrowser from '../composables/uriBrowser'

const environmentStore = useEnvironmentStore();
const infrastructureStore = useInfrastructureStore();
const projectStore = useProjectStore();

const route = useRoute();
const servicesStatus = ref();

const tabs = [
    {
        key: 'dashboard',
        name: useInternationalization('labels.dashboard'),
    },
    {
        key: 'patches',
        name: useInternationalization('labels.patches'),
    },
];

const selectedTab = ref("dashboard");

const computedEnvironment = computed(function () {
    const result = environmentStore.getEnvironments.find(function (environment: any) {
        return environment.id == Number(route.params.eid);
    });

    return result;
});

// Modals
const showEditEnvironmentModal = ref(false);

const project = ref();
const environment = ref();
const infrastructureStatus = ref();
const intervalInfrastructure = ref();

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
    }
}

async function onEditEnvironment() {
    showEditEnvironmentModal.value = true;
}

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

    // Executes only if the environment has infrastructure
    if (infrastructure.value) {

        checkInfrastructure();

        intervalInfrastructure.value = setInterval(() => {
            checkInfrastructure()
        }, CHECK_INFRASTRUCTURE_INTERVAL);
    }
});

</script>

<template>

    <!-- Edit Environment Modal-->
    <EditEnvironmentModal v-model:show="showEditEnvironmentModal" :environment="environment" />

    <Page v-if="project && computedEnvironment">
        <template #pretitle>
            <router-link to="/">
                <Button :text="useInternationalization('buttons.applications')" type="tertiary" icon="projects"
                    size="sm" class="
                    w-fit 
                    mb-0
                    text-slate-700 
                    dark:text-white" />
            </router-link>
        </template>
        <template #title>
            <div v-if="environment" class="flex flex-row items-center">
                <span>
                    <Icon :name="computedEnvironment.type == 'cloud' ? 'cloud' : 'desktop'" class="h-7 w-7 mr-2" />
                </span>
                <span>
                    {{ computedEnvironment.name }}
                </span>
            </div>
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
            <div class="flex flex-col w-full h-full">
                <Tabs :options="tabs" v-model="selectedTab" spacing="2">
                    <template #dashboard>
                        <EnvironmentDashboard :project="project" :environment="computedEnvironment"
                            :infrastructure="infrastructure" :servicesStatus="servicesStatus"
                            :infrastructureStatus="infrastructureStatus" />
                    </template>
                    <template #patches>
                        <EnvironmentPatches :project="project" :environment="computedEnvironment" />
                    </template>
                </Tabs>
            </div>
        </template>
    </Page>
</template>