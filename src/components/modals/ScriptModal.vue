<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import _ from 'lodash';
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'

import Modal from './../Modal.vue';
import Button from './../Button.vue';

const props = defineProps(['show']);
const emit = defineEmits(['onRunCommand', 'update:show']);

const editorOptions = {
    lineNumbers: true,
    mode: 'shell',
    style: "{ height: '400px' }"
};

const payload = ref({
    code: "drush status",
});

const rules = {
    code: { required, $autoDirty: true },
}

const validator$ = useVuelidate(rules, payload)

async function onSave() {

    // Parses payload
    const payloadCode = toRaw(payload.value);

    emit('onRunCommand', payloadCode.code);

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
                <h2 class="mb-2 text-xl font-bold"> Run bash script </h2>
            </template>
            <template #content>
                <codemirror ref="myEditor" v-model="payload.code" :options="editorOptions" :style="{ height: '400px' }"
                    :autofocus="true" :indent-with-tab="true" :tab-size="2" validator="validator$.code" />
            </template>
            <template #footer>
                <Button text="Run" @click="onSave" :disabled="validator$.$invalid" class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" text="Cancel" type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>