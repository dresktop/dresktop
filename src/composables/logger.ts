import { ref, onMounted, onUnmounted } from 'vue';
import { nanoid } from 'nanoid';
import { useLoggerStore } from './../store/logger';

export default function useLogger() {

    interface OutputInterface {
        identifier?: string;
        command: string;
        result: {
            message: string;
            success: boolean;
        };
        executed: string;
    };

    // Displays the output messages in the log output
    const outputLog = ref<OutputInterface[]>([]);

    const loggerStore = useLoggerStore();

    let listener: any;

    onMounted(async () => {

        // This will keep listening the backend messages
        listener = (_event: any, message: any) => {

            // The returned message will have an identifier that matches the output entry
            // that needs to be updated
            let outputCommand = outputLog.value.find(command => command.identifier == message.identifier);

            if (outputCommand) {
                outputCommand.result.message += message.data;
            }
        };

        window.ipcRenderer.on('on-logger-response', listener);
    });

    onUnmounted(() => {
        if (listener) {
            window.ipcRenderer.off('on-logger-response', listener);
        }
    });

    // This function will get the log entries for an environment
    const initLog = async (environmentId: number): Promise<void> => {

        await loggerStore.load(environmentId);

        // Gets and parses the logs from the store
        outputLog.value = loggerStore.getLogs.map(function (log: any) {
            return {
                identifier: log.identifier,
                command: log.command,
                result: {
                    message: log.result,
                    success: log.status,
                },
                executed: log.executed,
            }
        });
    };

    // Saves the log in the store
    const saveLog = async (command: string, result: any, environmentId: number): Promise<string> => {

        // This identifier will be used to identify the message when it comes back from the backend
        const identifier = nanoid();

        const log = {
            identifier: identifier,
            command: command,
            result: result,
            executed: new Date().toISOString()
        };

        outputLog.value.push(log);

        loggerStore.save(log, environmentId);

        return identifier;
    };

    // When the command finishes, this function will be called to save 
    // the result in the database and update the store
    const updateLogStatus = async (identifier: string, result: any): Promise<void> => {

        let command = outputLog.value.find(command => command.identifier == identifier);

        // @ts-ignore
        command.result.success = result.success;

        loggerStore.update(result, identifier);
    }

    return { saveLog, updateLogStatus, initLog, outputLog };
}