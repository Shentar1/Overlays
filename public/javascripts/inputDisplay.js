var throttle = 0;
var brake = 0 ;
var clutch = 0;
var steering = 0;
var speed = 0;
var gear = 0;
document.onreadystatechange = ()=>{
    if(document.readyState == 'complete'){
        var trace1 = {
            y: [clutch, brake, throttle],
            marker:{
              color: ['rgba(51,51,255,1)', 'rgba(255,25,25,1)', 'rgba(51,255,51,1)']
            },
            type: 'bar'
          };
          var data = [trace1];
          var layout = {
            yaxis:{
                range:[0,1],
                showline:false,
                showspikes:false,
                showticklabels:false,
                showgrid:false,
                gridcolor:'#ddda',
            },
            xaxis:{
                showline:false,
                showspikes:false,
                showticklabels:false,
                showgrid:false,
            },
            margin:{
                l:0,
                r:0,
                t:5,
                b:0,
            },
            showlegend:false,
            displayModeBar:false,
            plot_bgcolor:'#0000',
            paper_bgcolor:'#0000'
          
          };
        socket.on('sentDriverInputs',(inputs)=>{
            throttle = inputs.throttle;
            brake = inputs.brake;
            clutch = inputs.clutch;
            steering = inputs.steeringRaw;
            speed = inputs.speed;
            gear=inputs.gear
            if(gear == "-1"){
                gear = "R";
            }else if(gear == "0"){
                gear = "N";
            }
            data[0].y = [clutch,brake,throttle];
            Plotly.react('inputDisplay', data,layout,{displayModeBar:false, staticPlot:true});
            var inputs = document.getElementById('inputValues').children;
            for(var i = 0; i<inputs.length; i++){
                inputs[i].innerHTML = Math.round(data[0].y[i]*100) + '%';
            }
            var steeringWheel = document.getElementById('wheel');
            steeringWheel.style.transform = 'rotate(' + -steering + 'rad)';

            var gearDiv = document.getElementById('gearDiv');
            gearDiv.style.transform = 'rotate('+ -steering +'rad)';
            gearDiv.innerHTML = "<br/>"+gear;

            var speedDisplay = document.getElementById('speed');
            isNaN(speed)?speedDisplay.innerHTML = 0 + 'km/h':speedDisplay.innerHTML = (speed*3.6).toFixed(0) + 'km/h';
        })
    }
}