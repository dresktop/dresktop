<script lang="ts" setup>
import { reactive } from 'vue'

const props = defineProps(['label', 'modelValue', 'autofocus', 'options', 'message', 'validator', 'direction']);
const emit = defineEmits(['update:modelValue']);

const state = reactive({
    val: false,
});

function onChange($event: any) {
    emit('update:modelValue', $event.target.value)
}

</script>

<template>
    <div class="block">
        <div class="font-medium mb-1">{{ props.label }}</div>
        <div class="flex" :class="props.direction && props.direction == 'col' ? 'flex-col' : 'flex-row'">
            <template v-for="option in props.options">
                <label class="flex items-center cursor-pointer mr-4">
                    <input v-model="state.val" @change="onChange($event)" :value="option.key"
                        :checked="modelValue == option.key" type="radio" :autofocus="props.autofocus" class="
                        w-4 
                        h-4 
                        text-blue-600 
                        bg-slate-50 
                        border-blue-300 
                        border-solid
                        border-2
                        rounded 
                        focus:border-blue-500 
                        focus:outline-none
                        focus:ring-0 
                        focus:border-2
                        focus:border-solid">
                    <span class="ms-2">{{ option.name }}</span>
                </label>
            </template>
        </div>
        <div class="flex flex-row">
            <div v-if="props.message && typeof props.validator !== 'undefined' && !props.validator.$errors.length"
                class="text-gray-500 my-1 text-sm">{{ props.message
                }}</div>
            <div v-if="typeof props.validator !== 'undefined'" class="flex flex-row"
                v-for="(error, index) of props.validator.$errors" :key="index">
                <div class="text-red-500 my-1 text-sm">{{ error.$message }}</div>
            </div>
        </div>
    </div>
</template>
<style></style>