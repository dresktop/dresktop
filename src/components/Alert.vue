<script setup lang="ts">
import Icon from './../components/Icon.vue';
const props = defineProps(['show', 'title', 'text', 'type', 'icon', 'closable']);
const emit = defineEmits(['update:show']);

const types = {
    success: {
        background: 'bg-green-400',
        border: 'border-green-200',
        icon: 'text-white',
        text: 'text-white',
        closeHover: 'hover:bg-green-300',
    },
    info: {
        background: 'bg-blue-400',
        border: 'border-blue-200',
        icon: 'text-white',
        text: 'text-white',
        closeHover: 'hover:bg-blue-300',
    },
    warning: {
        background: 'bg-orange-400',
        border: 'border-orange-200',
        icon: 'text-white',
        text: 'text-white',
        closeHover: 'hover:bg-orange-300',
    },
    error: {
        background: 'bg-red-400',
        border: 'border-red-200',
        icon: 'text-white',
        text: 'text-white',
        closeHover: 'hover:bg-red-300',
    },
};

// @ts-ignore
const classesWrapper = `flex gap-2 flex-row justify-between rounded py-3 pl-4 pr-2 border ${types[props.type].background} ${types[props.type].border} ${types[props.type].text}`

// @ts-ignore
const classesIcon = `shrink-0 m-2 h-5 w-5 ${types[props.type].icon}`;

// @ts-ignore
const classesClose = `ml-auto h-fit w-fit p-1rounded cursor-pointer ${types[props.type].closeHover}`;
</script>

<template>
    <div v-if="props.show" :class="classesWrapper">
        <Icon name="alert" :class="classesIcon" />
        <div class="flex flex-col p-1">
            <div v-if="props.title">{{ props.title }}</div>
            <div v-if="props.text" v-html="props.text"></div>
        </div>
        <div class="flex items-center ml-auto">
            <div v-if="props.closable" @click="emit('update:show', false)" :class="classesClose">
                <Icon name="close" />
            </div>
        </div>
    </div>
</template>