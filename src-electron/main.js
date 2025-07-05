const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');

let myWindow = null

const createWindow = () => {

    const win = new BrowserWindow({
        width: 800,
        height: 600
    })
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000');
    } else {
        win.loadFile(path.join(__dirname, 'nextBuild', 'index.html'));
        // win.setMenuBarVisibility(false);
        // win.removeMenu();
    }
    return win;
}

const gotTheLock = app.requestSingleInstanceLock(additionalData)
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
        // Print out data received from the second instance.
        console.log(additionalData)

        // Someone tried to run a second instance, we should focus our window.
        if (myWindow) {
            if (myWindow.isMinimized()) myWindow.restore()
            myWindow.focus()
        }
    });
    app.whenReady().then(() => {
        protocol.handle('file', (request) => {
            const url = request.url;

            const startOfNext = url.indexOf("/_next/");
            if (startOfNext == -1) {
                // Do not modify the request
                return net.fetch(url, {bypassCustomProtocolHandlers: true});
            }
            // Until nextjs can output static files that can be loaded from a directory (see https://github.com/vercel/next.js/discussions/32216)
            // we can either copy our files into the root directory or do this interception here to add the out directory.
            const new_url = [url.slice(0, "file:///".length), path.join(__dirname, 'nextBuild'), url.slice(startOfNext)].join('');
            return net.fetch(new_url, {bypassCustomProtocolHandlers: true});
        });
        myWindow = createWindow()
    })

}
