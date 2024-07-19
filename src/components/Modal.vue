<script lang="ts" setup>
import { onKeyStroke } from '@vueuse/core';
import Card from './Card.vue';
import Icon from './Icon.vue';

const props = defineProps(['closable']);
const emit = defineEmits(['show']);

function onClose() {
    emit('show', false);
}

onKeyStroke('Escape', () => {
    emit('show', false);
});
</script>

<template>
    <div @click.self="onClose"
        class="flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 w-full p-4 max-h-full inset-0 bg-gray-500 bg-opacity-50">
        <div class="min-w-[600px] w-[800px] max-h-[90vh] overflow-y-hidden flex drop-shadow-xl">
            <Card class="bg-white">
                <template #title>
                    <slot name="title" />
                </template>
                <template #menu>
                    <div v-if="props.closable" @click="onClose"
                        class=" p-2 text-slate-400 hover:bg-blue-200 hover:text-blue-500 rounded cursor-pointer dark:hover:bg-blue-950"
                        style="font-size: 16px">
                        <Icon name="close" />
                    </div>
                </template>
                <template #content>
                    <slot name="content" />
                </template>
                <template #footer>
                    <div class="flex flex-row space-x-1 justify-end">
                        <slot name="footer" />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
<style></style>