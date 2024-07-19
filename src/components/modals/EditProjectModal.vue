<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';

import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'

import { useProjectStore } from '../../store/project';
import { useGroupStore } from '../../store/group';

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';
import Select from './../form/Select.vue';

const props = defineProps(['show', 'project']);
const emit = defineEmits(['update:show']);

const projectStore = useProjectStore();
const groupStore = useGroupStore();

const selectedGroup = ref();
const project = ref();
const payload = ref({
    id: '',
    name: "",
    group_id: ""
});

const rules = {
    name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
}

const $formValidation = useVuelidate(rules, payload)

watch(() => props.project, (newValue) => {
    const val = toRaw(newValue);
    payload.value = project.value = { ...val };
    const result = groupStore.getGroups.find((group: any) => group.id == newValue.group_id);
    selectedGroup.value = toRaw(result);
});

async function onSave() {

    payload.value.group_id = selectedGroup.value.id;

    // Parses payload
    const payloadFormatted = toRaw(payload.value);

    await projectStore.edit(payloadFormatted);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">

        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">

            <template #title>
                <h2 v-if="props.project" class="mb-2 text-xl font-bold"> Edit {{ props.project.name }} </h2>
            </template>
            <template #content>
                <Input v-if="project" label="Application Name" v-model="payload.name"
                    message="Application name must be at least 3 characters." :validator="$formValidation.name" />
                <Select v-if="project" label="Group:" :items="groupStore.getGroups" v-model:selected="selectedGroup" />
            </template>
            <template #footer>
                <Button text="Edit" @click="onSave(); emit('update:show', false)" :disabled="$formValidation.$invalid"
                    class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" text="Cancel" type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>