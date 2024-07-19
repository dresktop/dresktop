<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps(['options', 'modelValue']);
const emit = defineEmits(['update:modelValue']);

let selected = ref();

if (props.options) {
    selected.value = props.options[0].key;
}

function onTabClick(key: any) {
    selected.value = key;
    emit('update:modelValue', key)
}
</script>

<template>
    <div class="flex flex-col space-y-4">
        <div class="flex flex-row space-x-1 items-center justify-start">
            <template v-for="(option, _index) in props.options" :key="_index">
                <button @click="onTabClick(option.key)" type="button"
                    class="px-2 rounded-t flex items-center text-sm justify-center w-fit py-1 text-center dark:hover:bg-blue-950"
                    :class="option.key == selected ? 'border-b-2 border-blue-500 text-blue-500 hover:bg-blue-100' : 'text-slate-500 hover:text-blue-500 border-b-2 border-transparent hover:bg-blue-100 hover:rounded-b'">
                    <span>{{ option.name }}</span>
                </button>
            </template>
        </div>
        <div>
            <slot :name="selected" />
        </div>
    </div>
</template>
<style></style>