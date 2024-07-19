<script lang="ts" setup>
const props = defineProps(['name']);
import { Icon } from '@iconify/vue';
import useIcon from './../composables/icon'
</script>

<template>
    <Icon :icon="useIcon(props.name)" />
</template>
<style></style>