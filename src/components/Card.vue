<script lang="ts" setup>
const props = defineProps(['classes', 'color', 'colorDark']);

</script>

<template>
    <div
        :class="`card flex flex-col w-full rounded shadow-sm ${props.color ? props.color : 'bg-white'} ${props.colorDark ? props.colorDark : 'dark:bg-slate-800'} ${props.classes}`">
        <div class="flex flex-col p-5 overflow-y-auto h-full gap-4">
            <div v-if="$slots.title || $slots.menu" class="flex flex-row justify-between items-center">
                <div class="text-xl font-medium">
                    <slot name="title" />
                </div>
                <div v-if="$slots.menu" class="flex flex-row-reverse gap-2">
                    <slot name="menu" />
                </div>
            </div>
            <div class="flex flex-col h-full overflow-y-auto">
                <slot name="content" />
            </div>
        </div>
        <div v-if="$slots.footer" class="px-4 pb-4 text-right rounded-b flex flex-row">
            <slot name="footer" />
        </div>
    </div>
</template>

<style></style>