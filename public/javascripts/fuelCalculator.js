
document.onreadystatechange = ()=>{
    if(document.readyState == 'complete'){
        var table = document.getElementById('fuelTable');
        setInterval(()=> {
            socket.emit("requestFuelData");
        }, 1000/60);
        socket.emit('getFuelCalculatorSettings',(settings)=>{
            var header1 = document.getElementById('header1');
            var header2 = document.getElementById('header2');
            var header3 = document.getElementById('header3');
            var footer1 = document.getElementById('footer1');
            var footer2 = document.getElementById('footer2');
            var footer3 = document.getElementById('footer3');
            if(settings!=undefined){
                if(settings.header1 != "-none-"){
                    header1.style.display = 'table-cell';
                    header1.innerHTML = settings.header1
                }
                if(settings.header2 != "-none-"){
                    header2.style.display = 'table-cell';
                    header2.innerHTML = settings.header2;
                }
                if(settings.header3 != "-none-"){
                    header3.style.display = 'table-cell';
                    header3.innerHTML = settings.header3
                }
                if(settings.footer1 != "-none-"){
                    footer1.style.display = 'table-cell';
                    footer1.innerHTML = settings.footer1;
                }
                if(settings.footer2 != "-none-"){
                    footer2.style.display = 'table-cell';
                    footer2.innerHTML = settings.footer2
                }
                if(settings.footer3 != "-none-"){
                    footer3.style.display = 'table-cell';
                    footer3.innerHTML = settings.footer3
                }   
            }
        })
        socket.on('sentFuelCalculatorHeaderData',(header1,header2,header3,footer1,footer2,footer3)=>{
            var a = new Array()
            a.push([document.getElementById('header1'),header1])
            a.push([document.getElementById('header2'),header2])
            a.push([document.getElementById('header3'),header3])
            a.push([document.getElementById('footer1'),footer1])
            a.push([document.getElementById('footer2'),footer2])
            a.push([document.getElementById('footer3'),footer3])
            a.forEach(function(element){
                element[0].innerHTML = element[1];
            })
        })
        socket.on('sentFuelData',(fuelData)=>{
            document.getElementById('currentFuel').innerHTML = "Fuel:<br/>" + fuelData.currentFuel.toFixed(2);
            document.getElementById('avgLapsRemaining').innerHTML = fuelData.avgFuelLapsRemaining.toFixed(2);
            document.getElementById('avgFuelPerLap').innerHTML = fuelData.avgFuelPerLap.toFixed(2)
            document.getElementById('avgFuelToAdd').innerHTML = fuelData.avgRefill.toFixed(2)
            document.getElementById('maxLapsRemaining').innerHTML = fuelData.maxFuelLapsRemaining.toFixed(2)
            document.getElementById('maxFuelPerLap').innerHTML = fuelData.maxFuelPerLap.toFixed(2)
            document.getElementById('maxFuelToAdd').innerHTML = fuelData.maxRefill.toFixed(2)
            document.getElementById('minLapsRemaining').innerHTML = fuelData.minFuelLapsRemaining.toFixed(2)
            document.getElementById('minFuelPerLap').innerHTML = fuelData.minFuelPerLap.toFixed(2)
            document.getElementById('minFuelToAdd').innerHTML = fuelData.minRefill.toFixed(2)
        });
        socket.on('clearOverlays',()=>{
            document.getElementById('currentFuel').innerHTML = "Fuel:<br/>" + '0'.toFixed(2);
            document.getElementById('avgLapsRemaining').innerHTML = '0'.toFixed(2);
            document.getElementById('avgFuelPerLap').innerHTML = '0'.toFixed(2);
            document.getElementById('avgFuelToAdd').innerHTML = '0'.toFixed(2);
            document.getElementById('maxLapsRemaining').innerHTML = '0'.toFixed(2);
            document.getElementById('maxFuelPerLap').innerHTML = '0'.toFixed(2);
            document.getElementById('maxFuelToAdd').innerHTML = '0'.toFixed(2);
            document.getElementById('minLapsRemaining').innerHTML = '0'.toFixed(2);
            document.getElementById('minFuelPerLap').innerHTML = '0'.toFixed(2);
            document.getElementById('minFuelToAdd').innerHTML = '0'.toFixed(2);
        });
        socket.on('fuelCalculatorSelectChangedDiv',(value,id)=>{
            if(value !='-none-'){
                document.getElementById(id).style.display = 'table-cell';
                document.getElementById(id).innerHTML = value;
            }else{
                document.getElementById(id).style.display = 'none';
            }
        })
    }
}