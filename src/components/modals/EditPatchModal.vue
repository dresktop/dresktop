<script lang="ts" setup>
import { ref, toRaw, computed, watch } from 'vue';
import useInternationalization from '../../composables/translation';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';

const props = defineProps(['show', 'project', 'environment', 'patches', 'selectedModule', 'selectedPatch']);
const emit = defineEmits(['onRunCommand', 'update:show']);

const patches = computed(() => props.patches);
const selectedModule = computed(() => props.selectedModule);
const selectedPatch = computed(() => props.selectedPatch);

const payload = ref({
    name: "",
    file: ""
});

// Watch for changes in selectedModule and selectedPatch to update payload accordingly
watch([selectedModule, selectedPatch], ([newModule, newPatch]) => {
    if (newModule && newPatch) {
        payload.value.name = newPatch;
        payload.value.file = patches.value[newModule][newPatch];
    }
}, { immediate: true });

const rules = {
    name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    file: {
        required,
        $autoDirty: true
    }
};

const $formValidation = useVuelidate(rules, payload);

async function onSave() {

    const payloadFormatted = toRaw(payload.value);
    const selectedModuleRaw = toRaw(selectedModule.value);
    const selectedPatchRaw = toRaw(selectedPatch.value);

    // Update the patch name and the file
    patches.value[selectedModuleRaw][payloadFormatted.name] = payloadFormatted.file;

    // If the name has changed, remove the old patch entry
    if (payloadFormatted.name !== selectedPatchRaw) {
        delete patches.value[selectedModuleRaw][selectedPatchRaw];
    }

    // Emit event to close the modal or further actions
    emit('update:show', false);
}

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">

        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">

            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.edit_patch') }} </h2>
            </template>
            <template #content>
                <Input :label="useInternationalization('labels.description')" v-model="payload.name"
                    :message="useInternationalization('messages.description_min_chars')"
                    :validator="$formValidation.name" />

                <Input :label="useInternationalization('labels.path')" v-model="payload.file"
                    :message="useInternationalization('messages.description_min_chars')"
                    :validator="$formValidation.file" />
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