const events =require('events');
const e = require('express');
const emitter = events.EventEmitter
const sdk = require("node-irsdk-mjo");
const iRacing = sdk.init({telemetryUpdateInterval:1000/60, sessionInfoUpdateInterval:1000/60});
const manufacturer = require('./public/javascripts/manufacturers.js');
const { session } = require('electron');
const fs = require('fs');
var dropDownOptionsMapping
var IrSdkConsts = require("node-irsdk-mjo").getInstance().Consts;
var previousSurface;
var Lap = -1;
var EnterExitReset = 0;
var fuel;
var lapStartFuel; 
var lapFuel = new Array();
var minFuelPerLap;
var minFuelLapsRemaining;
var minRefill;
var maxFuelPerLap;
var maxFuelLapsRemaining;
var maxRefill;
var avgFuelPerLap;
var avgFuelLapsRemaining;
var avgRefill;
var carIdxPlayer;
var playerLapsRemaining;
var carIdxLeader;
var leaderLapTime;
var leaderLapsRemaining;
var leaderEstimatedRaceTime;
var raceTimer;
var raceSession;
var isOnPitRoad;
var cautionLap;
var relativeData = new Array();
var fuelData = {
    'currentFuel': 0,
    'minFuelPerLap': 0,
    'minFuelLapsRemaining':0,
    'minRefill':0,
    'maxFuelPerLap': 0,
    'maxFuelLapsRemaining': 0,
    'maxRefill': 0,
    'avgFuelPerLap': 0,
    'avgFuelLapsRemaining': 0,
    'avgRefill': 0
};
var trackMapURL;
var driverInputs;
var isRunning;
var timer;
var _isInGarage;
var tracks;

iRacing.on('Connected',()=>{
    isRunning = true;
    try{
        tracks = JSON.parse(fs.readFileSync('./public/javascripts/trackInfo.json'));
    }catch(err){
        console.log(err);
    }
})
iRacing.on("update",()=>{
    try {
        if(iRacing.telemetry != null && iRacing.sessionInfo != null){
            fuelData = calculateFuel();
            relativeData = calculateRelative();
            driverInputs = getDriverInputs();
            dropDownOptionsMapping = new Map()
            dropDownOptionsMapping.set("-none-", "-none-");
            dropDownOptionsMapping.set("ABS", iRacing.telemetry.values.dcABS!=undefined?"ABS: " + iRacing.telemetry.values.dcABS: "ABS: Not Equipped");
            dropDownOptionsMapping.set( "Air Temperature", iRacing.telemetry.values.AirTemp!=undefined?"Air Temp: " + iRacing.telemetry.values.AirTemp.toFixed(2):0);
            dropDownOptionsMapping.set("Brake Bias",iRacing.telemetry.values.dcBrakeBias.toFixed(2)+"%")
            dropDownOptionsMapping.set("Car",iRacing.sessionInfo.data.DriverInfo.Drivers[iRacing.sessionInfo.data.DriverInfo.DriverCarIdx]!= undefined?iRacing.sessionInfo.data.DriverInfo.Drivers[iRacing.sessionInfo.data.DriverInfo.DriverCarIdx].CarScreenName:'-none-');
            dropDownOptionsMapping.set("DRS Status","DRS: " + DRSStatus());
            dropDownOptionsMapping.set("Frame Rate","FPS: " + iRacing.telemetry.values.FrameRate.toFixed(0));
            dropDownOptionsMapping.set("Incidents","Incidents: "+iRacing.telemetry.values.PlayerCarTeamIncidentCount.toString() + 'x');
            dropDownOptionsMapping.set("Oil Temperature","Oil Temp: " + iRacing.telemetry.values.OilTemp.toFixed(2));
            dropDownOptionsMapping.set("Push to Pass Remaining","P2P Left : "+iRacing.telemetry.values.CarIdxP2P_Count[iRacing.telemetry.values.PlayerCarIdx]);
            dropDownOptionsMapping.set("Push to Pass Status","P2P: " + iRacing.telemetry.values.CarIdxP2P_Status[iRacing.telemetry.values.PlayerCarIdx]);
            dropDownOptionsMapping.set("Session Flag",iRacing.telemetry.values.SessionFlags[0]);
            dropDownOptionsMapping.set("Session Laps Remaining",lapsRemainingHeader());
            dropDownOptionsMapping.set( "Session Laps","Lap: " + sessionLapsHeader());
            dropDownOptionsMapping.set("Session Time Of Day",secondsToTimeStamp(iRacing.telemetry.values.SessionTimeOfDay));
            dropDownOptionsMapping.set("Session Time Remaining",secondsToTimeStamp(iRacing.telemetry.values.SessionTimeRemain));
            dropDownOptionsMapping.set("Session Time",iRacing.sessionInfo.data.SessionInfo.Sessions[iRacing.telemetry.values.SessionNum].SessionTime != 'unlimited'? 
                secondsToTimeStamp(iRacing.telemetry.values.SessionTime) + "/" + secondsToTimeStamp(parseFloat(iRacing.sessionInfo.data.SessionInfo.Sessions[iRacing.telemetry.values.SessionNum].SessionTime.substring(0,iRacing.sessionInfo.data.SessionInfo.Sessions[iRacing.telemetry.values.SessionNum].SessionTime.length - 4))):
                secondsToTimeStamp(iRacing.telemetry.values.SessionTime));
            dropDownOptionsMapping.set("System Time",new Date().toLocaleTimeString());
            dropDownOptionsMapping.set("Track",iRacing.sessionInfo.data.WeekendInfo.TrackDisplayShortName);
            dropDownOptionsMapping.set("Track Temperature","Track Temp: " + iRacing.telemetry.values.TrackTemp.toFixed(2));
            dropDownOptionsMapping.set("Traction Control",iRacing.telemetry.values.dcTractionControl!=undefined?"TCS: " + iRacing.telemetry.values.dcTractionControl:"TCS: Not Equipped");
            dropDownOptionsMapping.set("Water Temperature","Water Temp: " + iRacing.telemetry.values.WaterTemp.toFixed(2));
            _isInGarage = isInGarage();
        }
    } catch (err) {
        console.log(err);
    }
})
iRacing.on('Disconnected',()=>{
    fuelData = undefined;
    relativeData = undefined;
    isRunning = false;
    clearInterval(timer);
    timer = null;
});
function DRSStatus() {
    var drs = iRacing.telemetry.values.DRS_Status;
    switch(drs){
        case 0:
            return "Unavailable";
        case 1:
            return "Ready";
        case 2:
            return "Available";
        case 3:
            return "Open";
        default:
            return "Not Equipped";
    }
}
function isInGarage(){
    return !iRacing.telemetry.values.IsOnTrack;
}
function secondsToTimeStamp(seconds) {
    {
        var session = new Date(null);
        session.setSeconds(seconds)
        hours = session.getUTCHours().toString();
        minutes = session.getUTCMinutes().toString().padStart(2,"0");
        seconds = session.getUTCSeconds().toString().padStart(2,"0");
        return hours + ":" + minutes+ ':' + seconds;
    }
}
function lapsRemainingHeader(){
    if(!isNaN(playerLapsRemaining)){
        return playerLapsRemaining.toFixed(1)
    }
    else{
        return Math.ceil(iRacing.telemetry.values.SessionTimeRemain/iRacing.sessionInfo.data.DriverInfo.DriverCarEstLapTime);
    }
}
function sessionLapsHeader(){
    if(iRacing.sessionInfo != undefined)
    {
        if(iRacing.sessionInfo.data.SessionInfo.Sessions[iRacing.telemetry.values.SessionNum].SessionLaps == "unlimited"){
            if(!isNaN(iRacing.telemetry.values.Lap+playerLapsRemaining)){
                return iRacing.telemetry.values.Lap.toString() +'/'+ (iRacing.telemetry.values.Lap+playerLapsRemaining + iRacing.telemetry.values.LapDistPct).toFixed(1)
            }else{
                return iRacing.telemetry.values.Lap.toString() +'/'+ Infinity.toLocaleString('fullwide', {useGrouping:false});
            }
        }else{
            return iRacing.telemetry.values.Lap.toString() + '/' + iRacing.sessionInfo.data.SessionInfo.Sessions[iRacing.telemetry.values.SessionNum].SessionLaps
        }
    }
}
function calculateFuel(){
    //various checks to reset the array of fuel used per lap to prevent skew from partial laps
    //needs check for being launched mid-stint

    if(iRacing.telemetry.values.EnterExitReset == 1 && iRacing.telemetry.values.EnterExitReset != EnterExitReset){
        lapFuel = new Array();
        lapStartFuel = iRacing.telemetry.values.FuelLevel;
        if(iRacing.telemetry.values.LapDistPct > .03) {
            voidFirstLap = true
        }
        else{
            voidFirstLap = false;
        }
    }    
    //player car index
    carIdxPlayer = iRacing.telemetry.values.PlayerCarIdx;

    EnterExitReset = iRacing.telemetry.values.EnterExitReset;
    if(previousSurface == 'InPitStall' && iRacing.telemetry.values.PlayerTrackSurface != previousSurface){
        lapStartFuel = iRacing.telemetry.values.FuelLevel;
        lapFuel = new Array();
    }
    for(var i = 0; i < iRacing.telemetry.values.SessionFlags.length; i++){
        if(iRacing.telemetry.values.SessionFlags[i].includes('Caution') || cautionLap || iRacing.telemetry.values.SessionFlags[i].includes("StartReady")){
            cautionLap = true;
        }
    }
    previousSurface = iRacing.telemetry.values.PlayerTrackSurface;
    //add new lap to the array of fuel per lap values
    if(iRacing.telemetry.values.LapCompleted != Lap && iRacing.telemetry.values.LapCompleted >=0 && EnterExitReset ==2){
        if(!cautionLap || !voidFirstLap){
            !isNaN(lapStartFuel - fuel)? lapFuel.push(lapStartFuel - fuel):0;
            //set the fuel level at the start of the new lap
            lapStartFuel = iRacing.telemetry.values.FuelLevel;
            // set avg, min, max fuel per lap values
            var fuelUsed = 0;
            for(var i = 0; i<lapFuel.length; i++){
                fuelUsed += lapFuel[i];
            }
            avgFuelPerLap = fuelUsed/lapFuel.length;
            lapFuel.sort((a,b)=> b-a);
            minFuelPerLap = lapFuel[lapFuel.length -1];
            maxFuelPerLap=lapFuel[0];
        }else{
            lapStartFuel = iRacing.telemetry.values.FuelLevel;
            cautionLap = false;
            voidFirstLap = false;
        }
    }

    //set new lap and fuel values
    Lap = iRacing.telemetry.values.LapCompleted;
    fuel = iRacing.telemetry.values.FuelLevel;
    //calculate laps remaining if during a race session
    iRacing.sessionInfo != null ? iRacing.sessionInfo.data.WeekendInfo.EventType == 'Race' ? calculateLaps() : false: false;
    //calculate min, max, avg laps remaining based on fuel consumption
    if(minFuelPerLap != undefined && !isNaN(minFuelPerLap) && minFuelPerLap != 0){
        minFuelLapsRemaining = fuel/minFuelPerLap;
    }else{
        minFuelPerLap = 0
        minFuelLapsRemaining = 0;
    }
    if(maxFuelPerLap != undefined && !isNaN(maxFuelPerLap) && maxFuelPerLap != 0){
        maxFuelLapsRemaining = fuel/maxFuelPerLap;
    }else{
        maxFuelPerLap = 0;
        maxFuelLapsRemaining = 0;
    }

    if(avgFuelPerLap != undefined && !isNaN(avgFuelPerLap) && avgFuelPerLap != 0){
        avgFuelLapsRemaining = fuel/avgFuelPerLap;
    }else{
        avgFuelPerLap = 0;
        avgFuelLapsRemaining = 0;
    }
    //set min, max, avg refuel value based on laps remaining and fuel consumption
    minRefill = (playerLapsRemaining - minFuelLapsRemaining)*minFuelPerLap;
    maxRefill = (playerLapsRemaining - maxFuelLapsRemaining)*maxFuelPerLap;
    avgRefill = (playerLapsRemaining - avgFuelLapsRemaining)*avgFuelPerLap;
    if(isNaN(minRefill)){
        minRefill = 0;
    }
    if(isNaN(maxRefill)){
        maxRefill = 0;
    }
    if(isNaN(avgRefill)){
        avgRefill = 0;
    }
    if(iRacing.telemetry.values.OnPitRoad && !isOnPitRoad){
        isOnPitRoad = iRacing.telemetry.values.OnPitRoad;
        if(avgRefill != 0){
            iRacing.execPitCmd("fuel",Math.round(avgRefill));
            isOnPitRoad = true;
        }
    }
    isOnPitRoad = iRacing.telemetry.values.OnPitRoad;
    //returns array of all Fuel values relevant for the overlay
    return {
        'currentFuel': fuel,
        'minFuelPerLap': minFuelPerLap,
        'minFuelLapsRemaining':minFuelLapsRemaining,
        'minRefill':minRefill,
        'maxFuelPerLap': maxFuelPerLap,
        'maxFuelLapsRemaining':maxFuelLapsRemaining,
        'maxRefill': maxRefill,
        'avgFuelPerLap': avgFuelPerLap,
        'avgFuelLapsRemaining': avgFuelLapsRemaining,
        'avgRefill': avgRefill
    };

}
function calculateLaps(){
    raceTimer = iRacing.telemetry.values.SessionTimeRemain;
    //make sure you're in a session
    if(iRacing.sessionInfo != null){
        //fetch Race session index
        for(var i = 0; i<iRacing.sessionInfo.data.SessionInfo.Sessions.length; i++){
            raceSession = iRacing.sessionInfo.data.SessionInfo.Sessions[i].SessionType == 'Race'? i: null;
        }
        //compare race session index to current session index
        if(raceSession != null && raceSession == iRacing.telemetry.values.SessionNum){
            for(var i = 0; i<iRacing.telemetry.values.CarIdxPosition.length; i++){
                if(iRacing.telemetry.values.CarIdxPosition[i] == 1){
                    carIdxLeader = i;
                }
            }
            //Calculate the number of laps, and therefore race time, the leader of the race has left
            iRacing.telemetry.values.CarIdxBestLapTime[carIdxLeader] == -1? 
                leaderLapTime = iRacing.sessionInfo.data.DriverInfo.Drivers[carIdxLeader].CarClassEstLapTime: 
                leaderLapTime = iRacing.telemetry.values.CarIdxBestLapTime[carIdxLeader];
            leaderLapsRemaining = iRacing.sessionInfo.data.SessionInfo.Sessions[raceSession].SessionLaps == 'unlimited'? 
                Math.ceil((raceTimer -((1-iRacing.telemetry.values.CarIdxLapDistPct[carIdxLeader]))*leaderLapTime)/leaderLapTime) +1-iRacing.telemetry.values.CarIdxLapDistPct[carIdxLeader]: 
                iRacing.sessionInfo.data.SessionInfo.Sessions[raceSession].SessionLaps - iRacing.telemetry.values.CarIdxLapCompleted[carIdxLeader] - iRacing.telemetry.values.CarIdxLapDistPct[carIdxLeader];
            leaderEstimatedRaceTime = leaderLapTime * leaderLapsRemaining;

            //Calculate, rounded up, how many laps the player can complete in the time the leader has left
            //this will help prevent over fuelling when being lapped is expected
            var playerLapTime;
            iRacing.telemetry.values.LapBestLapTime == -1 ? 
                playerLapTime = iRacing.sessionInfo.data.DriverInfo.DriverCarEstLapTime: 
                playerLapTime = iRacing.telemetry.values.LapBestLapTime; 
            playerLapsRemaining = Math.ceil((leaderEstimatedRaceTime-((1-iRacing.telemetry.values.LapDistPct)*playerLapTime))/playerLapTime)+1-iRacing.telemetry.values.LapDistPct;
        }
    }
}

function calculateStandings(){
    try{
    //binding of various car ids, positions, and instantiation of new arrays for standings positioning.
        var currentSessionId = iRacing.telemetry.values.SessionNum;
        var standings = new Array();
        if (iRacing.sessionInfo && iRacing.sessionInfo.data.SessionInfo.Sessions[currentSessionId]) {
            iRacing.sessionInfo.data.SessionInfo.Sessions[currentSessionId].ResultsPositions?.forEach(position => {
                // Calculate gap to leader
                let gapToLeader = position.FastestTime - position.FastestTime;
                if (position.Position > 1) { // Not leader
                    const leaderPosition = iRacing.sessionInfo.data.SessionInfo.Sessions[currentSessionId].ResultsPositions.find(p => p.Position === 1);
                    if (leaderPosition) {
                        gapToLeader = position.Time - leaderPosition.Time;
                    }
                }
                entryExists = iRacing.sessionInfo.data.DriverInfo.Drivers.find(d => d.CarIdx === position.CarIdx);
                if (entryExists != undefined){
                    
                    standings.push({
                        timeRemaining: iRacing.telemetry.values.SessionTimeRemain?
                            new Date(iRacing.telemetry.values.SessionTimeRemain * 1000).toISOString().substr(11, 8):0,
                        lapsRemaining: iRacing.telemetry.values.SessionLapsRemain?iRacing.telemetry.values.SessionLapsRemain:0,
                        manufacturer: manufacturer.get(iRacing.sessionInfo.data.DriverInfo.Drivers.find(d => d.CarIdx === position.CarIdx).CarID),
                        tireCompound: iRacing.telemetry.values.CarIdxTireCompound[position.CarIdx],
                        position: position.Position,
                        carIdx: position.CarIdx,
                        lap: position.Lap,
                        gap: gapToLeader < 0? '': gapToLeader.toFixed(1),
                        // Calculate interval to car ahead
                        interval: gapToLeader > 0?position.Position > 1 ? 
                            (position.Time - iRacing.sessionInfo.data.SessionInfo.Sessions[currentSessionId].ResultsPositions.find(p => p.Position === position.Position - 1).Time).toFixed(1)
                            : 0 :'', 
                        name: iRacing.sessionInfo.data.DriverInfo.Drivers.find(d => d.CarIdx === position.CarIdx).UserName,
                        number: iRacing.sessionInfo.data.DriverInfo.Drivers.find(d => d.CarIdx === position.CarIdx).CarNumber, 
                        time: position.Time,
                        fastestLap: position.FastestLap.toFixed(3),
                        bestLap: position.FastestTime === -1 ? '' : position.FastestTime.toFixed(3),
                        lastLap1: position.LastTime === -1 ? '' : position.LastTime,  // Most recent lap time
                        lapsComplete: position.LapsComplete,
                        lapsLed: position.LapsLed,
                        incidents: position.Incidents,
                        reasonOut: position.ReasonOutStr,
                        iRating: iRacing.sessionInfo.data.DriverInfo.Drivers.find(d => d.CarIdx === position.CarIdx).IRating,
                        carClassColor: '#' + iRacing.sessionInfo.data.DriverInfo.Drivers.find(d => d.CarIdx === position.CarIdx).CarClassColor.toString(16),
                        delta: position.LastTime === -1 ? '' :
                            (position.Position > 1  ? 
                                iRacing.sessionInfo.data.SessionInfo.Sessions[currentSessionId].ResultsPositions.find(p => p.Position === position.Position - 1).LastTime === -1 ?'':
                                (position.LastTime - iRacing.sessionInfo.data.SessionInfo.Sessions[currentSessionId].ResultsPositions.find(p => p.Position === position.Position - 1).LastTime)
                                : ''),
                    });
                }
            });
        }else if(iRacing.sessionInfo){
            iRacing.sessionInfo.data.DriverInfo.Drivers.forEach(driver => {
                standings.push({
                    timeRemaining: iRacing.telemetry.values.SessionTimeRemain?
                        new Date(iRacing.telemetry.values.SessionTimeRemain * 1000).toISOString().substr(11, 8):0,
                    lapsRemaining: iRacing.telemetry.values.SessionLapsRemain?iRacing.telemetry.values.SessionLapsRemain:0,
                    manufacturer: '',
                    tireCompound: iRacing.telemetry.values.CarIdxTireCompound[driver.CarIdx],
                    position: 0,
                    carIdx: driver.CarIdx,
                    lap: 0,
                    gap: '',
                    interval: '',
                    name: '',
                    number: '',
                    time: 0,
                    fastestLap: 0,
                    bestLap: 0,
                    lastLap1: 0,
                    lapsComplete: 0,
                    lapsLed: 0,
                    incidents: 0,
                    reasonOut: '',
                    iRating: driver.IRating,
                    carClassColor: '#' + driver.CarClassColor.toString(16),
                    delta: '',
                });
            });
        }
    }
    catch(err){
        console.log(err);
        console.log 
    }
    return standings;
}
function calculateRelative(){
    //binding of various car ids, positions, and instantiation of new arrays for relative positioning.
    var carIdxPlayer = iRacing.sessionInfo.data.DriverInfo.DriverCarIdx;
    var carIdxEstTime = iRacing.telemetry.values.CarIdxEstTime;
    var carIdxLapDistPct = iRacing.telemetry.values.CarIdxLapDistPct;
    var allDrivers = iRacing.sessionInfo.data.DriverInfo.Drivers;
    var carIdxPosition = iRacing.telemetry.values.CarIdxClassPosition;
    var carIdxName = new Array();
    var relativeData=new Array();

    //iterate through each driver with an existing car in the world.
    for(var i =0;i<allDrivers.length;i++){
        if(iRacing.telemetry.values.CarIdxTrackSurface[i] != 'NotInWorld' && allDrivers[i].UserName != 'Pace Car'){
            //estimated lap time for distance:time ratio
            var estLapTime = iRacing.sessionInfo.data.DriverInfo.DriverCarEstLapTime;
            var correctionRatio = estLapTime/iRacing.sessionInfo.data.DriverInfo.Drivers[i].CarClassEstLapTime
            //wrap anyone more than half a lap ahead to the bottom of the list(behind) and anyone more than half a lap behind to the top of the list (ahead)
            //else, simply calculate the difference between the positions
            if (carIdxLapDistPct[i] - carIdxLapDistPct[carIdxPlayer] > .5){
                relativePosition = (carIdxEstTime[i]*correctionRatio - carIdxEstTime[carIdxPlayer])-estLapTime;
            }else if(carIdxLapDistPct[carIdxPlayer] - carIdxLapDistPct[i] > .5){
                relativePosition = (carIdxEstTime[i]*correctionRatio - carIdxEstTime[carIdxPlayer])+estLapTime;
            }else{
                relativePosition = carIdxEstTime[i]*correctionRatio - carIdxEstTime[carIdxPlayer];
            }

            //checks for if the car is on the same racing lap as the player
            var lapAhead = false;
            var lapBehind = false;
            if(iRacing.telemetry.values.SessionNum == raceSession) {
                if((carIdxLapDistPct[carIdxPlayer] + iRacing.telemetry.values.CarIdxLapCompleted[carIdxPlayer]) - (carIdxLapDistPct[i] + iRacing.telemetry.values.CarIdxLapCompleted[i]) > .5){
                    lapBehind = true;
                }else if((carIdxLapDistPct[carIdxPlayer] + iRacing.telemetry.values.CarIdxLapCompleted[carIdxPlayer]) - (carIdxLapDistPct[i] + iRacing.telemetry.values.CarIdxLapCompleted[i]) < -.5){
                    lapAhead = true;
                }else{
                    lapAhead = false;
                    lapBehind = false;
                }
            }
            //build a key/value array for the driver data
            carIdxName[i]={
                'id':allDrivers[i].CarIdx,
                'name':allDrivers[i].UserName,
                'number':allDrivers[i].CarNumber,
                'iRating':iRacing.sessionInfo.data.DriverInfo.Drivers[i].IRating,
            }
            //convert iRacing class color to hex string for styling
            var carClassColor = '#' + iRacing.sessionInfo.data.DriverInfo.Drivers[i].CarClassColor.toString(16);

            //car specific tyre colors
            var carName = iRacing.sessionInfo.data.DriverInfo.Drivers[i].CarScreenName;
            var tyreCompound;
            if(carName == 'Mercedes-AMG W13 E Performance' || carName == 'Mercedes-AMG W12 E Performance' || carName == 'McLaren MP4-30' || carName == 'Dallara iR-01'){
                switch (iRacing.telemetry.values.CarIdxTireCompound[i]){
                    case -2:
                        //not used
                        tyreCompound =3;
                        break;
                    case -1:
                        //not used
                        tyreCompound = 4;
                        break;
                    case 0:
                        tyreCompound = 0
                        break;
                    case 1:
                        tyreCompound = 1
                        break;
                    case 2:
                        tyreCompound = 2
                        break;
                }
            }else{
                tyreCompound = iRacing.telemetry.values.CarIdxTireCompound[i] + 2;
            }
            //append the calculated data to the end of the relative data array, including the driver information for searching and display later
            relativeData.push({
                'carIdxName': carIdxName[i],
                'carIdxPosition': carIdxPosition[i],
                'relativePosition':relativePosition.toFixed(2),
                'lapAhead':lapAhead,
                'lapBehind':lapBehind,
                'carClassColor':carClassColor,
                'tyreType': tyreCompound,
                'manufacturer': manufacturer.get(iRacing.sessionInfo.data.DriverInfo.Drivers[i].CarID),
            });
        } 
        //sort the drivers by their relative position on track to the current driver (current driver should always math out to 0)
        relativeData.sort((a,b) => b.relativePosition-a.relativePosition)
        }
    return {
        //return the data and the player's index for display in the relative overlay
        'relativeData':relativeData,
        'playerId':carIdxPlayer
    };
}
function getDriverInputs(){
   return {
        throttle: iRacing.telemetry.values.Throttle,
        brake: iRacing.telemetry.values.Brake,
        clutch: 1-iRacing.telemetry.values.Clutch,
        steeringPct: (iRacing.telemetry.values.SteeringWheelAngle/iRacing.telemetry.values.SteeringWheelAngleMax) + .5,
        steeringRaw:(iRacing.telemetry.values.SteeringWheelAngle),
        speed:iRacing.telemetry.values.Speed,
        gear:iRacing.telemetry.values.Gear
    };
}
function trackMapData(){
    try{
        //fetch the track map URL from the session info
        let trackID = iRacing.sessionInfo.data.WeekendInfo.TrackID;
        if(tracks[trackID] != undefined){
            trackMapURL = tracks[trackID].track_map;
        }
        let driverPositions = [];
        if (iRacing.telemetry.values.CarIdxLapDistPct) {
            for (let i = 0; i < iRacing.telemetry.values.CarIdxLapDistPct.length; i++) {
                if(iRacing.sessionInfo.data.DriverInfo.Drivers[i] != undefined)
                if (iRacing.telemetry.values.CarIdxTrackSurface[i] !== 'NotInWorld') {
                    driverPositions.push({
                        carIdx: i,
                        carNumber: iRacing.sessionInfo.data.DriverInfo.Drivers[i].CarNumber,
                        classPosition: iRacing.telemetry.values.CarIdxClassPosition[i],
                        x: iRacing.telemetry.values.CarIdxLapDistPct[i],
                        playerCar: i===iRacing.telemetry.values.PlayerCarIdx
                    });
                }
            }
        }
        return{
            driverPositions: driverPositions,
            trackDirection: iRacing.sessionInfo.data.WeekendInfo.TrackDirection,
            trackMapURL: trackMapURL,
            track: iRacing.sessionInfo.data.WeekendInfo.TrackName
        }
    }catch(err){
        console.log(err);
    }
}
//module exports
//
//export the Fuel values used in the Fuel Calculator Overlay
module.exports.FuelData = () =>{return fuelData};
//export the Relative positioning data used in the Relative Overlay
module.exports.RelativeData = ()=>{return relativeData};
//export the isRunning boolean for the main thread to permit access and sending of the data in this module
module.exports.isRunning = ()=> {return isRunning};
//export driver inputs
module.exports.driverInputs=()=>{return driverInputs}
//export the standings data for websocket transmission
module.exports.calculateStandings = ()=>{return calculateStandings()};
//export array of exposed useful variables
module.exports.dropDownOptionsMapping = ()=>{return dropDownOptionsMapping};
//export garage state
module.exports.isInGarage =()=>{return _isInGarage}
//export track map URL
module.exports.trackMapData = ()=>{return trackMapData()};