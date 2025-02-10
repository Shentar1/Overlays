const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('toolBarFunctions',{
    close: () => ipcRenderer.send('mainFunctions','close'),
    min: () => ipcRenderer.send('mainFunctions','minimize')
});
closeProgram = function(){
    ipcRenderer.send('mainFunctions',('close'));
}
minimize = function(){
    ipcRenderer.send('mainFunctions',('minimize'));
}