<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import useInternationalization from '../composables/translation';

// Store
import { useEnvironmentStore } from './../store/environment';
import { useApplicationStore } from './../store/application';
import { useProjectStore } from './../store/project';
import { useGroupStore } from './../store/group';

// Modals
import NewEnvironmentModal from './../components/modals/NewEnvironmentModal.vue';
import EditEnvironmentModal from './../components/modals/EditEnvironmentModal.vue';
import CancelAcceptModal from './../components/modals/CancelAcceptModal.vue';
import EditProjectModal from './../components/modals/EditProjectModal.vue';

// Components
import Icon from './../components/Icon.vue';
import ButtonIcon from './../components/ButtonIcon.vue';
import Snackbar from './../components/Snackbar.vue';
import Badge from './../components/Badge.vue';

import tinycolor from "tinycolor2";

const props = defineProps(['projects']);

const environmentStore = useEnvironmentStore();
const projectStore = useProjectStore();
const applicationStore = useApplicationStore();
const groupStore = useGroupStore();

const projectDisplayed = ref(-1);
const projectIdClicked = ref(0);
const environments = ref([]);
const showSnackbar = ref(false);
const snackbarValue = ref("");
let clickedDeleteEnvironment = 0;
let clickedDeleteProject = 0;
let clickedEditEnvironment: any;
let clickedEditProject: any;

// Modals
const showNewEnvironmentModal = ref(false);
const showEditEnvironmentModal = ref(false);
const showCancelAcceptModalDeleteEnvironment = ref(false);
const showCancelAcceptModalDeleteProject = ref(false);
const showModalEditProject = ref(false);

const projectEnvironments = computed(function () {
    if (projectDisplayed.value > -1 && props.projects.length) {
        return environmentStore.getEnvironments.filter((environment: any) => environment.project_id == props.projects[projectDisplayed.value].id);
    }
});

async function onProjectClick(index: number) {
    if (projectDisplayed.value == index) {
        projectDisplayed.value = -1;
    } else {
        projectDisplayed.value = index;
    }
}

function onClickProjectDelete(projectId: number) {
    clickedDeleteProject = projectId;
    showCancelAcceptModalDeleteProject.value = true;
}

async function onDeleteProject() {

    const projectEnvironments = environmentStore.getEnvironments.filter((environment: any) => environment.project_id == clickedDeleteProject);

    if (projectEnvironments.length) {
        showSnackbar.value = true;
        snackbarValue.value = useInternationalization('snackbars.project_cannot_be_deleted').value;
    } else {
        applicationStore.setLoader(true, useInternationalization('loaders.deleting_project').value);
        await projectStore.delete(clickedDeleteProject);
        applicationStore.setLoader(false, '');
    }
}

function onClickProjectEdit(projectId: number) {
    clickedEditProject = props.projects.find((p: any) => p.id == projectId);
    showModalEditProject.value = true;
}

function onClickEnvironmentDelete(environmentId: number) {
    clickedDeleteEnvironment = environmentId;
    showCancelAcceptModalDeleteEnvironment.value = true;
}

function onClickEnvironmentEdit(environment: any) {
    clickedEditEnvironment = environment;
    showEditEnvironmentModal.value = true;
}

async function onDeleteEnvironment() {
    applicationStore.setLoader(true, useInternationalization('loaders.deleting_environment').value);
    await environmentStore.delete(clickedDeleteEnvironment);
    applicationStore.setLoader(false, '');
}

function getProjectGroup(groupId: number) {
    return groupStore.getGroups.find((group: any) => group.id == groupId)
}

onMounted(async () => {
    await environmentStore.load();
    environments.value = environmentStore.getEnvironments;
});

</script>

<template>

    <!-- Modal New Environment -->
    <NewEnvironmentModal v-model:show="showNewEnvironmentModal" :projectId="projectIdClicked" />

    <!-- Modal Edit Environment -->
    <EditEnvironmentModal v-model:show="showEditEnvironmentModal" :environment="clickedEditEnvironment" />

    <CancelAcceptModal :title="useInternationalization('titles.delete_environment').value"
        :content="useInternationalization('labels.do_you_want_to_delete_environment').value"
        v-model:show="showCancelAcceptModalDeleteEnvironment" @onAccept="onDeleteEnvironment" />

    <CancelAcceptModal :title="useInternationalization('titles.delete_application').value"
        :content="useInternationalization('labels.do_you_want_to_delete_application').value"
        v-model:show="showCancelAcceptModalDeleteProject" @onAccept="onDeleteProject" />

    <!-- Modal Edit Project -->
    <EditProjectModal v-model:show="showModalEditProject" :project="clickedEditProject" />

    <Snackbar :content="snackbarValue" v-model:show="showSnackbar" />

    <template v-for="(project, index) in props.projects" :key="index">
        <div class="
                border-b border-slate-200 dark:border-slate-900
                select-none" :class="index == 0 ? 'border-t' : ''">
            <div @click="onProjectClick(index); projectIdClicked = project.id" class="
                flex
                flex-row
                justify-between
                justify-items-center
                items-center
                py-3
                px-2
                transition-all
                ease-out
                hover:bg-blue-50 dark:hover:bg-slate-900
                hover:text-blue-500
                cursor-pointer"
                :class="projectDisplayed == index ? 'bg-blue-100 dark:bg-slate-900 text-blue-500' : ''">
                <div class="flex flex-row justify-items-center items-center">
                    <Icon :name="projectDisplayed == index ? 'arrowDown' : 'arrowRight'" class="mr-2" />
                    <span class="font-normal">{{ project.name }}</span>
                </div>
                <div class="flex flex-row gap-1 items-center">
                    <!-- @vue-ignore -->
                    <Badge :set="projectGroup = getProjectGroup(project.group_id)" :name="projectGroup.name"
                        :color="projectGroup.color"
                        :textColor="tinycolor.mostReadable(projectGroup.color, ['#ffffff', '#000000', '#dc2626']).toHexString()" />
                    <ButtonIcon v-on:click.prevent="onClickProjectEdit(project.id)" icon="edit" type="tertiary" />
                    <ButtonIcon v-on:click.stop="onClickProjectDelete(project.id)" icon="delete" type="tertiary" />
                </div>
            </div>

            <!-- Project's environment -->
            <div v-if="projectDisplayed == index">
                <template v-for="environment in projectEnvironments">
                    <router-link :to="{ path: `/environment/${environment.id}/` }">
                        <div class="
                                flex
                                flex-row 
                                justify-between
                                justify-items-center
                                items-center 
                                py-2 
                                pl-14 
                                pr-2
                                hover:bg-blue-50 dark:hover:bg-slate-900
                                hover:text-blue-500
                                cursor-pointer">
                            <div class="
                                    flex 
                                    flex-row 
                                    justify-items-center 
                                    items-center">
                                <Icon name="arrowRightBottom" class="mr-3" />
                                <Icon :name="environment.type" class="mr-2" />
                                <span class="font-normal">{{ environment.name }}</span>
                            </div>
                            <div class="flex flex-row gap-1">
                                <ButtonIcon v-on:click.prevent="onClickEnvironmentEdit(environment)" icon="edit"
                                    type="tertiary" />
                                <ButtonIcon v-on:click.prevent="onClickEnvironmentDelete(environment.id)" icon="delete"
                                    type="tertiary" />
                            </div>
                        </div>
                    </router-link>
                </template>
                <div @click="showNewEnvironmentModal = true" class="
                                flex
                                flex-row 
                                justify-items-center 
                                items-center 
                                py-3 
                                pl-14 
                                pr-3
                                hover:bg-blue-50 dark:hover:bg-slate-900
                                hover:text-blue-500
                                cursor-pointer">
                    <Icon name="plus" class="mr-2" />
                    <span class="font-normal">{{ useInternationalization('buttons.add_environment') }}</span>
                </div>
            </div>
        </div>
    </template>
</template>

<style></style>