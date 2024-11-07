<script lang="ts" setup>
import { ref, toRaw, computed } from 'vue';
import useInternationalization from '../../composables/translation';
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';

const props = defineProps(['show', 'project', 'environment', 'patches', 'selectedModule']);
const emit = defineEmits(['onRunCommand', 'update:show', 'update:patches']);

const patches = computed(() => props.patches);

const payload = ref({
    description: "",
    path: ""
});

const rules = {
    description: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    path: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
}

const $formValidation = useVuelidate(rules, payload);

async function onSave() {

    const payloadFormatted = toRaw(payload.value);

    const updatedPatches = JSON.parse(JSON.stringify(patches.value));

    console.log("payloadFormatted", payloadFormatted);
    console.log("updatedPatches#1", updatedPatches);
    console.log("selectedModule", props.selectedModule);

    updatedPatches[props.selectedModule][payloadFormatted.description] = payloadFormatted.path;

    console.log("updatedPatches#2", updatedPatches);


    const result = await window.backendAPI.updatePatches(updatedPatches, toRaw(props.environment));

    if (result.success) {

        // Emit the updated patches back to the parent
        emit('update:patches', updatedPatches);
    }

    emit('update:show', false);
}

function clearPayload() {
    payload.value.description = "";
    payload.value.path = "";
}

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">

        <Modal @show="clearPayload(); emit('update:show', false)" v-if="props.show" closable="true">

            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.add_patch') }} </h2>
            </template>
            <template #content>
                <Input v-if="project" :label="useInternationalization('labels.description')"
                    v-model="payload.description" :message="useInternationalization('messages.description_min_chars')"
                    :validator="$formValidation.description" />

                <Input v-if="project" :label="useInternationalization('labels.path')" v-model="payload.path"
                    :validator="$formValidation.path" />
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.edit')" @click="onSave(); emit('update:show', false)"
                    :disabled="$formValidation.$invalid" class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>