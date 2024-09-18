interface Icon {
    key: string;
    name: string;
}

const icons: Icon[] = [
    {
        key: 'home',
        name: 'ic:baseline-home',
    },
    {
        key: 'projects',
        name: 'uis:apps',
    },
    {
        key: 'groups',
        name: 'iconamoon:badge-fill',
    },
    {
        key: 'plus',
        name: 'mdi:plus',
    },
    {
        key: 'circle',
        name: 'material-symbols:circle',
    },
    {
        key: 'settings',
        name: 'ic:round-settings',
    },
    {
        key: 'left',
        name: 'fa-solid:arrow-left',
    },
    {
        key: 'right',
        name: 'fa-solid:arrow-right',
    },
    {
        key: 'arrowRight',
        name: 'ri:arrow-right-s-line',
    },
    {
        key: 'arrowDown',
        name: 'ic:round-keyboard-arrow-down',
    },
    {
        key: 'arrowUp',
        name: 'ic:round-keyboard-arrow-up',
    },
    {
        key: 'arrowRightBottom',
        name: 'mdi:arrow-right-bottom',
    },
    {
        key: 'configuration',
        name: 'fluent-mdl2:configuration-solid',
    },
    {
        key: 'menu',
        name: 'ph:dots-three-outline-vertical-fill',
    },
    {
        key: 'web',
        name: 'mdi:web',
    },
    {
        key: 'cloud',
        name: 'ic:sharp-cloud',
    },
    {
        key: 'desktop',
        name: 'ion:desktop-outline',
    },
    {
        key: 'edit',
        name: 'ic:baseline-edit',
    },
    {
        key: 'delete',
        name: 'material-symbols:delete',
    },
    {
        key: 'play',
        name: 'bi:play-fill',
    },
    {
        key: 'stop',
        name: 'ph:stop-fill',
    },
    {
        key: 'search',
        name: 'mdi:search',
    },
    {
        key: 'warning',
        name: 'mdi:exclamation',
    },
    {
        key: 'error',
        name: 'octicon:x-16',
    },
    {
        key: 'close',
        name: 'ic:outline-close',
    },
    {
        key: 'alert',
        name: 'fluent:alert-24-filled',
    },
    {
        key: 'alertActive',
        name: 'fluent:alert-on-24-filled',
    },
    {
        key: 'dark',
        name: 'material-symbols:dark-mode',
    },
    {
        key: 'light',
        name: 'material-symbols:light-mode',
    },
    {
        key: 'info',
        name: 'material-symbols:info',
    },
    {
        key: 'network',
        name: 'lucide:network',
    },
    {
        key: "credentials",
        name: 'mdi:account-key',
    },
    {
        key: "dots",
        name: 'mdi:dots-vertical',
    },
    {
        key: "clear",
        name: 'mdi:broom',
    },
    {
        key: "script",
        name: 'mdi:script-text',
    },
    {
        key: "cron",
        name: 'mdi:clock-arrow',
    },
    {
        key: "php",
        name: 'ph:code-bold',
    },
    {
        key: "externalLink",
        name: 'mdi:external-link',
    },
    {
        key: "importDatabase",
        name: 'mdi:database-import',
    },
    {
        key: "exportDatabase",
        name: 'mdi:database-export',
    },
    {
        key: "importConfiguration",
        name: 'mdi:file-import',
    },
    {
        key: "exportConfiguration",
        name: 'mdi:file-export',
    },
    {
        key: "hamburger",
        name: 'mdi:hamburger-menu',
    },
    {
        key: "copy",
        name: 'mdi:content-copy',
    },
    {
        key: "import",
        name: 'fe:import',
    },
    {
        key: "help",
        name: 'material-symbols:help-outline',
    },
    {
        key: "update",
        name: 'ic:baseline-system-update-alt',
    },
    {
        key: "sync",
        name: 'mdi:sync',
    },
    {
        key: "deploy",
        name: 'grommet-icons:deploy',
    },
    {
        key: 'switch',
        name: 'octicon:arrow-switch-16'
    },
    {
        key: 'lock',
        name: 'material-symbols:lock'
    },
    {
        key: 'logRunning',
        name: 'mdi:checkbox-blank-circle-outline'
    },
    {
        key: 'logFailed',
        name: 'mdi:close-circle'
    },
    {
        key: 'logPassed',
        name: 'mdi:check-circle'
    },
    {
        key: 'refresh',
        name: 'mdi:refresh'
    }
];

export default function useIcon(key: string): string {
    const icon = icons.find((icon: Icon) => icon.key == key);

    return icon?.name ? icon.name : 'cil:happy';
}