<script lang="ts" setup>
import { ref, toRaw, onMounted, computed } from 'vue';
import useInternationalization from '../../composables/translation';
import { useApplicationStore } from './../../store/application';
import EditPatchModal from './../modals/EditPatchModal.vue';
import EditModuleModal from './../modals/EditModuleModal.vue';
import Icon from './../../components/Icon.vue';
import ButtonIcon from './../../components/ButtonIcon.vue';
import Card from './../Card.vue';
import Button from './../Button.vue';
import Checkbox from './../form/Checkbox.vue';

const applicationStore = useApplicationStore();
const props = defineProps(['project', 'environment']);

const composer = ref();
const patches = ref([]);
const pluginIsInstalled = ref(false);
const patchDisplayed = ref('');
const showEditPatchModal = ref(false);
const showEditModuleModal = ref(false);
const selectedPatch = ref();
const selectedModule = ref();
const environment = computed(() => props.environment);
const project = computed(() => props.project);


async function onRunComposerInstall() {

    console.log("== onRunComposerInstall ==", patches.value);

    const result = await window.backendAPI.runCommand("composer update --lock && composer install", toRaw(props.project), toRaw(props.environment));
    console.log("result", result);

    // let modules = [];

    // for (let module in patches.value) {
    //     modules.push(module);
    // }

    // console.log(modules.join(" "));

    // if (modules.length) {
    //     const result = await window.backendAPI.runCommand("composer update " + modules.join(" "), toRaw(props.project), toRaw(props.environment));
    //     console.log("result", result);
    // }
}

async function installPlugin() {

    const install = !toRaw(pluginIsInstalled.value);

    console.log("== installPlugin ==", install);

    if (install) {
        applicationStore.setLoader(true, useInternationalization('loaders.installing_patches_plugin').value);
        const installCommand = `composer config --no-plugins allow-plugins.cweagans/composer-patches true && composer require cweagans/composer-patches`;
        const installed = await window.backendAPI.runCommand(installCommand, toRaw(props.project), toRaw(props.environment));
        console.log("== installed ==", installed);
    } else {
        applicationStore.setLoader(true, useInternationalization('loaders.uninstalling_patches_plugin').value);
        const uninstallCommand = `composer remove cweagans/composer-patches`;
        const uninstalled = await window.backendAPI.runCommand(uninstallCommand, toRaw(props.project), toRaw(props.environment));
        console.log("== uninstalled ==", uninstalled);
    }
    applicationStore.setLoader(false, '');
}

async function onModuleClick(moduleName: string) {
    console.log("onModuleClick", moduleName)

    if (patchDisplayed.value == moduleName) {
        patchDisplayed.value = "";
    } else {
        patchDisplayed.value = moduleName;
    }

    selectedModule.value = moduleName;
}

function onClickModuleDelete(moduleName: string) {
    console.log("==== onClickModuleDelete ====", moduleName);

    selectedModule.value = "";
    showEditModuleModal.value = true;
}

function onClickModuleEdit(moduleName: string) {
    console.log("==== onClickModuleEdit1 ====", moduleName);
    console.log("==== onClickModuleEdit2 ====", patches.value);

    selectedModule.value = moduleName;
    showEditModuleModal.value = true;
}

function onClickPatchDelete(moduleName: string) {
    console.log("==== onClickPatchDelete ====", moduleName);

    selectedPatch.value = "";
    showEditPatchModal.value = true;
}

function onClickPatchEdit(patchName: string) {
    console.log("==== onClickPatchEdit1 ====", patchName);
    console.log("==== onClickPatchEdit2 ====", patches.value[patchName]);

    selectedPatch.value = patchName;
    showEditPatchModal.value = true;
}

onMounted(async () => {

    // Gets the content of the composer file
    const result = await window.backendAPI.runCommand("cat composer.json", toRaw(props.project), toRaw(props.environment));

    if (result.success) {

        // Convert from string to object
        composer.value = JSON.parse(result.message);

        // Checks if the plugin required for the patches functionality is installd
        pluginIsInstalled.value = typeof composer.value.require['cweagans/composer-patches'] !== 'undefined' ? true : false;

        // Checks if the plugin required for the patches functionality is installd
        patches.value = typeof composer.value.extra['patches'] !== 'undefined' ? composer.value.extra['patches'] : [];

    } else {
    }
});

</script>

<template>

    <EditModuleModal v-model:show="showEditModuleModal" :environment="environment" :project="project" :patches="patches"
        :selectedModule="selectedModule" />

    <EditPatchModal v-model:show="showEditPatchModal" :environment="environment" :project="project" :patches="patches"
        :selectedModule="selectedModule" :selectedPatch="selectedPatch" />

    <div class="flex flex-row gap-4 h-full">
        <Card classes="h-full">
            <template #title>
                <h2 class="mb-2 text-xl font-bold"> {{ useInternationalization('toolbar.patch') }} </h2>
            </template>
            <template #content>
                <Checkbox v-model="pluginIsInstalled" @click="installPlugin"
                    :label="useInternationalization('labels.patches_plugin')" />

                <div class="my-4">
                    <template v-for="(patchList, _moduleName) in patches" :key="_moduleName">
                        <div class="border-b border-slate-200 dark:border-slate-900 select-none">
                            <!-- {{ patchList }} -->

                            <div @click="onModuleClick(_moduleName)" class="
                            flex
                            flex-row
                            justify-between
                            justify-items-center
                            items-center
                            py-3
                            px-2
                            transition-all
                            ease-out
                            hover:bg-blue-50 dark:hover:bg-slate-900
                            hover:text-blue-500
                            cursor-pointer">
                                <div class="flex flex-row justify-items-center items-center">
                                    <Icon :name="true ? 'arrowDown' : 'arrowRight'" class="mr-2" />
                                    <span class="font-normal">{{ _moduleName }}</span>
                                </div>
                                <div class="flex flex-row gap-1 items-center">

                                    <ButtonIcon v-on:click.stop.prevent="onClickModuleEdit(_moduleName)" icon="edit"
                                        type="tertiary" />
                                    <ButtonIcon v-on:click.stop="onClickModuleDelete(_moduleName)" icon="delete"
                                        type="tertiary" />
                                </div>
                            </div>
                            <div v-if="patchDisplayed == _moduleName">
                                <template v-for="(patchUrl, patchDescription) in patchList">

                                    <div class="
                                    flex flex-row justify-between justify-items-center items-center 
                                    py-2 pl-14 pr-2
                                    hover:bg-blue-50 dark:hover:bg-slate-900
                                    hover:text-blue-500
                                    cursor-pointer">
                                        <div class="
                                        flex 
                                        flex-row 
                                        justify-items-center 
                                        items-center">
                                            <Icon name="arrowRightBottom" class="mr-3" />
                                            <div>
                                                <div class="font-normal"> {{ patchDescription }} </div>
                                                <div class="font-normal text-sm"> {{ patchUrl }} </div>
                                            </div>
                                        </div>
                                        <div class="flex flex-row gap-1">
                                            <ButtonIcon v-on:click.prevent="onClickPatchEdit(patchDescription)"
                                                icon="edit" type="tertiary" />
                                            <ButtonIcon v-on:click.prevent="onClickPatchDelete(patchDescription)"
                                                icon="delete" type="tertiary" />
                                        </div>
                                    </div>

                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
            <template #footer>
                <Button :text="useInternationalization('buttons.run_composer_install')" @click="onRunComposerInstall();"
                    :disabled="!pluginIsInstalled" class="mr-2 disabled:opacity-75" />
            </template>
        </Card>
    </div>
</template>
<style></style>