<script lang="ts" setup>
import { ref, toRaw, computed, watch } from 'vue';
import useInternationalization from '../../composables/translation';
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength, helpers } from '@vuelidate/validators'

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';

const props = defineProps(['show', 'project', 'environment', 'patches', 'selectedModule']);
const emit = defineEmits(['onRunCommand', 'update:show']);

const patches = computed(() => props.patches);
const selectedModule = computed(() => props.selectedModule);

const payload = ref({
    name: selectedModule.value,
});

// Watch for changes in selectedModule and update payload.name accordingly
watch(selectedModule, (newVal) => {
    payload.value.name = newVal;
});
// Assuming the key for the translation is 'validation.moduleNameFormat'
const moduleNameFormatMessage = useInternationalization('messages.patch_module_format');

// Custom validation to match "drupal/module_name" format
const moduleNameFormat = helpers.withMessage(
    moduleNameFormatMessage.value,
    (value: any) => {
        // Regex to match the format "drupal/module_name"
        return /^drupal\/[a-zA-Z0-9_]+$/.test(value);
    }
);

const rules = {
    name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(128),
        moduleNameFormat,
        $autoDirty: true
    },
}

const $formValidation = useVuelidate(rules, payload);

async function onSave() {

    // const payloadFormatted = toRaw(payload.value);
    // const selectedModuleRaw = toRaw(selectedModule.value);

    // // If the patch name has changed, update the name and remove the old patch entry
    // if (payloadFormatted.name !== selectedModuleRaw) {
    //     // Rename "drupal/module_one" to "drupal/module_test"
    //     patches.value[payloadFormatted.name] = patches.value[selectedModuleRaw];
    //     delete patches.value[selectedModuleRaw];
    // } else {
    //     // Update the patch without renaming if the names are the same
    //     patches.value[selectedModuleRaw] = payloadFormatted.file;
    // }

    // // Emit event to close the modal or perform further actions
    // emit('update:show', false);


    const payloadFormatted = toRaw(payload.value);

    if (patches.value[payloadFormatted.name] != patches.value[toRaw(selectedModule.value)]) {
        // Rename "drupal/module_one" to "drupal/module_test"
        patches.value[payloadFormatted.name] = patches.value[toRaw(selectedModule.value)];
        delete patches.value[toRaw(selectedModule.value)];

        const updatedPatches = await window.backendAPI.updatePatches(toRaw(patches.value), toRaw(props.environment));
        console.log("== updatedPatches ==", updatedPatches);
        // Checks if the default environment needs to be 
    }

    emit('update:show', false);
}

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">

        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">

            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.edit_patch_module') }} </h2>
            </template>
            <template #content>
                <!-- <Input v-if="project" :label="useInternationalization('labels.application_name')" v-model="payload.name"
                    :message="useInternationalization('messages.application_name_min_chars')"
                    :validator="$formValidation.name" /> -->
                <Input v-if="project" :label="useInternationalization('labels.patch_module_name')"
                    v-model="payload.name" :message="useInternationalization('messages.application_name_min_chars')"
                    :validator="$formValidation.name" />
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