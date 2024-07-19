<script lang="ts" setup>
const props = defineProps(['text', 'type', 'icon', 'iconRight', 'size']);
import Icon from './../components/Icon.vue';

const type = !props.type ? 'primary' : props.type;
const size = !props.size ? 'basis' : props.size;

const types: any = {
    primary: 'border border-blue-500 text-white bg-blue-500 hover:bg-blue-600',
    secondary: 'border border-blue-500 text-blue-500 bg-white hover:bg-white hover:text-blue-600 hover:border-blue-600 dark:hover:bg-blue-950 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-400',
    tertiary: 'border border-transparent text-blue-600 dark:text-blue-200 bg-transparent hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-blue-200',
};

const sizes: any = {
    basis: 'px-3 h-9 text-basis',
    sm: 'px-2 h-7 text-sm',
};

</script>

<template>
    <button type="button" class="flex items-center rounded text-center flex-row"
        :class="types[type] + ' ' + sizes[size] + ' ' + 'disabled:opacity-50'">
        <Icon v-if="props.icon && !props.iconRight" :name="props.icon" :class="props.size == 'sm' ? 'mr-1' : 'mr-2'" />
        <span>{{ text }}</span>
        <Icon v-if="props.icon && props.iconRight" :name="props.icon" :class="props.size == 'sm' ? 'ml-1' : 'ml-2'" />
    </button>
</template>
<style></style>