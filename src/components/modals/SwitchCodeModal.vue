<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';
import _ from 'lodash';
import useInternationalization from '../../composables/translation';

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Select from './../form/Select.vue';
import Alert from './../Alert.vue';

const props = defineProps(['show', 'environment', 'currentBranch']);
const emit = defineEmits(['update:show', 'onSwitchCode']);

const selected = ref({ name: '' });
const branches = ref([])

async function onSwitch() {

    emit('onSwitchCode', selected.value.name);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

async function checkBranches() {
    const result = await window.backendAPI.runOS(`cd ${props.environment.root} && git for-each-ref --format='%(refname:short)' refs/heads refs/tags`, toRaw(props.environment));

    // Splits the vlaue and removes the current branch
    branches.value = result.message.split('\n').filter(((branch: string) => branch != props.currentBranch));

    // Selects the first value
    if (branches.value.length) {
        selected.value.name = branches.value[0];
    }
}

watch(() => props.show, (value) => {
    if (value) {
        checkBranches();
    }
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.switch') }} </h2>
            </template>
            <template #content>

                <Alert :show="!branches.length" type="error" :text="useInternationalization('alerts.switch_code').value"
                    class="mb-4" />

                <template v-if="branches">
                    <Select :vlabel="useInternationalization('labels.from').value + `:`"
                        :items="branches.map((b: any) => { return { name: b } })" v-model:selected="selected" />
                </template>
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.switch')" @click="onSwitch"
                    class="mr-2 disabled:opacity-75" :disabled="!branches.length" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>