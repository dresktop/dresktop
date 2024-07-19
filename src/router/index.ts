import { createMemoryHistory, createRouter } from 'vue-router'

import Home from './../pages/Home.vue'
import Environment from './../pages/Environment.vue'
import Settings from './../pages/Settings.vue'
import Groups from './../pages/Groups.vue'

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/environment/:eid',
        name: 'Environment',
        component: Environment
    },
    {
        path: '/groups',
        name: 'groups',
        component: Groups
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router;