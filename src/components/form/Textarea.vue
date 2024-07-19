<script lang="ts" setup>
const props = defineProps(['label', 'modelValue', 'autofocus', 'message', 'validator', 'rows', 'placeholder']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <label class="block mb-1">
        <span>{{ props.label }}</span>
        <textarea class="
                mt-1 
                p-2 
                block 
                w-full 
                overflow-y-auto 
                rounded 
                bg-slate-50 dark:bg-slate-950
                border-blue-300 dark:border-slate-600
                border-solid
                border-2
                leading-3 
                focus:border-blue-500 
                focus:outline-none
                focus:ring-0 
                focus:border-2
                focus:border-solid
                 placeholder:text-slate-400
            " :rows="props.rows ? props.rows : 3" :placeholder="props.placeholder ? props.placeholder : ''"
            :autofocus="props.autofocus" :value="modelValue"
            @input="$emit('update:modelValue', ($event.target! as HTMLInputElement).value);">
        </textarea>
        <div class="flex flex-row">
            <div v-if="props.message && typeof props.validator !== 'undefined' && !props.validator.$errors.length"
                class="text-gray-500 my-1 text-sm">{{ props.message
                }}</div>
            <div v-if="typeof props.validator !== 'undefined'" class="flex flex-row"
                v-for="(error, index) of props.validator.$errors" :key="index">
                <div class="text-red-500 my-1 text-sm">{{ error.$message }}</div>
            </div>
        </div>
    </label>
</template>
<style></style>