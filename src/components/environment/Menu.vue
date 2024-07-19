<script lang="ts" setup>
import Tooltip from './../../components/Tooltip.vue';
import Icon from './../../components/Icon.vue';
const props = defineProps(['disabled', 'gitIsEnabled', 'rsyncIsEnabled']);
const emit = defineEmits(['onClick']);
</script>

<template>

    <Tooltip content="Clear log">
        <div @click="!props.disabled ? emit('onClick', 'clear') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="delete" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip content="Cache rebuild">
        <div @click="!props.disabled ? emit('onClick', 'cr') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="clear" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip content="Run cron">
        <div @click="!props.disabled ? emit('onClick', 'cron') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="cron" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip content="Bash script">
        <div @click="!props.disabled ? emit('onClick', 'script') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="script" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip content="PHP code">
        <div @click="!props.disabled ? emit('onClick', 'php') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="php" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip v-if="gitIsEnabled && rsyncIsEnabled" content="Deploy">
        <div @click="!props.disabled ? emit('onClick', 'deploy') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="deploy" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip content="Update">
        <div @click="!props.disabled ? emit('onClick', 'update') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="update" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

</template>

<style></style>