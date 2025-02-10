const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('node:path');
const main = require('./index.js');
var win;
function createWindow(){
    win = new BrowserWindow({
      width: 1000,
      height: 600,
      frame:false,
      resizable:false,
      maximizable:false,
      minimizable:false,
      roundedCorners:false,
      thickFrame:false,
      webPreferences: {
        preload: path.join(__dirname, './public/javascripts/indexPreload.js')
      }
      
    })
    win.loadURL('http://localhost:' + main.globalSettings.port + '/kljejgsrbkijgbjhkjdflhgblkjadhfkglhdfkgfhlzfkhgdlzg');
    return win;
}
app.whenReady().then(()=>{
  win = createWindow();
  win.webContents.setIgnoreMenuShortcuts(true);
  win.on('closed',()=>{
    main.writeFile(main.settingsPath,'\\globalSettings.json',main.globalSettings)
    if(process.platform != 'darwin'){
        app.quit();
      }
  });
  ipcMain.on('mainFunctions', (e, button)=>{
    switch(button){
      case 'close':
        win.close();
        break;
      case 'minimize':
        win.minimize();
    }
  });
})
