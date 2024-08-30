<script lang="ts" setup>
import { computed } from 'vue';
import useUriBrowser from '../../composables/uriBrowser'
import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Logo from './../logo/Logo.vue'

import { useApplicationStore } from './../../store/application';
const applicationStore = useApplicationStore();

const props = defineProps(['show']);
const emit = defineEmits(['update:show']);

const isUpToDate = computed(function () {
    if (!applicationStore.getNewAppVersionObject) {
        return true;
    } else {
        return applicationStore.getAppVersion == applicationStore.getNewAppVersionObject.version
    }
});

const newVersionAvailable = computed(function () {
    if (applicationStore.getNewAppVersionObject) {
        return applicationStore.getNewAppVersionObject.version
    }
});

// function installUpdates() {
//     window.backendAPI.installUpdates();
// }

/**
 * This function was created because the auto updater didn't
 * work if the app was not signed
 */
const newVersionAvailableUrl = computed(function () {

    // if (applicationStore.getNewAppVersionObject) {
    //     const asset = applicationStore.getNewAppVersionObject.assets.find(function (asset: any) {
    //         return asset.name == applicationStore.getNewAppVersionObject.path;
    //     });
    //     return asset.browser_download_url;
    // }

    const baseUrl = "https://github.com/dresktop/dresktop/releases/download/"; // Update this with your actual base URL

    return `${baseUrl}${applicationStore.getNewAppVersionObject.tag}/${applicationStore.getNewAppVersionObject.path}`;
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true"
            class="[&>div]:min-w-[500px] [&>div]:w-[500px]">
            <template #content>
                <div class="flex flex-col items-center">
                    <Logo class="max-w-32" />

                    <div v-if="isUpToDate && applicationStore.getAppVersion" class="my-8">You are up to date. <span
                            class="font-medium">Version {{ applicationStore.getAppVersion }}</span></div>
                    <div v-if="!isUpToDate" class="my-8">New version
                        <span class="font-medium">{{ newVersionAvailable }}</span> is available.
                    </div>

                </div>
                <div class="flex flex-col items-center">
                    <div class="flex flex-row items-center">
                        <Button v-if="!isUpToDate && applicationStore.getNewAppVersionObject" text="Download"
                            @click="useUriBrowser(newVersionAvailableUrl)" class="mr-2 disabled:opacity-75" />
                        <!-- <Button v-if="!isUpToDate && applicationStore.getNewAppVersionObject" text="Install now"
                            @click="installUpdates()" class="mr-2 disabled:opacity-75" /> -->
                        <Button v-if="isUpToDate" @click="emit('update:show', false)" text="Ok" />
                    </div>
                </div>
            </template>
        </Modal>
    </Transition>
</template>
<style></style>