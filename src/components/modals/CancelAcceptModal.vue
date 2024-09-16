<script lang="ts" setup>
import useInternationalization from '../../composables/translation';
import Modal from './../Modal.vue';
import Button from './../Button.vue';

const props = defineProps(['show', 'title', 'content']);
const emit = defineEmits(['update:show', 'onAccept']);

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <Modal @show="emit('update:show', false)" v-if="props.show" closable="true">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ props.title }} </h2>
            </template>
            <template #content>
                {{ props.content }}
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.accept')"
                    @click="emit('onAccept'); emit('update:show', false)" class="mr-2 disabled:opacity-75" />
                <Button @click="emit('update:show', false)" :text="useInternationalization('buttons.cancel')"
                    type="secondary" />
            </template>
        </Modal>
    </Transition>
</template>
<style></style>