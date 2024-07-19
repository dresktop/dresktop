import { autoUpdater } from "electron-updater"
// import { dialog, app, BrowserWindow } from 'electron'
import log from 'electron-log/main';
autoUpdater.logger = log;
import { Message } from './Message';

export class Updater {

    /**
     * Closes all the windows and install the 
     * downloaded application
     */
    public async installUpdates() {
        // const windows = BrowserWindow.getAllWindows();
        // windows.forEach(win => win.close());
        // setImmediate(() => {.
        //     app.removeAllListeners("window-all-closed")
        //     autoUpdater.quitAndInstall(true);
        // })
    }

    public async checkForUpdates() {

        return new Promise(async (resolve) => {

            // autoUpdater.checkForUpdatesAndNotify();
            autoUpdater.checkForUpdates();

            autoUpdater.on('update-available', (info: any) => {
                resolve(new Message(true, "New version available", info));
            });

            autoUpdater.on('update-not-available', (_info) => {
                resolve(new Message(false, "No updates available"));
            });

            // ------------------------------------------
            // This will only when the app is signed
            // ------------------------------------------
            // autoUpdater.on('update-downloaded', (info) => {
            //     resolve(new Message(true, "New version available", info));
            // });
        });
    }
}