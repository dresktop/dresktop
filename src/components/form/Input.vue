<script lang="ts" setup>
const props = defineProps(['label', 'modelValue', 'autofocus', 'message', 'validator', 'placeholder', 'readonly']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <label class="block mb-4">
    <span class="font-medium">{{ props.label }}</span>
    <input :readonly="props.readonly" maxlength="128" type="text" :autofocus="props.autofocus" :value="modelValue"
      :placeholder="props.placeholder" @input="$emit('update:modelValue', ($event.target! as HTMLInputElement).value);"
      class="
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
          leading-5
          focus:border-blue-500 
          focus:outline-none
          focus:ring-0 
          focus:border-2
          focus:border-solid" />
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