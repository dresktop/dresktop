<script lang="ts" setup>
const props = defineProps(['text', 'type', 'icon', 'size']);
import Icon from './../components/Icon.vue';

const type = !props.type ? 'primary' : props.type;
const size = !props.size ? 'basis' : props.size;

const types: any = {
    primary: 'border border-blue-500 text-white bg-blue-500 hover:bg-blue-600',
    secondary: 'border border-blue-500 text-blue-500 bg-white hover:bg-white hover:text-blue-600 hover:border-blue-600 dark:bg-blue-950 dark:text-blue-400',
    tertiary: 'border border-transparent text-slate-500 bg-transparent hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-950',
};

const sizes: any = {
    basis: 'px-3 h-9 text-basis',
    sm: 'px-2 h-7 text-sm',
};

</script>

<template>
    <button type="button" class="flex items-center rounded-full text-center flex-row"
        :class="types[type] + ' ' + sizes[size]">
        <Icon v-if="props.icon" :name="props.icon" />
    </button>
</template>
<style></style>