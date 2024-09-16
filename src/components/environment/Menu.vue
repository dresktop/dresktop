<script lang="ts" setup>
import useInternationalization from '../../composables/translation';
import Tooltip from './../../components/Tooltip.vue';
import Icon from './../../components/Icon.vue';
const props = defineProps(['disabled', 'gitIsEnabled', 'rsyncIsEnabled']);
const emit = defineEmits(['onClick']);
</script>

<template>

    <Tooltip :content="useInternationalization('toolbar.clear_log')">
        <div @click="!props.disabled ? emit('onClick', 'clear') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="delete" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip :content="useInternationalization('toolbar.cache_rebuild')">
        <div @click="!props.disabled ? emit('onClick', 'cr') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="clear" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip :content="useInternationalization('toolbar.run_cron')">
        <div @click="!props.disabled ? emit('onClick', 'cron') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="cron" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip :content="useInternationalization('toolbar.bash_script')">
        <div @click="!props.disabled ? emit('onClick', 'script') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="script" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip :content="useInternationalization('toolbar.php_code')">
        <div @click="!props.disabled ? emit('onClick', 'php') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="php" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip :content="useInternationalization('toolbar.deploy')">
        <div @click="!props.disabled ? emit('onClick', 'deploy') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="deploy" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

    <Tooltip :content="useInternationalization('toolbar.update')">
        <div @click="!props.disabled ? emit('onClick', 'update') : null"
            class="cursor-pointer rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-800"
            :class="props.disabled ? 'opacity-50' : ''">
            <Icon name="update" class="h-5 w-5 text-white" />
        </div>
    </Tooltip>

</template>