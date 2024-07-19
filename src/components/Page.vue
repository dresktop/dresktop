<template>
    <div class="overflow-y-hidden flex flex-col h-full">
        <div class="flex flex-row justify-between items-center mb-3">
            <div class="flex flex-col">
                <div class="text-sm" v-if="$slots.pretitle">
                    <slot name="pretitle" />
                </div>
                <h1 class="text-4xl font-bold w-fit mb-1" v-if="$slots.title">
                    <slot name="title" />
                </h1>
                <div v-if="$slots.nav" class="flex flex-row">
                    <slot name="nav" />
                </div>
            </div>
            <div v-if="$slots.menu">
                <slot name="menu" />
            </div>
        </div>
        <div class="flex flex-col mt-0 w-full h-full overflow-y-hidden">
            <slot name="content" />
        </div>
    </div>
</template>