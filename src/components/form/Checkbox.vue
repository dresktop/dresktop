<script lang="ts" setup>
import { reactive } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'

const props = defineProps(['label', 'modelValue', 'autofocus', 'message', 'validator', 'disabled']);
const emit = defineEmits(['update:modelValue']);

const state = reactive({
    val: false,
})

const rules = {
    val: { required },
}

const v$ = useVuelidate(rules, state)

</script>

<template>
    <div class="block">
        <label class="flex items-center cursor-pointer">
            <input id="default-checkbox" type="checkbox" :autofocus="props.autofocus" :checked="modelValue"
                :disabled="props.disabled"
                @change="$emit('update:modelValue', ($event.target! as HTMLInputElement).checked); v$.val.$model = ($event.target! as HTMLInputElement).checked"
                class="
                    cursor-pointer
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
            <span class="ms-2">{{ props.label }}</span>
        </label>
        <div class="flex flex-row ">
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