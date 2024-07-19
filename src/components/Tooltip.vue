<script lang="ts" setup>
import { ref } from 'vue'
const props = defineProps(['content']);

const show = ref(false);
const wrapper = ref()
const tooltip = ref()

function onMouseOver() {

    // Gets the dimentions of the wrapper
    let wrapperDimentions = wrapper.value.getBoundingClientRect();

    // Gets the dimentions of the tooltip
    let tooltipDimentions = tooltip.value.getBoundingClientRect();

    // Checks tooltip is being displayed
    if (tooltipDimentions.width) {
        tooltip.value.style.left = (wrapperDimentions.left - (tooltipDimentions.width / 2) + (wrapperDimentions.width / 2)) + "px"
        tooltip.value.style.top = (wrapperDimentions.top - (tooltipDimentions.height) - 10) + "px"
    }

    show.value = true;
}

function onMouseLeave() {
    show.value = false;
}

</script>

<template>
    <div ref="wrapper" @mouseover="onMouseOver" @mouseleave="onMouseLeave" class="relative block">
        <div ref="tooltip" v-show="show"
            class="fixed bg-gray-700 text-white text-xs py-1 px-2 w-fit max-w-72 rounded text-center">
            {{ props.content }}
        </div>
        <slot></slot>
    </div>
</template>
<style></style>