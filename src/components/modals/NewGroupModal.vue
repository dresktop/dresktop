<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';
import PickColors from 'vue-pick-colors'

import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import { useGroupStore } from '../../store/group';
import useInternationalization from '../../composables/translation';

import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Input from './../form/Input.vue';
const props = defineProps(['show']);
const emit = defineEmits(['update:show']);
import tinycolor from "tinycolor2";

const groupStore = useGroupStore();

const payload = ref({
    name: "",
    color: ""
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

async function onSave() {

    // Parses payload
    const payloadFormatted = toRaw(payload.value);

    await groupStore.save(payloadFormatted);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

watch(() => props.show, (value) => {
    if (value) {
        var color = tinycolor.random();
        payload.value.color = color.toHexString();
    }
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.new_group') }} </h2>
            </template>
            <template #content>
                <Input :label="useInternationalization('labels.group_name')" v-model="payload.name"
                    :message="useInternationalization('messages.group_name_min_chars')"
                    :validator="$formValidation.name" />
                <div class="flex flex-row items-center">
                    <pick-colors v-model:value="payload.color" /> {{ useInternationalization('labels.group_color') }}
                </div>
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.create')" @click="onSave(); emit('update:show', false)"
                    :disabled="$formValidation.$invalid" class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>