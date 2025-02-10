var settingsFrame;
var url;
var port;
document.onreadystatechange = ()=>{
    if(document.readyState == 'complete'){
        document.getElementById('fuelCalculator').onclick = openFuelCalculator;
        document.getElementById('relative').onclick = openRelative;
        document.getElementById('close').onclick = close;
        document.getElementById('minimize').onclick = min;
        document.getElementById('HideOverlays').onclick = hide;
        document.getElementById('HideOverlays').className = 'overlaysShownButton';
        document.getElementById('InputDisplay').onclick = openInputDisplay;
        document.getElementById('InputTelemetry').onclick = openInputTelemerty;
        document.getElementById('Standings').onclick = openStandings;
        document.getElementById('GlobalSettings').onclick = openGlobalSettings;
        settingsFrame = document.getElementById('settingsFrame');
        url = document.URL;
        url = url.split('/')
        port = url[2].slice(10);
        document.URL = 'http://localhost:' + port + '/' + url[3];
    }
}
function openFuelCalculator(){
    var fuelUrl =  "http://localhost:" + port + "/html/fuelCalculatorSettings.html";
    settingsFrame.src = fuelUrl;
}
function openRelative(){
    settingsFrame.src = "http://localhost:" + port +"/html/relativeSettings.html";
}
function openInputDisplay(){
    settingsFrame.src = "http://localhost:" + port +'/html/inputDisplaySettings.html';
}
function openInputTelemerty(){
    settingsFrame.src = "http://localhost:" + port +'/html/inputTelemetrySettings.html'
}
function openStandings(){
    settingsFrame.src = "http://localhost:" + port +'/html/standingsSettings.html'
}
function openGlobalSettings(){
    settingsFrame.src = "http://localhost:" + port +'/html/globalSettings.html'
}
function close(){
    window.toolBarFunctions.close();
}
function min(){
    window.toolBarFunctions.min();
}
function hide(){
    socket.emit("hideAllOverlays",(response)=>{
        if(response.hidden){
            document.getElementById('HideOverlays').className = "overlaysHiddenButton";
        }else{
            document.getElementById('HideOverlays').className = "overlaysShownButton"
        }
    })
}
function sliderChanged(element){
    socket.emit('globalSettingsSliderChanged',element.id,element.value);
}
socket.on('portChanged',(newPort)=>{
    port = newPort;
    document.URL = 'http://localhost:' + port + '/' + url[3];
})