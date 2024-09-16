<script lang="ts" setup>
import { ref } from 'vue';
import Modal from './../Modal.vue';
import NewProjectForm from './../form/NewProjectForm.vue';
import Button from './../Button.vue';
import useInternationalization from '../../composables/translation';
const props = defineProps(['show', "projectId"]);
const emit = defineEmits(['update:show']);
const form = ref();
const formValidation = ref(false);
</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('titles.new_environment') }} </h2>
            </template>
            <template #content>
                <NewProjectForm ref="form" v-model:formValidation="formValidation" :only-environment="true"
                    :projectId="projectId" />
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.create')"
                    @click="form.onSave(); emit('update:show', false)" :disabled="!formValidation"
                    class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>