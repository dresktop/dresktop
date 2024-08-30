<script lang="ts" setup>
import { ref, computed } from 'vue';
import Logo from '../components/logo/Logo.vue'
import Icon from '../components/Icon.vue'
import Button from '../components/Button.vue';
import { useApplicationStore } from './../store/application';
import { useDark, useToggle } from '@vueuse/core';
import useUriBrowser from '../composables/uriBrowser'
import InformationModal from '../components/modals/InformationModal.vue';

const applicationStore = useApplicationStore();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const showModalUpdates = ref(false);

const menuOptions = [
    {
        label: 'Applications',
        url: '/',
        icon: 'projects',
    },
    {
        label: 'Groups',
        url: '/groups',
        icon: 'groups',
    },
    {
        label: 'Settings',
        url: '/settings',
        icon: 'settings',
    }
];

function onClickDrawer() {
    applicationStore.toogleDrawer();
}

function onClickUpdates() {
    showModalUpdates.value = true;
}

const isUpToDate = computed(function () {
    if (!applicationStore.getNewAppVersionObject) {
        return true;
    } else {
        return applicationStore.getAppVersion == applicationStore.getNewAppVersionObject.version
    }
});

</script>

<template>

    <div class="
        flex h-screen flex-row 
        bg-slate-100 dark:bg-[#151d2a]
        text-slate-700 dark:text-slate-300">

        <!-- Modal New Task -->
        <InformationModal v-model:show="showModalUpdates" />

        <!-- Sidebar -->
        <Transition name="slide">
            <div v-show="applicationStore.getDrawer" class="
                    flex 
                    w-56 
                    flex-col 
                    items-center 
                    justify-between 
                    pt-10 
                    pb-6 
                    px-4
                    bg-white
                    shadow-sm 
                    dark:bg-slate-800 
                    shrink-0">
                <div class="flex flex-col items-center w-full">
                    <Logo class="max-w-32" />
                    <div class="mt-8 flex flex-col items-center w-full">
                        <template v-for="(option, _index) in menuOptions" :key="_index">
                            <router-link :to="option.url" class="w-full">
                                <Button :text="option.label" type="tertiary" :icon="option.icon" class="
                                    w-full 
                                    mb-2
                                    py-5
                                    text-slate-700 dark:text-white
                                    hover:bg-blue-700 hover:text-white" />
                            </router-link>
                        </template>
                    </div>
                </div>
                <div class="w-full">
                    <Button @click="useUriBrowser('https://dresktop.com/docs/intro/getting-started.html')" text="Help"
                        type="tertiary" icon="externalLink" class="
                          w-full 
                        text-slate-700 dark:text-white
                        hover:bg-blue-700 hover:text-white " />
                </div>
            </div>
        </Transition>

        <!-- Main -->
        <div class="flex h-full w-full flex-col px-4 pb-4 pt-2">

            <!-- Header -->
            <div class="flex flex-row items-center justify-between mb-1">
                <div @click="onClickDrawer"
                    class="my-2 cursor-pointer rounded p-2 text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950">
                    <Icon name="hamburger" class="h-6 w-6" />
                </div>
                <div class="flex items-center">
                    <div class="flex flex-row items-center space-x-3">
                        <div class="my-2 cursor-pointer rounded p-2 text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950"
                            @click="toggleDark()">
                            <Icon class="h-6 w-6" :name="isDark ? 'dark' : 'light'" />
                        </div>
                        <div class="my-2 cursor-pointer rounded p-2 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950"
                            :class="!isUpToDate ? 'text-red-400' : 'text-slate-400'" @click="onClickUpdates()">
                            <Icon class="h-6 w-6 " name="info" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main -->
            <div class="mt-1 h-full overflow-y-hidden">
                <router-view />
            </div>
        </div>
    </div>
</template>

<style>
.slide-enter-active {
    transition: all 0.1s ease;
    transform: translateX(-90%);
    opacity: 1;
}

.slide-enter-to {
    transition: all 0.2s ease;
    transform: translateX(0%);
}

.slide-leave-active {
    transition: all 0.2s ease;
    transform: translateX(-70%);
    opacity: 0;
}
</style>