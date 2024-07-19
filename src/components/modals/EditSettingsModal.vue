<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';
import _ from 'lodash';
import { useSettingsStore } from '../../store/settings';
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';

const settingsStore = useSettingsStore();

const props = defineProps(['show', 'selectedSetting']);
const emit = defineEmits(['update:show']);

const payload = ref({
    key: '',
    val: '',
    name: '',
    message: ''
});

const formRules = {
    val: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
}

const $formValidation = useVuelidate(formRules, payload)

async function onSave() {

    // Parses payload
    const payloadFormatted = toRaw(payload.value);

    // Creates project in the database
    await settingsStore.save(payloadFormatted);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

watch(() => props.selectedSetting, (newValue) => {
    const val = toRaw(newValue);
    payload.value = {
        'key': val.key,
        'name': val.name,
        'val': val.value,
        'message': val.message,
    };
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> Edit {{ props.selectedSetting.name }} </h2>
            </template>
            <template #content>
                <Input label="Value" v-model="payload.val" :validator="$formValidation.val"
                    :message="props.selectedSetting.message" />
            </template>
            <template #footer>
                <Button text="Save" @click="onSave" :disabled="$formValidation.$invalid"
                    class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" text="Cancel" type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>