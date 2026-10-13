const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('companion', {


onShowCharacter: (callback) => {
    ipcRenderer.on('show-character', callback);
},

onCharacterArrived: (callback) => {
    ipcRenderer.on('character-arrived', callback);
},

onShowReminder: (callback) => {
    ipcRenderer.on('show-reminder', callback);
},

onHideReminder: (callback) => {
    ipcRenderer.on('hide-reminder', callback);
},

onStartFlying: (callback) => {
    ipcRenderer.on('start-flying', callback);
},

onResetCharacter: (callback) => {
    ipcRenderer.on('reset-character', callback);
},

reminderOK: () => {
    ipcRenderer.send('reminder-ok');
}



});
