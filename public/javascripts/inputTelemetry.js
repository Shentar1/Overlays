var throttle = new Array(241);
var brake = new Array(241);
var clutch = new Array(241);
var steering = new Array(241);
var inputs = new Array();
var layout;
document.onreadystatechange = ()=>{
    var body = document.getElementById('telemetryChart')
    if(document.readyState == 'complete'){
        var steeringTrace = {
            y:steering,
            mode:'lines',
            line:{
                color:'#aaa',
                width:3
            }
        }
        var clutchTrace = {
            y:clutch,
            mode:'lines',
            line:{
                color:'#00f',
                width:3
            }
        }
        var brakeTrace = {
            y:brake,
            mode:'lines',
            line:{
                color:'#f00',
                width:3
            }
        }
        var throttleTrace = {
            y:throttle,
            mode:'lines',
            line:{
                color:'#0f0',
                width:3
            }
        }

        layout = {
            xaxis:{
                autorange:false,
                showline:false,
                showspikes:false,
                showticklabels:false,
                showgrid:true,
                dtick:60,
            },
            yaxis:{
                autorange:false,
                width:2,
                dtick:0.25,
                range:[-0.01,1.01],
                showline:false,
                showspikes:false,
                showticklabels:false,
                showgrid:true,
                gridcolor:'#ddda',
            },
            autosize:true,
            margin:{
                l:0,
                r:0,
                t:0,
                b:0,
            },
            showlegend:false,
            displayModeBar:false,
            plot_bgcolor:'#000a',
            paper_bgcolor:'#0000'
        }
        socket.emit('getInputTelemetrySettings',(callback)=>{
            throttle.length = callback.time*60 + 1;
            brake.length = callback.time*60 + 1;
            clutch.length = callback.time*60 + 1;
            steering.length = callback.time*60 + 1;
            layout.xaxis.range = [0,callback.time*60]
        })
        inputs = ([steeringTrace,clutchTrace,throttleTrace, brakeTrace]);
        var chart = Plotly.newPlot('telemetryChart', inputs,layout,{displayModeBar:false, staticPlot:true, responsive:true});
        socket.on('sentDriverInputs',(inputs)=>{
            throttle.push(inputs.throttle);
            brake.push(inputs.brake);
            clutch.push(inputs.clutch);
            steering.push(inputs.steeringPct);
            for(var i = throttle.length - 1; i<throttle.length;i++){
                throttle.splice(0,1)
            }
            for(var i = brake.length -1; i<brake.length;i++){
                brake.splice(0,1)
            }
            for(var i = clutch.length -1; i<clutch.length;i++){
                clutch.splice(0,1)
            }
            for(var i = steering.length -1; i<steering.length;i++){
                steering.splice(0,1)
            }
            Plotly.redraw('telemetryChart');
        })
        
    }
    socket.on('changeInputTelemetryTimeRange', (time)=>{
        throttle.length = time*60 + 1;
        brake.length = time*60 + 1;
        clutch.length = time*60 + 1;
        steering.length = time*60 + 1;
        layout.xaxis.range=[0,time*60]
        Plotly.redraw('telemetryChart');
    })
}