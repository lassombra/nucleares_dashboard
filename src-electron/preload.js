const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, ...args) => {
      console.log(channel);
      if (channel === 'toggle-fullscreen') {
        ipcRenderer.send(channel, ...args);
      }
    }
  }
});