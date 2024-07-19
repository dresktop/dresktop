<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useAnimate } from '@vueuse/core'
import IconLogo from './../components/logo/IconLogo.vue';
import LogotypeLogo from './../components/logo/LogotypeLogo.vue';

const props = defineProps(['message', 'status']);

const logo = ref();
const logotype = ref();
const showAnimationLogotype = ref(false);
const animationStartConfig = ref({
    playState: ''
});

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

    animationSpin();
}

function animationSpin() {

    // Border animation
    const { playState } = useAnimate(
        logo,
        [
            {
                transform: 'rotate(-120deg)',
            },
            {
                transform: 'rotate(240deg)',
            }
        ],
        {
            duration: 1000,
            fill: 'forwards',
            easing: 'ease-in-out',
        },
    );

    // @ts-ignore
    animationStartConfig.value.playState = playState;
}

function animationText() {

    showAnimationLogotype.value = true;

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
            fill: 'forwards',
            iterations: 1,
            direction: 'alternate',
            easing: 'ease-in',
        },
    )
}

function animationFinish() {

    useAnimate(
        logotype,
        [
            {
                opacity: 1
            },
            {
                opacity: 0
            }
        ],
        {
            delay: 0,
            duration: 500,
            fill: 'forwards',
            iterations: 1,
            direction: 'alternate',
            easing: 'ease-in',
        },
    );

    useAnimate(
        logo,
        [
            {
                transform: 'rotate(-120deg)',
                opacity: 1
            },
            {
                transform: 'rotate(240deg)',
                opacity: 0
            }
        ],
        {
            delay: 500,
            duration: 1000,
            iterations: 1,
            fill: 'forwards',
            easing: 'ease-in-out',
        },
    );
}

watch(() => props.status, (value) => {

    if (value == 'finished') {
        animationFinish();
    }
});

// The idea with this watch is keep listening as soon as the 
// animation finishes one spin. So as soon as the animation finishes
// and the status is intro, the spin will look more natural
watch(() => animationStartConfig.value.playState, (value) => {

    // Checks the animation spin has finished
    if (value == 'finished') {

        if (props.status == 'loading' || props.status == 'completed') {
            animationSpin();
        }

        if (props.status == 'intro') {
            animationText();
        }
    }
});
</script>

<template>
    <div class="h-full w-full fixed left-0 top-0 bg-blue-500 z-[100] flex justify-center">
        <div class="text-white text-xl top-1/3 absolute">
            <div class="items-center w-52 text-center flex flex-col">
                <IconLogo ref="logo" class="w-36" :isDark="true" />
                <div v-if="props.status == 'loading' || props.status == 'completed'" class="my-4 font-normal"
                    v-html="props.message"></div>
                <LogotypeLogo v-if="showAnimationLogotype" ref="logotype" class="my-4 opacity-0" :isDark="true" />
            </div>
        </div>
    </div>
</template>

<style></style>