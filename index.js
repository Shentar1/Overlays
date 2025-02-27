const createError = require('http-errors');
const fs = require('fs');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {Server} = require('socket.io');
const http = require('http');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const fuelCalculatorRouter = require('./routes/FuelCalculator');
const relativeRouter = require('./routes/relative');
const inputDisplayRouter = require('./routes/inputDisplay');
const inputTelemetryRouter = require('./routes/inputTelemetry');
const standingsRouter = require('./routes/standings');
const trackMapRouter = require('./routes/trackMap');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const iRacingTelemetry = require('./iRacingTelemetry');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
//define window variables up here so they don't get lost
//and so they can be edited at will
var fuelCalculatorWindow;
var relativeWindow;
var inputDisplayWindow;
var inputTelemetryWindow;
var standingsWindow;
var trackMapWindow;
//define paths for use in file creation
var appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
var settingsPath = path.join(appDataPath, '/iRacingOverlays/Settings')
var logsPath = path.join(appDataPath,'/iRacingOverlays/logs');

//Define global and overlay settings with default values for initial launch
//this ensures that the program works as intended right away
var globalSettings={
  port:27227,
  hideWhenInGarage:false,
}
var fuelCalculatorSettings ={
  x:200,
  y:200,
  locked:false,
  enabled:false,
  header1:"-none-",
  header2:"-none-",
  header3:"-none-",
  footer1:"-none-",
  footer2:"-none-",
  footer3:"-none-",
  zoom:10,
};
var relativeSettings = {
  x:200,
  y:200,
  locked:false,
  enabled:false,
  rowsAhead:3,
  rowsBehind:3,
  showCarBrand:false,
  show_iRating:false,
  showTyres:false,
  header1:"-none-",
  header2:"-none-",
  header3:"-none-",
  footer1:"-none-",
  footer2:"-none-",
  footer3:"-none-",
  zoom:10,
};
var inputDisplaySettings = {
  x:200,
  y:200,
  locked:false,
  enabled:false,
  zoom:10
}
var inputTelemetrySettings = {
  x:200,
  y:200,
  locked:false,
  enabled:false,
  zoom:10,
  time:4
}
var standingsSettings={
  x:200,
  y:200,
  locked:false,
  enabled:false,
  showCarBrand:false,
  show_iRating:false,
  showTyres:false,
  zoom:10
}
var trackMapSettings = {
  x:200,
  y:200,
  locked:false,
  enabled:false,
  zoom:10
}
//overriding boolean to let the user hide all the overlays at will
var globalHide = false;

//function to let files to be created dynamically.
//this function reduces code length by created a structure for file creation that is easily used when 
//the application closes or encounters an error
function writeFile(filepath,filename, settings){
  if(fs.existsSync(filepath+'\\'+filename)){
    var data = JSON.stringify(settings);
    fs.writeFileSync(filepath+filename,data);
  }else{
    var x = fs.mkdirSync(filepath,{recursive:true})
    var data = JSON.stringify(settings);
    fs.writeFileSync(filepath+'\\'+filename,data);
  }
}
//function that lets us load in saved settings
function readSettingsFile(filepath){
  data = fs.readFileSync(filepath);
  return JSON.parse(data);
}
//iteratively find settings files and apply them to the current runtime
//so users don't have to configure everything time and time again
if(fs.existsSync(settingsPath+'\\globalSettings.json')){
  settingsFile = readSettingsFile(settingsPath+'\\globalSettings.json');
  settingsFile.port != undefined?globalSettings.port = settingsFile.port:0;
  settingsFile.hideWhenInGarage != undefined?globalSettings.hideWhenInGarage = settingsFile.hideWhenInGarage:0;
}
if(fs.existsSync(settingsPath + '\\fuelCalculatorSettings.json')){
  settingsFile = readSettingsFile(settingsPath + '\\fuelCalculatorSettings.json');
  settingsFile.locked != undefined?fuelCalculatorSettings.locked = settingsFile.locked:0;
  settingsFile.enabled != undefined?fuelCalculatorSettings.enabled = settingsFile.enabled:0;
  settingsFile.x!= undefined?fuelCalculatorSettings.x= settingsFile.x:0;
  settingsFile.y != undefined?fuelCalculatorSettings.y = settingsFile.y:0;
  settingsFile.header1 != undefined? fuelCalculatorSettings.header1 = settingsFile.header1:0;
  settingsFile.header2 != undefined? fuelCalculatorSettings.header2 = settingsFile.header2:0;
  settingsFile.header3 != undefined? fuelCalculatorSettings.header3 = settingsFile.header3:0;
  settingsFile.footer1 != undefined? fuelCalculatorSettings.footer1 = settingsFile.footer1:0;
  settingsFile.footer2 != undefined? fuelCalculatorSettings.footer2 = settingsFile.footer2:0;
  settingsFile.footer3 != undefined? fuelCalculatorSettings.footer3 = settingsFile.footer3:0;
  settingsFile.zoom != undefined?fuelCalculatorSettings.zoom = settingsFile.zoom:0;
}
if(fs.existsSync(settingsPath+'\\relativeSettings.json')){
  settingsFile = readSettingsFile(settingsPath + '\\relativeSettings.json');
  settingsFile.locked != undefined?relativeSettings.locked = settingsFile.locked:0;
  settingsFile.enabled != undefined?relativeSettings.enabled = settingsFile.enabled:0;
  settingsFile.x != undefined?relativeSettings.x = settingsFile.x:0;
  settingsFile.y != undefined?relativeSettings.y = settingsFile.y:0;
  settingsFile.rowsAhead != undefined?relativeSettings.rowsAhead = settingsFile.rowsAhead:0;
  settingsFile.rowsBehind != undefined?relativeSettings.rowsBehind = settingsFile.rowsBehind:0;
  settingsFile.showCarBrand != undefined?relativeSettings.showCarBrand = settingsFile.showCarBrand:0;
  settingsFile.show_iRating != undefined?relativeSettings.show_iRating = settingsFile.show_iRating:0;
  settingsFile.showTyres != undefined?relativeSettings.showTyres = settingsFile.showTyres:0;
  settingsFile.header1 != undefined? relativeSettings.header1 = settingsFile.header1:0;
  settingsFile.header2 != undefined? relativeSettings.header2 = settingsFile.header2:0;
  settingsFile.header3 != undefined? relativeSettings.header3 = settingsFile.header3:0;
  settingsFile.footer1 != undefined? relativeSettings.footer1 = settingsFile.footer1:0;
  settingsFile.footer2 != undefined? relativeSettings.footer2 = settingsFile.footer2:0;
  settingsFile.footer3 != undefined? relativeSettings.footer3 = settingsFile.footer3:0;
  settingsFile.zoom != undefined? relativeSettings.zoom = settingsFile.zoom:0;
}
if(fs.existsSync(settingsPath+'\\inputDisplaySettings.json')){
  settingsFile = readSettingsFile(settingsPath + '\\inputDisplaySettings.json');
  settingsFile.locked != undefined?inputDisplaySettings.locked = settingsFile.locked:0;
  settingsFile.enabled != undefined?inputDisplaySettings.enabled = settingsFile.enabled:0;
  settingsFile.x != undefined?inputDisplaySettings.x = settingsFile.x:0;
  settingsFile.y != undefined?inputDisplaySettings.y = settingsFile.y:0;
  settingsFile.zoom != undefined? inputDisplaySettings.zoom = settingsFile.zoom:0;
}
if(fs.existsSync(settingsPath+'\\inputTelemetrySettings.json')){
  settingsFile = readSettingsFile(settingsPath + '\\inputTelemetrySettings.json');
  settingsFile.locked != undefined?inputTelemetrySettings.locked = settingsFile.locked:0;
  settingsFile.enabled != undefined?inputTelemetrySettings.enabled = settingsFile.enabled:0;
  settingsFile.x != undefined?inputTelemetrySettings.x = settingsFile.x:0;
  settingsFile.y != undefined?inputTelemetrySettings.y = settingsFile.y:0;
  settingsFile.zoom != undefined? inputTelemetrySettings.zoom = settingsFile.zoom:0;
  settingsFile.time != undefined? inputTelemetrySettings.time = settingsFile.time:0;
}
if(fs.existsSync(settingsPath+'\\standingsSettings.json')){
  settingsFile = readSettingsFile(settingsPath + '\\standingsSettings.json');
  settingsFile.locked != undefined?standingsSettings.locked = settingsFile.locked:0;
  settingsFile.enabled != undefined?standingsSettings.enabled = settingsFile.enabled:0;
  settingsFile.x != undefined?standingsSettings.x = settingsFile.x:0;
  settingsFile.y != undefined?standingsSettings.y = settingsFile.y:0;
  settingsFile.show_iRating != undefined?standingsSettings.show_iRating = settingsFile.show_iRating:0;
  settingsFile.showTyres != undefined?standingsSettings.showTyres = settingsFile.showTyres:0;
  settingsFile.showCarBrand != undefined?standingsSettings.showCarBrand = settingsFile.showCarBrand:0;
  settingsFile.zoom != undefined? standingsSettings.zoom = settingsFile.zoom:0;
}
io.on('connection',(socket)=>{
  //create all overlay windows once the application is ready
  //this lets us simply hide or show the overlays rather than destroying them
  //=== MAY BE REFACTORED INTO CREATION AND DESTRUCTION AGAIN ===
  if(fuelCalculatorWindow == undefined){
    openFuelCalculator();
    fuelCalculatorWindow.on('moved',()=>{
      var position = fuelCalculatorWindow.getPosition();
      fuelCalculatorSettings.x = position[0];
      fuelCalculatorSettings.y = position[1];
    });
    fuelCalculatorWindow.on('closed',()=>{
      writeFile(settingsPath,'\\fuelCalculatorSettings.json',fuelCalculatorSettings)
      fuelCalculatorWindow = undefined;
    });
  }
  if(relativeWindow == undefined){
    openRelative();
    relativeWindow.on('moved',()=>{
      var position = relativeWindow.getPosition();
      relativeSettings.x = position[0];
      relativeSettings.y = position[1];
      
    })
    relativeWindow.on('closed',()=>{
      writeFile(settingsPath,'\\relativeSettings.json', relativeSettings);
      relativeWindow = undefined;
    });
  }
  if(inputDisplayWindow == undefined){
    openInputDisplay();
    inputDisplayWindow.on('moved',()=>{
      var position = inputDisplayWindow.getPosition();
      inputDisplaySettings.x = position[0];
      inputDisplaySettings.y = position[1];
    })
    inputDisplayWindow.on('closed',()=>{
      writeFile(settingsPath,'\\inputDisplaySettings.json',inputDisplaySettings);
      inputDisplayWindow = undefined;
      
    });
  }
  if(inputTelemetryWindow == undefined){
    openInputTelemetry();
    inputTelemetryWindow.on('moved',()=>{
      var position = inputTelemetryWindow.getPosition();
      inputTelemetrySettings.x = position[0];
      inputTelemetrySettings.y = position[1];
    });
    inputTelemetryWindow.on('closed',()=>{
      writeFile(settingsPath,'\\inputTelemetrySettings.json',inputTelemetrySettings);
      inputTelemetryWindow = undefined;
    })
  }
  if(standingsWindow == undefined){
    openStandings();
    standingsWindow.on('moved', ()=>{
      var position = standingsWindow.getPosition();
      standingsSettings.x = position[0];
      standingsSettings.y = position[1];
    })
    standingsWindow.on('closed',()=>{
      writeFile(settingsPath,'\\standingsSettings.json',standingsSettings);
      standingsWindow = undefined;
    })
  }
  //update the visibility of the overlays once per 2 seconds
  let visibilityInterval = setInterval(()=>{
    if(iRacingTelemetry.isRunning()) {
      try{
        if((iRacingTelemetry.isInGarage()&&globalSettings.hideWhenInGarage)||globalHide){
          fuelCalculatorWindow.hide();
          relativeWindow.hide();
          inputTelemetryWindow.hide();
          inputDisplayWindow.hide();
          standingsWindow.hide();
          trackMapWindow.hide();
        }else{
          fuelCalculatorSettings.enabled?fuelCalculatorWindow.show():0;
          relativeSettings.enabled?relativeWindow.show():0;
          inputDisplaySettings.enabled?inputDisplayWindow.show():0;
          inputTelemetrySettings.enabled?inputTelemetryWindow.show():0;
          standingsSettings.enabled?standingsWindow.show():0;
          trackMapSettings.enabled?trackMapWindow.show():0;
        }
      }catch(e){
        var date = new Date(Date.now())
        var dateString = date.toLocaleTimeString("en-US",{
          hour12:false
        });
        dateString = dateString.replaceAll(':',"-");
        writeFile(logsPath,dateString + '.json', e.message)
      }
    }else{
      try{
        if((globalSettings.hideWhenInGarage)||globalHide){
          fuelCalculatorWindow.hide();
          relativeWindow.hide();
          inputTelemetryWindow.hide();
          inputDisplayWindow.hide();
          standingsWindow.hide();
          trackMapWindow.hide();
        }else{
          fuelCalculatorSettings.enabled?fuelCalculatorWindow.show():0;
          relativeSettings.enabled?relativeWindow.show():0;
          inputDisplaySettings.enabled?inputDisplayWindow.show():0;
          inputTelemetrySettings.enabled?inputTelemetryWindow.show():0;
          standingsSettings.enabled?standingsWindow.show():0;
          trackMapSettings.enabled?trackMapWindow.show():0;
        }
      }catch(e){
        var date = new Date(Date.now())
        var dateString = date.toLocaleTimeString("en-US",{
          hour12:false
        });
        dateString = dateString.replaceAll(':',"-");
        writeFile(logsPath,dateString + '.json', e.message)
      }
    }
  }, 2000)

  //update all overlays in a single function, 60 times per second
  //===FUNCTIONAL BUT INEFFICIENT===
  let updateInterval = setInterval(()=>{
    if(iRacingTelemetry.isRunning()){
      
      socket.emit("sentFuelData",iRacingTelemetry.FuelData());
      if(iRacingTelemetry.dropDownOptionsMapping() != undefined){
        socket.emit('sentFuelCalculatorHeaderData',iRacingTelemetry.dropDownOptionsMapping().get(fuelCalculatorSettings.header1),iRacingTelemetry.dropDownOptionsMapping().get(fuelCalculatorSettings.header2),iRacingTelemetry.dropDownOptionsMapping().get(fuelCalculatorSettings.header3),iRacingTelemetry.dropDownOptionsMapping().get(fuelCalculatorSettings.footer1),iRacingTelemetry.dropDownOptionsMapping().get(fuelCalculatorSettings.footer2),iRacingTelemetry.dropDownOptionsMapping().get(fuelCalculatorSettings.footer3))
      }
      
      var relativeData = iRacingTelemetry.RelativeData();
      var relativeValues = relativeData['relativeData'];
      var playerId = relativeData['playerId'];
      socket.emit('sentRelativeData', relativeValues, playerId);
      if(iRacingTelemetry.dropDownOptionsMapping() != undefined){
        socket.emit('sentRelativeHeaderData',iRacingTelemetry.dropDownOptionsMapping().get(relativeSettings.header1),iRacingTelemetry.dropDownOptionsMapping().get(relativeSettings.header2),iRacingTelemetry.dropDownOptionsMapping().get(relativeSettings.header3),iRacingTelemetry.dropDownOptionsMapping().get(relativeSettings.footer1),iRacingTelemetry.dropDownOptionsMapping().get(relativeSettings.footer2),iRacingTelemetry.dropDownOptionsMapping().get(relativeSettings.footer3))
      }
      socket.emit("sentDriverInputs",iRacingTelemetry.driverInputs());
      socket.emit('sentStandingsData',iRacingTelemetry.calculateStandings());
      socket.emit('sentTrackMapData',iRacingTelemetry.trackMapData());
    }else{
      socket.emit('sentFuelCalculatorHeaderData', fuelCalculatorSettings.header1,fuelCalculatorSettings.header2,fuelCalculatorSettings.header3,fuelCalculatorSettings.footer1,fuelCalculatorSettings.footer2,fuelCalculatorSettings.footer3,)
      socket.emit('clearOverlays');
      socket.emit('sentRelativeHeaderData',relativeSettings.header1,relativeSettings.header2,relativeSettings.header3,relativeSettings.footer1,relativeSettings.footer2,relativeSettings.footer3)
    
    }
  },1000/60)
    socket.on('OpenFuelCalculator', () =>{
    if(fuelCalculatorWindow == undefined){
      openFuelCalculator();
    }
    if(!fuelCalculatorSettings.enabled){
      if(!globalHide){
        fuelCalculatorWindow.show();
      }
      fuelCalculatorSettings.enabled = true;
      socket.emit('fuelOverlayToggled', fuelCalculatorSettings.enabled);
    }else{
      fuelCalculatorWindow.hide();
      fuelCalculatorSettings.enabled = false;
      socket.emit('fuelOverlayToggled', fuelCalculatorSettings.enabled);
    }
  });
  socket.on('getFuelCalculatorSettings',(response)=>{
    response({
      settings:fuelCalculatorSettings
    })
  });
  socket.on('lockFuelOverlay', ()=>{
    if(fuelCalculatorWindow != undefined){
      fuelCalculatorWindow.setMovable(!fuelCalculatorWindow.movable)
      fuelCalculatorWindow.setIgnoreMouseEvents(!fuelCalculatorWindow.movable)
      fuelCalculatorSettings.locked = !fuelCalculatorWindow.movable;
    }else{
      fuelCalculatorSettings.locked = !fuelCalculatorSettings.locked;
    }
    socket.emit('fuelOverlayLockStateChanged',fuelCalculatorSettings.locked);
  });
  socket.on('fuelCalculatorSelectChanged',(value,id)=>{
    if(iRacingTelemetry.dropDownOptionsMapping()!= undefined){
      socket.broadcast.emit('fuelCalculatorSelectChangedDiv',iRacingTelemetry.dropDownOptionsMapping().get(value), id);
    }else{
      socket.broadcast.emit('fuelCalculatorSelectChangedDiv',0,id);
    }
    fuelCalculatorSettings[id] = value;
  })
  socket.on('getFuelOverlayStatus', (response)=>{
    response({
      port:globalSettings.port,
    })
    socket.emit('fuelOverlayToggled', fuelCalculatorSettings.enabled);
    socket.emit('fuelOverlayLockStateChanged', fuelCalculatorSettings.locked)
    socket.emit('fuelCalculatorZoomChanged',fuelCalculatorSettings.zoom)
    socket.emit('setFuelCalculatorSelects',fuelCalculatorSettings.header1,fuelCalculatorSettings.header2,fuelCalculatorSettings.header3,fuelCalculatorSettings.footer1,fuelCalculatorSettings.footer2,fuelCalculatorSettings.footer3)
  });
  socket.on('fuelCalculatorZoomChanged',(zoom)=>{
    fuelCalculatorSettings.zoom = zoom;
    fuelCalculatorWindow.resizable = true;
    fuelCalculatorWindow?fuelCalculatorWindow.setSize(Math.ceil(338*fuelCalculatorSettings.zoom/10),Math.ceil(136*fuelCalculatorSettings.zoom/10)):0
    fuelCalculatorWindow.resizable=false
  })
  socket.on('OpenRelative', () =>{
    if(relativeWindow == undefined){
      openRelative();
    }
    if(!relativeSettings.enabled){
      if(!globalHide){
        relativeWindow.show();
      }
      relativeSettings.enabled = true;
      socket.emit('relativeOverlayToggled', relativeSettings.enabled);
    }else{
      relativeWindow.hide();
      relativeSettings.enabled = false;
      socket.emit('relativeOverlayToggled', relativeSettings.enabled);
    }
  });
  socket.on('lockRelativeOverlay', ()=>{
    if(relativeWindow != undefined){
      relativeWindow.setMovable(!relativeWindow.movable)
      relativeWindow.setIgnoreMouseEvents(!relativeWindow.movable)
      relativeSettings.locked = !relativeWindow.movable;
    }else{
      relativeSettings.locked = !relativeSettings.locked;
    }
    
    socket.emit('relativeOverlayLockStateChanged',relativeSettings.locked);
  });
  
  socket.on('getRelativeOverlayStatus', (response)=>{
    response({
      port:globalSettings.port,
    })
    socket.emit('relativeOverlayToggled', relativeSettings.enabled)
    socket.emit('relativeOverlayLockStateChanged', relativeSettings.locked)
    socket.emit('setCarCount', relativeSettings.rowsAhead, relativeSettings.rowsBehind)
    socket.emit('setRelativeSliders',relativeSettings.show_iRating, relativeSettings.showCarBrand, relativeSettings.showTyres);
    socket.emit('setRelativeSelects',relativeSettings.header1,relativeSettings.header2,relativeSettings.header3,relativeSettings.footer1,relativeSettings.footer2,relativeSettings.footer3)
    socket.emit('setRelativeZoom',relativeSettings.zoom)
  });
  socket.on('getRelativeSettings', ()=>{
    socket.emit('initializeRelativeWindow', relativeSettings);
  })
  socket.on('carCountChanged',(ahead, behind)=>{
    relativeSettings.rowsAhead = ahead;
    relativeSettings.rowsBehind = behind;
    socket.broadcast.emit('relativeTableSize', ahead,behind);
  })
  socket.on('relativeSliderChanged',(id, checked)=>{
    socket.broadcast.emit('relativeSliderChanged',id,checked);
      switch(id){
        case 'show_iRating':
            relativeSettings.show_iRating = checked;
            break;
        case 'showTyres':
            relativeSettings.showTyres = checked;
            break;
        case 'showBranding':
            relativeSettings.showCarBrand = checked;
            break;
    }
  });
  socket.on('relativeSelectChanged',(value,id)=>{
    if(iRacingTelemetry.dropDownOptionsMapping() != undefined){
      socket.broadcast.emit('relativeSelectChangedDiv',iRacingTelemetry.dropDownOptionsMapping().get(value),id);
    }else{
      socket.broadcast.emit('relativeSelectChangedDiv',0,id);
    }
    relativeSettings[id] = value;
  })
  socket.on('relativeZoomChanged',(zoom)=>{
    relativeSettings.zoom = zoom;
    relativeWindow.resizable = true;
    relativeWindow.setSize(Math.ceil(452*zoom/10), Math.ceil((17+17+28+((relativeSettings.rowsAhead + relativeSettings.rowsAhead)*28)*zoom/10)));
    relativeWindow.resizable = false;
  })

  socket.on("hideAllOverlays",(callback)=>{
    if(globalHide){
      globalHide = false
      globalHideOverlays();
      callback({
        hidden:globalHide
      })
    }else{
      globalHide = true
      globalHideOverlays();
      callback({
        hidden:globalHide
      })
    }
  })
  socket.on('openInputDisplay',(callback)=>{
    inputDisplaySettings.enabled = !inputDisplaySettings.enabled;
    if(inputDisplaySettings.enabled && !globalHide){
      inputDisplayWindow.show()
    }else{
      inputDisplayWindow.hide();
    }
    callback({
      enabled:inputDisplaySettings.enabled
    })
  })
  socket.on('lockInputDisplay',(callback)=>{
    inputDisplaySettings.locked = !inputDisplaySettings.locked;
    if(inputDisplayWindow != undefined){
      inputDisplayWindow.setMovable(!inputDisplaySettings.locked)
      inputDisplayWindow.setIgnoreMouseEvents(inputDisplaySettings.locked)
    }
    callback({
      locked:inputDisplaySettings.locked
    })
  })
  socket.on('getInputOverlayStatus',(callback)=>{
    callback({
      locked:inputDisplaySettings.locked,
      enabled:inputDisplaySettings.enabled,
      zoom:inputDisplaySettings.zoom,
      port:globalSettings.port,
    })
  })
  socket.on('inputDisplayZoomChanged',(zoom)=>{
    inputDisplaySettings.zoom = zoom;
    inputDisplayWindow.resizable = true;
    inputDisplayWindow.setSize(Math.ceil(125*inputDisplaySettings.zoom/10),Math.ceil(105*inputDisplaySettings.zoom))
  })

  socket.on('openInputTelemetry',(callback)=>{
    inputTelemetrySettings.enabled = !inputTelemetrySettings.enabled;
    if(inputTelemetrySettings.enabled && !globalHide){
      inputTelemetryWindow.show()
    }else{
      inputTelemetryWindow.hide();
    }
    callback({
      enabled:inputTelemetrySettings.enabled
    })
  })

  socket.on('lockInputTelemetry',(callback)=>{
    inputTelemetrySettings.locked = !inputTelemetrySettings.locked;
    if(inputTelemetryWindow != undefined){
      inputTelemetryWindow.setMovable(!inputTelemetrySettings.locked)
      inputTelemetryWindow.setIgnoreMouseEvents(inputTelemetrySettings.locked)
    }
    callback({
      locked:inputTelemetrySettings.locked
    })
  })
  socket.on('getInputTelemetryOverlayStatus',(callback)=>{
    callback({
      locked:inputTelemetrySettings.locked,
      enabled:inputTelemetrySettings.enabled,
      zoom:inputTelemetrySettings.zoom,
      time:inputTelemetrySettings.time,
      port:globalSettings.port,
    })
  })
  socket.on('inputTelemetryZoomChanged',(zoom)=>{
    inputTelemetrySettings.zoom = zoom;
    inputTelemetryWindow.resizable = true;
    inputTelemetryWindow.setSize(Math.ceil(300*inputTelemetrySettings.zoom/10),Math.ceil(100*inputTelemetrySettings.zoom/10))
  })
  socket.on('getInputTelemetrySettings', (callback)=>{
    callback({
      zoom:inputTelemetrySettings.zoom,
      time:inputTelemetrySettings.time,
    })
  })
  socket.on('inputTelemetryTimeRangeChanged',(time)=>{
    inputTelemetrySettings.time = time;
    socket.broadcast.emit('changeInputTelemetryTimeRange', time);
  });
  socket.on('toggleStandings',(response)=>{
    standingsSettings.enabled = !standingsSettings.enabled;
    if(standingsSettings.enabled && !globalHide){
      standingsWindow.show();
    }else{
      standingsWindow.hide();
    }
    response({
      enabled:standingsSettings.enabled
    })
  });
  socket.on('lockStandings',(response)=>{
    standingsSettings.locked = !standingsSettings.locked;
    if(standingsWindow != undefined){
      standingsWindow.setMovable(!standingsSettings.locked);
      standingsWindow.setIgnoreMouseEvents(standingsSettings.locked);
    }
    response({
      locked:standingsSettings.locked
    })
  });
  socket.on('standingsSliderChanged',(id,checked)=>{
    socket.broadcast.emit('standingsSliderChanged',id,checked);
    switch(id){
      case 'show_iRating':
        standingsSettings.show_iRating = checked;
        break;
      case 'showTyres':
        standingsSettings.showTyres = checked;
        break;
      case 'showBranding':
        standingsSettings.showCarBrand = checked;
        break;
    }
  });
  socket.on('getStandingsOverlayStatus',(response)=>{
    response({
      locked:standingsSettings.locked,
      enabled:standingsSettings.enabled,
      showCarBrand:standingsSettings.showCarBrand,
      show_iRating:standingsSettings.show_iRating,
      showTyres:standingsSettings.showTyres,
      zoom:standingsSettings.zoom,
      port:globalSettings.port,
    });
  });
  socket.on('standingsZoomChanged',(zoom)=>{
    standingsSettings.zoom = zoom;
    standingsWindow.resizable = true;
    standingsWindow.setSize(Math.ceil(601*standingsSettings.zoom/10), Math.ceil((51+(20*16))*standingsSettings.zoom/10));
    standingsWindow.resizable = false;
  });
  socket.on('getStandingsSettings',(response)=>{
    response({
      status:"ok",
      showCarBrand:standingsSettings.showCarBrand,
      show_iRating:standingsSettings.show_iRating,
      showTyres:standingsSettings.showTyres,
      zoom:standingsSettings.zoom,
    })
  });
  socket.on('getGlobalSettings',(response)=>{
    response({
      port:globalSettings.port,
      hideWhenInGarage:globalSettings.hideWhenInGarage,
    });
  });
  socket.on('portChanged',(newPort)=>{
    try{
      server.close()
      server.listen(newPort)
      globalSettings.port = newPort;
    }catch(err){
      server.close();
      server.listen(globalSettings.port)
      console.log(err);
    }
    socket.broadcast.emit('portChanged',globalSettings.port);
  })
  socket.on('globalSettingsSliderChanged',(id,value)=>{
    globalSettings[id]=value;
  })
});
    
  
io.on('disconnect',(socket)=>{

});

server.listen(globalSettings.port || 3000).on('error', errorHandler);
function errorHandler(err){
  if(err.code == 'EADDRINUSE'){
    console.log('Port in Use');
    globalSettings.port = parseInt(globalSettings.port) + 1;
    server.close();
    server.listen(globalSettings.port);
  }else{
    console.log(err);
  }
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/kljejgsrbkijgbjhkjdflhgblkjadhfkglhdfkgfhlzfkhgdlzg', indexRouter);
app.use('/users', usersRouter);
app.use('/FuelCalculator', fuelCalculatorRouter);
app.use('/relative', relativeRouter)
app.use('/inputDisplay',inputDisplayRouter);
app.use('/inputTelemetry',inputTelemetryRouter);
app.use('/standings',standingsRouter);
app.use('/trackMap',trackMapRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
process.on('close',()=>{
  console.log('SIGTERM recieved.')
})
function openRelative() {
  relativeWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: false,
    minimizable:false,
    maximizable: false,
    resizable:false,
    alwaysOnTop: true,
    width:Math.ceil(452*relativeSettings.zoom/10),
    height:Math.ceil(28*(relativeSettings.rowsAhead+relativeSettings.rowsBehind+1)),
    x:relativeSettings.x,
    y:relativeSettings.y,
    show:relativeSettings.enabled,
    movable: !relativeSettings.locked,
    webPreferences: {

    }
  });
  relativeWindow.setIgnoreMouseEvents(relativeSettings.locked);
  var url = 'http://localhost:' + globalSettings.port + '/relative';
  relativeWindow.loadURL(url);
}
function openFuelCalculator() {
  fuelCalculatorWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: false,
    minimizable:false,
    maximizable: false,
    resizable:false,
    alwaysOnTop: true,
    width:Math.ceil(338*fuelCalculatorSettings.zoom/10),
    height:Math.ceil(136*fuelCalculatorSettings.zoom/10),
    x:fuelCalculatorSettings.x,
    y:fuelCalculatorSettings.y,
    show:fuelCalculatorSettings.enabled,
    movable: !fuelCalculatorSettings.locked,
    webPreferences: {

    }
  });
  fuelCalculatorWindow.setIgnoreMouseEvents(fuelCalculatorSettings.locked);
  fuelCalculatorWindow.loadURL('http://localhost:' + globalSettings.port + '/FuelCalculator');
  fuelCalculatorWindow.moveTop();
}
function openInputDisplay(){
  inputDisplayWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: false,
    minimizable:false,
    maximizable: false,
    resizable:false,
    alwaysOnTop: true,
    x:inputDisplaySettings.x,
    y:inputDisplaySettings.y,
    width:Math.ceil(125*inputDisplaySettings.zoom/10),
    height:Math.ceil(105*inputDisplaySettings.zoom/10),
    show:inputDisplaySettings.enabled,
    movable: !inputDisplaySettings.locked,
    webPreferences: {

    }
  });
  inputDisplayWindow.setIgnoreMouseEvents(inputDisplaySettings.locked);
  inputDisplayWindow.loadURL('http://localhost:' + globalSettings.port + '/inputDisplay');
  inputDisplayWindow.moveTop();
}
function openInputTelemetry(){
  inputTelemetryWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: false,
    minimizable:false,
    maximizable: false,
    resizable:false,
    alwaysOnTop: true,
    width:Math.ceil(300*inputTelemetrySettings.zoom/10),
    height:Math.ceil(100*inputTelemetrySettings.zoom/10),
    x:inputTelemetrySettings.x,
    y:inputTelemetrySettings.y,
    show:inputTelemetrySettings.enabled,
    movable: !inputTelemetrySettings.locked,
    webPreferences: {

    }
  });
  inputTelemetryWindow.setIgnoreMouseEvents(inputTelemetrySettings.locked);
  var url = 'http://localhost:' + globalSettings.port + '/inputTelemetry';
  inputTelemetryWindow.loadURL(url);
}
function openStandings(){
  standingsWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: false,
    minimizable:false,
    maximizable: false,
    resizable:false,
    alwaysOnTop: true,
    width:Math.ceil(601*standingsSettings.zoom/10),
    height:Math.ceil((51+(20*16))*standingsSettings.zoom/10),
    x:standingsSettings.x,
    y:standingsSettings.y,
    show:standingsSettings.enabled,
    movable:!standingsSettings.locked
  })
  standingsWindow.setIgnoreMouseEvents(standingsSettings.locked);
  var url = 'http://localhost:' + globalSettings.port + '/standings';
  standingsWindow.loadURL(url);
}
function openTrackMap(){
  trackMapWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: false,
    minimizable:false,
    maximizable: false,
    resizable:false,
    alwaysOnTop: true,
    x:trackMapSettings.x,
    y:trackMapSettings.y,
    show:trackMapSettings.enabled,
    movable:!trackMapSettings.locked
  })
  trackMapWindow.setIgnoreMouseEvents(trackMapSettings.locked);
  var url = 'http://localhost:' + globalSettings.port + '/trackMap';
  trackMapWindow.loadURL(url);
}
function globalHideOverlays(){
  if(globalHide){
    if(fuelCalculatorWindow!=undefined){
      fuelCalculatorWindow.hide();
    }
    if(relativeWindow!=undefined){  
      relativeWindow.hide();
    }
    if(inputDisplayWindow!=undefined){
      inputDisplayWindow.hide();
    }
    if(inputTelemetryWindow!=undefined){
      inputTelemetryWindow.hide();
    }
    if(standingsWindow!=undefined){
      standingsWindow.hide();
    }
  }else{
    if(fuelCalculatorWindow!=undefined && fuelCalculatorSettings.enabled){
      fuelCalculatorWindow.show();
    }
    if(relativeWindow!=undefined && relativeSettings.enabled){
      relativeWindow.show();
    }
    if(inputDisplayWindow!=undefined && inputDisplaySettings.enabled){
      inputDisplayWindow.show();
    }
    if(inputTelemetryWindow!=undefined && inputTelemetrySettings.enabled){
      inputTelemetryWindow.show();
    }
    if(standingsWindow!=undefined && standingsSettings.enabled){
      standingsWindow.show();
    }
  }
}
module.exports = app;
module.exports.writeFile = writeFile;
module.exports.globalSettings = globalSettings;
module.exports.settingsPath = settingsPath;
