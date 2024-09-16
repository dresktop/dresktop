<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import _ from 'lodash';
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import useInternationalization from '../../composables/translation';
import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';

const props = defineProps(['show']);
const emit = defineEmits(['update:show', 'onImportDatabase']);

const payload = ref({
    val: '',
});

const formRules = {
    val: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
}

const $formValidation = useVuelidate(formRules, payload);

async function onSave() {

    // Parses payload
    const payloadFormatted = toRaw(payload.value);

    emit('onImportDatabase', payloadFormatted.val);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

const dialogIsOpen = ref(false);

async function openDialog() {

    if (!dialogIsOpen.value) {

        dialogIsOpen.value = true;

        // Gets the result of the file ui prompt
        const result = await window.backendAPI.openDialog('file');

        if (!result.canceled) {
            payload.value.val = result.filePaths[0];
        }

        dialogIsOpen.value = false;
    }
}

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.import_database') }} </h2>
            </template>
            <template #content>
                <Input :label="useInternationalization('titles.import_database')" v-model="payload.val"
                    :validator="$formValidation.val" @click="openDialog" :readonly='true'
                    :message="useInternationalization('messages.database_path')" />
            </template>
            <template #footer>
                <Button text="Import" @click="onSave" :disabled="$formValidation.$invalid"
                    class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>