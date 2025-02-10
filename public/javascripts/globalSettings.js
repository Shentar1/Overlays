var socket = io();
function changePort(element){
    if(element.value < 1025){
        element.value = 1025;
    }else if(element.value > 60000){
        element.value = 60000;
    }
    socket.emit('portChanged',element.value)
}
function sliderChanged(element){
    socket.emit('globalSettingsSliderChanged',element.id, element.checked);
}
document.onreadystatechange = ()=>{
    if(document.readyState =='complete'){
        socket.emit('getGlobalSettings', (response)=>{
            document.getElementById('port').value = response.port;
            document.getElementById('hideWhenInGarage').checked = response.hideWhenInGarage;
        })
    }
}