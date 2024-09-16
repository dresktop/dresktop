<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';
import useInternationalization from '../../composables/translation';

import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength, requiredIf } from '@vuelidate/validators'
import { useEnvironmentStore } from '../../store/environment';

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';
import Card from './../Card.vue';
import Checkbox from './../form/Checkbox.vue';

const props = defineProps(['show', 'environment']);
const emit = defineEmits(['update:show']);

const environmentStore = useEnvironmentStore();

const formValues = ref({
    name: "",
    root: "",
    type: "",
    host: "",
    user: "",
    uri: "",
    ssh_key_path: "",
    drush_path: "",
    production_mode: false
});

const formRules = {
    name: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    root: {
        required: requiredIf(function () {
            return formValues.value.type == 'desktop';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    host: {
        required: requiredIf(function () {
            return formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    user: {
        required: requiredIf(function () {
            return formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    uri: {
        required: requiredIf(function () {
            return formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(128),
        $autoDirty: true
    },
    ssh_key_path: {
        required: requiredIf(function () {
            return formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
    drush_path: {
        required: requiredIf(function () {
            return formValues.value.type == 'cloud';
        }),
        minLength: minLength(3),
        maxLength: maxLength(1024),
        $autoDirty: true
    },
}

const $formValidation = useVuelidate(formRules, formValues)

watch(() => props.environment, (newValue) => {
    const val = toRaw(newValue);
    formValues.value = { ...val };
});

async function onSave() {

    // Parses payload
    const payloadFormatted = toRaw(formValues.value);

    await environmentStore.edit(payloadFormatted);

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
                <h2 v-if="props.environment" class="mb-2 text-xl font-bold">
                    {{ useInternationalization('titles.edit_environment') }} </h2>
            </template>
            <template #content>
                <Input :label="useInternationalization('labels.name')" v-model="formValues.name"
                    :message="useInternationalization('messages.name_min_chars')" :validator="$formValidation.name" />

                <Checkbox :label="useInternationalization('labels.enable_production_mode')"
                    v-model="formValues.production_mode" class="mb-4" />

                <Card color="bg-slate-100" colorDark="dark:bg-slate-900" classes="shadow-none">
                    <template #content>

                        <div v-if="formValues.type == 'desktop'">
                            <div class="font-bold mb-3">{{ useInternationalization('labels.desktop_options') }}</div>
                            <Input :label="useInternationalization('labels.applications_root_path')"
                                v-model="formValues.root" :validator="$formValidation.root" />
                        </div>

                        <!-- Shows cloud form -->
                        <div v-if="formValues.type == 'cloud'">
                            <div class="font-bold mb-3">{{ useInternationalization('labels.cloud_options') }}</div>
                            <Input :label="useInternationalization('labels.uri')" v-model="formValues.uri"
                                :validator="$formValidation.uri" />
                            <Input :label="useInternationalization('labels.host')" v-model="formValues.host"
                                :validator="$formValidation.host" />
                            <Input :label="useInternationalization('labels.user')" v-model="formValues.user"
                                :validator="$formValidation.user" />
                            <Input :label="useInternationalization('labels.ssh_key_path')"
                                v-model="formValues.ssh_key_path" :validator="$formValidation.ssh_key_path" />
                            <Input :label="useInternationalization('labels.applications_root_path')"
                                v-model="formValues.root" :validator="$formValidation.root" />
                            <Input :label="useInternationalization('labels.drush_path')" v-model="formValues.drush_path"
                                :validator="$formValidation.drush_path" />
                        </div>
                    </template>
                </Card>
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
<style></style>