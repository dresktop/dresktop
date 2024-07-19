<script setup lang="ts">
import { ref } from 'vue';
import { useAnimate } from '@vueuse/core'

import IconLogo from './IconLogo.vue';
import LogotypeLogo from './LogotypeLogo.vue';

const logo = ref();
const logotype = ref();

animationStart();

function animationStart() {

    // Border animation
    useAnimate(
        logo,
        [
            {
                transform: 'rotate(-120deg)',
                opacity: 0
            },
            {
                transform: 'rotate(240deg)',
                opacity: 1
            }
        ],
        {
            duration: 1000,
            iterations: 1,
            fill: 'forwards',
            easing: 'ease-out',
        },
    );

    // Text animation
    useAnimate(
        logotype,
        [
            {
                opacity: 0
            },
            {
                opacity: 1
            }
        ],
        {
            delay: 0,
            duration: 500,
            // applies styles to its target before and after its execution.
            fill: 'forwards',
            iterations: 1,
            direction: 'alternate',
            easing: 'ease-in',
        },
    )

}
</script>

<template>
    <div class="w-36">
        <IconLogo ref="logo" class="w-24 rotate-[240deg]" :isDark="false" />
        <LogotypeLogo ref="logotype" class="mt-3" :isDark="false" />
    </div>
</template>