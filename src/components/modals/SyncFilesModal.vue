<script lang="ts" setup>
import { ref, watch } from 'vue';
import _ from 'lodash';

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Icon from './../Icon.vue';
import Select from './../form/Select.vue';
import Input from './../form/Input.vue';
import Alert from './../Alert.vue';

const props = defineProps(['show', 'projectEnvironments', 'currentEnvironment']);
const emit = defineEmits(['update:show', 'onSyncFiles']);

async function onSave() {

    emit('onSyncFiles', selected.value);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

let selected = ref(null);
const showError = ref(false);
showError.value = (props.projectEnvironments && !props.projectEnvironments.length) ? true : false;

// This watch is to assign a default value when the component is displayed
watch(() => props.projectEnvironments, (_value) => {
    if (props.projectEnvironments.length) {
        selected.value = props.projectEnvironments[0];
    }
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> Sync Files</h2>
            </template>
            <template #content>

                <Alert :show="!props.projectEnvironments.length" type="error"
                    :text="`You need to create an environment to be the source of the sync.`" class="mb-4" />

                <div class="flex flex-row gap-4 h-full items-center">
                    <div class="basis-1/2 h-full">
                        <Select label="From:" :items="props.projectEnvironments" v-model:selected="selected" />
                    </div>
                    <div>
                        <Icon name="right" class="" />
                    </div>
                    <div class="basis-1/2 h-full">
                        <Input label="To:" v-model="props.currentEnvironment.name" :readonly='true'
                            message="Full path of the file. Allowed formats .sql and .gz" />
                    </div>
                </div>
            </template>
            <template #footer>
                <Button text="Sync" @click="onSave" class="mr-2 disabled:opacity-75"
                    :disabled="!props.projectEnvironments.length" />
                <Button @click="emit('update:show', false)" text="Cancel" type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>