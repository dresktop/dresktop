<script lang="ts" setup>
const props = defineProps(['name', 'color', 'textColor']);
</script>

<template>
    <span class="h-fit text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded"
        :style="`background-color: ${$props.color}; color: ${$props.textColor}`">{{
            props.name }}</span>
</template>
<style></style>