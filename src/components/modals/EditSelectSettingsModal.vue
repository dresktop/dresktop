<script lang="ts" setup>
import { ref, watch } from 'vue';
import _ from 'lodash';
import i18next from 'i18next';
import { useSettingsStore } from '../../store/settings';
import Modal from './../Modal.vue';
import Button from './../Button.vue';
import Select from './../form/Select.vue';
import useInternationalization from '../../composables/translation';
import useLanguages from '../../composables/languages';
const settingsStore = useSettingsStore();

const props = defineProps(['show', 'selectedSetting']);
const emit = defineEmits(['update:show']);

const languages = useLanguages();

const selected = ref({
    name: "",
    key: ""
});

async function onSave() {

    // Parses payload
    const payloadFormatted = {
        'key': props.selectedSetting.key,
        'name': props.selectedSetting.name,
        'val': selected.value.key,
        'message': props.selectedSetting.message,
    };

    // Creates project in the database
    await settingsStore.save(payloadFormatted);

    i18next.changeLanguage(selected.value.key);

    // Checks if the default environment needs to be 
    emit('update:show', false);
}

// Need to customize this function to be used not only for languages
watch(() => props.selectedSetting, (value) => {
    selected.value.key = value.value;
    selected.value.name = languages.find((lang: any) => lang.key == value.value)?.name || 'English';
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.edit') }} {{
                    useInternationalization('settings.' +
                        props.selectedSetting.key) }} </h2>
            </template>
            <template #content>
                <Select vlabel="From:" :items="languages" v-model:selected="selected" />
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.save')" @click="onSave"
                    class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>