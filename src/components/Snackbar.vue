<script lang="ts" setup>
import { watch } from 'vue';
import ButtonIcon from './../components/ButtonIcon.vue';

const props = defineProps(['show', 'content']);
const emit = defineEmits(['update:show']);

let timeout: any = null;

watch(() => props.show, (value) => {
    if (value) {
        timeout = setTimeout(() => {
            emit('update:show', false)
        }, 5000);
    } else {
        clearTimeout(timeout);
    }
});

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <div v-if="props.show"
            class="fixed left-2/4 translate-x-[-50%] bottom-16 flex flex-row items-center px-3 py-3 rounded border border-blue-200 bg-blue-500 text-white gap-2">
            <div>
                {{ props.content }}
            </div>
            <div>
                <ButtonIcon v-on:click.prevent="emit('update:show', false)" icon="close" type="tertiary"
                    class="text-white" />
            </div>
        </div>
    </Transition>
</template>