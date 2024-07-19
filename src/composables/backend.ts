import { toRaw } from 'vue';

export default function useBackend() {

    const checkRsyncIsActive = async (project: any, environment: any) => {
        const command = `rsync --version`
        let result = await window.backendAPI.runCommand(command, toRaw(project), toRaw(environment));

        // Rsync in desktop should be always enabled.
        return environment.type == 'desktop' || result.success;
    };

    return { checkRsyncIsActive };
}