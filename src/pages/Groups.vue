<script setup lang="ts">
import { ref } from 'vue';

import { useGroupStore } from './../store/group';
import { useApplicationStore } from './../store/application';

import Snackbar from './../components/Snackbar.vue';
import Button from './../components/Button.vue';
import ButtonIcon from './../components/ButtonIcon.vue';
import Icon from './../components/Icon.vue';
import Page from './../components/Page.vue'
import Card from './../components/Card.vue';
import CancelAcceptModal from './../components/modals/CancelAcceptModal.vue';
import NewGroupModal from '../components/modals/NewGroupModal.vue';
import EditGroupModal from '../components/modals/EditGroupModal.vue';

const groupStore = useGroupStore();
const applicationStore = useApplicationStore();

const showNewGroupModal = ref(false);
const showEditGroupModal = ref(false);
const clickedEditGroupModal = ref({});
const clickedDeleteGroupId = ref();
const showCancelAcceptModalDeleteGroup = ref(false);

const showSnackbar = ref(false);
const snackbarValue = ref("");

function onClickEdit(id: number) {
    clickedEditGroupModal.value = groupStore.getGroups.find((group: any) => group.id == id);
    showEditGroupModal.value = true;
}

function onClickDelete(id: number) {
    clickedDeleteGroupId.value = id;
    showCancelAcceptModalDeleteGroup.value = true;
}

async function onDeleteGroup() {
    applicationStore.setLoader(true, 'Deleting the group');
    const result = await groupStore.delete(clickedDeleteGroupId.value);
    applicationStore.setLoader(false, '');
    if (!result) {
        showSnackbar.value = true;
        snackbarValue.value = "Group cannot be deleted. There are projects associated to this group";
    }
}

</script>

<template>

    <!-- Modal New Group -->
    <NewGroupModal v-model:show="showNewGroupModal" />

    <!-- Modal Edit Group -->
    <EditGroupModal v-model:show="showEditGroupModal" :group="clickedEditGroupModal" />

    <CancelAcceptModal title="Delete group" content="Do you want to delete the group?"
        v-model:show="showCancelAcceptModalDeleteGroup" @onAccept="onDeleteGroup" />

    <Snackbar :content="snackbarValue" v-model:show="showSnackbar" />

    <Page>
        <template #title>
            <div class="flex flex-row items-center">
                <span>Groups</span>
            </div>
        </template>
        <template #menu>
            <div class="flex flex-row space-x-1 items-center">
                <Button @click="showNewGroupModal = true" text="New Group" type="tertiary" icon="plus" class="w-full" />
            </div>
        </template>
        <template #content>
            <Card class="bg-white h-full">
                <template #content>
                    <template v-if="groupStore.getGroups.length">
                        <template v-for="(group, _index) in groupStore.getGroups" :key="_index">
                            <div class="border-b border-slate-200 dark:border-slate-900 select-none">
                                <div class="
                                flex
                                flex-row
                                justify-between
                                justify-items-center
                                items-center
                                py-3
                                pl-4
                                pr-2
                                transition-all
                                ease-out
                                hover:bg-blue-50 dark:hover:bg-slate-900
                                hover:text-blue-500">
                                    <div>
                                        <div class="font-bold flex flex-row items-center">
                                            <Icon name="circle" class="mr-2" :style="`color: ${group.color}`" /> {{
                                                group.name }}
                                        </div>
                                        <div>
                                            {{ group.value }}
                                        </div>
                                    </div>
                                    <div class="flex flex-row gap-1">
                                        <ButtonIcon v-on:click.prevent="onClickEdit(group.id)" icon="edit"
                                            type="tertiary" />
                                        <ButtonIcon v-if="group.id != 1" v-on:click.prevent="onClickDelete(group.id)"
                                            icon="delete" type="tertiary" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </template>
                </template>
            </Card>
        </template>
    </Page>
</template>