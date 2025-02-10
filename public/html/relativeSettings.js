var socket = io(); 

document.onreadystatechange = ()=>{
    if(document.readyState == "complete"){  
        var selectOptions = document.getElementsByTagName('select');
        dropDownOptions.forEach(e => {
            for(var i = 0; i<selectOptions.length; i++){
                var option = document.createElement('option');
                option.text = e;
                option.value = e;
                selectOptions[i].add(option);
            }
        });
        socket.emit("getRelativeOverlayStatus",(response)=>{
            document.getElementById('link').innerHTML = "localhost:"+response.port+"/relative";
        });
        document.getElementById('toggleRelativeOverlay').onclick = ()=>{
            var openFuelOverlayButton = document.getElementById('toggleRelativeOverlay')
            socket.emit('OpenRelative');
        }
        document.getElementById('lockRelativeOverlay').onclick = ()=> {
            socket.emit("lockRelativeOverlay")
        }
        socket.on('relativeOverlayToggled',(open)=>{
            var button = document.getElementById('toggleRelativeOverlay')
            if(open){
                button.style.backgroundColor = '#00B7FF';
            }else{
                button.style.backgroundColor = '#111f';
            }
        })
        socket.on('relativeOverlayLockStateChanged', (locked)=>{
            var button = document.getElementById('lockRelativeOverlay')
            if(locked){
                button.style.backgroundColor = '#00B7FF';
            }else{
                button.style.backgroundColor = '#111f';
            }
        })
        socket.on('setCarCount', (a,b)=>{
            document.getElementById('carsAhead').value = a;
            document.getElementById('carsBehind').value = b;
        })
        socket.on('setRelativeSliders',(show_iRating,showCarBrand,showTyres)=>{
            document.getElementById('show_iRating').checked = show_iRating;
            document.getElementById('showBranding').checked = showCarBrand;
            document.getElementById('showTyres').checked = showTyres;
        })
        socket.on('setRelativeSelects',(header1,header2,header3,footer1,footer2,footer3)=>{
            var selects = document.getElementsByTagName('select');
            dropDownOptions.forEach(function (value, i){
                if(value == header1){
                    selects[0].selectedIndex = i
                }
                if(value == header2){
                    selects[1].selectedIndex = i
                }
                if(value == header3){
                    selects[2].selectedIndex = i
                }
                if(value == footer1){
                    selects[3].selectedIndex = i
                }
                if(value == footer2){
                    selects[4].selectedIndex = i
                }
                if(value == footer3){
                    selects[5].selectedIndex = i
                }
            })
        })
        socket.on('setRelativeZoom',(zoom)=>{
            document.getElementById('zoomRange').value = zoom;
            document.getElementById('zoomRange').previousElementSibling.innerHTML = 'Scale: ' + zoomRange.value;
        })
    }
    document.getElementById('zoomRange').oninput = ()=>{
        document.getElementById('zoomRange').previousElementSibling.innerHTML = 'Scale: ' + zoomRange.value;
        socket.emit('relativeZoomChanged',document.getElementById('zoomRange').value)
    }
}
function changeCarCount(){
    var ahead = parseInt(document.getElementById('carsAhead').value);
    var behind = parseInt(document.getElementById('carsBehind').value);
    socket.emit('carCountChanged', ahead, behind)
}
function sliderChanged(element){
    socket.emit('relativeSliderChanged',element.id, element.checked);
}
function selectChanged(element){
    socket.emit('relativeSelectChanged', element.value, element.id);
}