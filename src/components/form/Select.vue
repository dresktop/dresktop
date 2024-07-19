<script lang="ts" setup>
import { ref, computed } from 'vue';
const props = defineProps(['label', 'items', 'selected', 'all']);
const emit = defineEmits(['update:selected']);
const selected = ref({
    name: ""
});

const items = computed(() => props.items);
const all = computed(() => props.all);

function onChange(event: any) {
    const selectedValue = JSON.parse(event.target.value);
    emit('update:selected', selectedValue)
}

</script>

<template>
    <label class="block mb-4">
        <span class="font-medium">{{ props.label }}</span>
        <select @change="onChange" class="
            mt-1 
            p-2
            pr-4
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
            focus:border-solid">

            <option v-if="all == true" value="{}">All</option>
            <template v-for="(item, _index) in items" :key="_index">
                <option :selected="selected.name == item.name" :value="JSON.stringify(item)">{{ item.name }}
                </option>
            </template>
        </select>
    </label>
</template>