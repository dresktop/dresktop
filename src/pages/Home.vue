<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProjectStore } from './../store/project';
import { useGroupStore } from './../store/group';

// Modals
import NewProjectModal from './../components/modals/NewProjectModal.vue';

// Components
import Page from './../components/Page.vue'
import Button from './../components/Button.vue';
import Card from './../components/Card.vue';
import ProjectBlock from './../components/ProjectBlock.vue';
import Input from './../components/form/Input.vue';
import Select from './../components/form/Select.vue';

// Stores
const projectStore = useProjectStore();
const groupStore = useGroupStore();

const projects = ref([]);
const searchInput = ref("");
const searchSelect = ref({ id: 0 });
const showModalNewProject = ref(false);

const computedProjects = computed(function () {

  return projects.value

    // First filter by the group id. If there's not id, it means all groups will be returned
    .filter((project: any) => (!searchSelect.value.id || (project.group_id == searchSelect.value.id)))

    // Then filters by the project name
    .filter((project: any) => project.name.toLowerCase().includes(searchInput.value.toLowerCase()))

    // Older environments first
    .reverse();
});

onMounted(async () => {
  await groupStore.load();
  projects.value = projectStore.getProjects;
});

</script>

<template>

  <!-- Modal New Project -->
  <NewProjectModal v-model:show="showModalNewProject" />

  <Page>
    <template #title>
      <div class="flex flex-row items-center">
        <span>Applications</span>
      </div>
    </template>
    <template #nav>
    </template>
    <template #menu>
      <div class="flex flex-row space-x-1 items-center">
        <Button @click="showModalNewProject = true" text="New Application" type="tertiary" icon="plus" class="w-full" />
      </div>
    </template>
    <template #content>
      <Card class="bg-white h-full">
        <template #title>
          <div class="flex flex-row items-center gap-4">
            <Input class="font-light mb-0 text-sm " v-model="searchInput" placeholder="&#x1F50E; Search project" />
            <Select class="font-light mb-0 text-sm [&>select]:py-[9px]" :items="groupStore.getGroups"
              v-model:selected="searchSelect" :all="true" />
          </div>
        </template>
        <template #content>
          <ProjectBlock v-if="computedProjects.length" :projects="computedProjects" />
          <div v-else>
            Could not find any project. <span
              class="hover:bg-blue-100 dark:hover:bg-blue-900 dark:hover:text-blue-100 font-semibold" role="button"
              @click="showModalNewProject = true">Add new application</span>.
          </div>
        </template>
      </Card>
    </template>
  </Page>
</template>