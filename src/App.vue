<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import { promiseTimeout } from '@vueuse/core'
import DefaultLayout from './layouts/DefaultLayout.vue'
import { useApplicationStore } from './store/application';
import { useProjectStore } from './store/project';
import { useSettingsStore } from './store/settings';
import { useInfrastructureStore } from './store/infrastructure';
import Loader from './components/Loader.vue';

const applicationStore = useApplicationStore();
const projectStore = useProjectStore();
const settingsStore = useSettingsStore();
const infrastructureStore = useInfrastructureStore();
const status = ref('loading');
const appStarted = ref(false);
const intervalCheckUpdates = ref();
const CHECK_UPDATES_INTERVAL = 60 * 60 * 1000;

async function checkCaddyIsRunning() {
    applicationStore.setLoader(true, 'Checking Caddy');
    const result = await window.backendAPI.checkCaddy();
    if (!result.success) {
        throw new Error("Caddy is not running and could be not created. <p class='my-3'><a class='p-1 rounded font-bold w-fit hover:bg-blue-400' href='#' onclick='window.backendAPI.reloadApp()'>Try again</a></p>");
    }
}

async function checkNetworkIsRunning() {
    applicationStore.setLoader(true, 'Checking network');
    const result = await window.backendAPI.checkNetwork();
    if (!result.success) {
        throw new Error("Network is not running and could be created. <p class='my-3'><a class='p-1 rounded font-bold w-fit hover:bg-blue-400' href='#' onclick='window.backendAPI.reloadApp()'>Try again</a></p>");
    }
}

async function checkRsyncIsRunning() {
    applicationStore.setLoader(true, 'Checking Rsync');
    const result = await window.backendAPI.checkRsync();
    if (!result.success) {
        throw new Error("Rsync is not running and could be created. <p class='my-3'><a class='p-1 rounded font-bold w-fit hover:bg-blue-400' href='#' onclick='window.backendAPI.reloadApp()'>Try again</a></p>");
    }
}

async function checkDockerIsRunning() {
    applicationStore.setLoader(true, "Checking Docker");
    const result = await window.backendAPI.execDesktop("docker info");
    if (!result.success) {
        throw new Error("Docker is not running. Please check if Docker is installed and running correctly. <p class='my-3'><a class='p-1 rounded font-bold w-fit hover:bg-blue-400' href='#' onclick='window.backendAPI.reloadApp()'>Try again</a></p>");
    }
}

async function showIntro() {

    applicationStore.setLoader(true, "Loading complete");

    await promiseTimeout(1000);
    status.value = 'intro';

    await promiseTimeout(2000);
    status.value = 'finished';

    await promiseTimeout(1000);
    status.value = 'completed';
    applicationStore.setLoader(false, '');
    appStarted.value = true;
}

async function checkUpdates() {

    const result = await window.backendAPI.checkForUpdates();

    if (!result.success) {
        applicationStore.setNewAppVersionObject(false);
    } else {
        applicationStore.setNewAppVersionObject(result.data);
    }
}

onBeforeMount(async () => {

    applicationStore.setLoader(true, 'Installing Dresktop');

    try {
        await checkDockerIsRunning();
        await checkNetworkIsRunning();
        await checkCaddyIsRunning();
        await checkRsyncIsRunning();

        await settingsStore.load();
        await applicationStore.loadUserDataPath();
        await applicationStore.loadUserDocumentsPath();
        await projectStore.load();
        await infrastructureStore.load();
        await showIntro();
    } catch (error: any) {
        applicationStore.setLoader(true, error.message);
    }

});

onMounted(async () => {
    const version = await window.backendAPI.getAppVersion();
    applicationStore.setAppVersion(version);
    checkUpdates();
    intervalCheckUpdates.value = setInterval(checkUpdates, CHECK_UPDATES_INTERVAL);
});

onUnmounted(() => {
    clearInterval(intervalCheckUpdates.value);
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Loader v-if="applicationStore.getLoader" :message="applicationStore.getLoaderMessage" :status="status" />
    </Transition>
    <DefaultLayout v-if="appStarted" />
</template>