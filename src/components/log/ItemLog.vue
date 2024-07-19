<script lang="ts" setup>
import Icon from './../../components/Icon.vue';
import StatusLog from './StatusLog.vue';
const props = defineProps(['item']);

async function copyToClipboard(text: string) {
    await window.backendAPI.copyToClipboard(text);
}

</script>

<template>
    <Transition enter-active-class="duration-200 ease-out" enter-from-class="transform opacity-0"
        enter-to-class="opacity-100" leave-active-class="duration-200 ease-out" leave-from-class="opacity-100"
        leave-to-class="transform opacity-0">
        <div
            class="flex flex-col gap-0 hover:bg-[#0B0F25] dark:hover:bg-[#0d1219] p-2 rounded [&_.icon]:hover:text-blue-200">
            <div class="font-normal text-blue-300 flex flex-row justify-between">
                <div class="flex flex-row items-start">
                    <StatusLog :status="props.item.result.success" class="shrink-0" />
                    <span class="text-sm font-extralight break-all whitespace-pre-wrap font-mono">{{
                        props.item.command
                        }}</span>
                </div>
                <div>
                    <div @click="copyToClipboard(props.item.result.message)" class="
                                                                    cursor-pointer 
                                                                    rounded 
                                                                    p-1 
                                                                    hover:bg-slate-700 
                                                                    dark:hover:bg-slate-800 
                                                                    ">
                        <Icon name="copy" class="icon h-4 w-4 text-slate-800 dark:text-slate-950" />
                    </div>
                </div>
            </div>
            <div class="text-sm mt-3 mb-2 font-thin break-all whitespace-pre-wrap font-mono"
                v-html="props.item.result.message.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/(?:\r\n|\r|\n)/g, '<br>')">
            </div>
            <div class="text-xs text-left text-blue-300 font-light ">
                Executed on {{ new Date(props.item.executed).toLocaleString() }}
            </div>
        </div>
    </Transition>
</template>
<style></style>