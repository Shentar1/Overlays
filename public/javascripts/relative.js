var rowsAhead;
var rowsBehind;
var showCarBrand;
var show_iRating;
var showTyres;

document.onreadystatechange = ()=>{
    if(document.readyState == "complete"){
        var table = document.getElementById('table');
        socket.emit('getRelativeSettings');
        var header1 = document.getElementById('header1');
        var header2 = document.getElementById('header2');
        var header3 = document.getElementById('header3');
        var footer1 = document.getElementById('footer1');
        var footer2 = document.getElementById('footer2');
        var footer3 = document.getElementById('footer3');
        socket.on("initializeRelativeWindow", (settings)=>{
            rowsAhead = settings.rowsAhead;
            rowsBehind = settings.rowsBehind;
            showCarBrand = settings.showCarBrand;
            showTyres = settings.showTyres;
            show_iRating = settings.show_iRating;
            zoom = settings.zoom;
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
            initializeTable(table,rowsAhead,rowsBehind);
            
            document.body.style.scale = zoom/10;
            document.body.style.transformOrigin = "0 0"
            for(var i = 0; i<document.body.children.length; i++){
                document.body.children[i].style.transformOrigin = "0 0"
            }
            socket.emit('sentRelativeSize', table.scrollWidth, document.body.scrollHeight, (response)=>{
                if(response.status == "ok"){
                    setInterval(()=> {
                        socket.emit("requestRelativeData");
                    }, 1000/60);
                }
            });
        });
        socket.on('sentRelativeHeaderData',(header1,header2,header3,footer1,footer2,footer3)=>{
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
        socket.on('sentRelativeData', (relativeData, playerCarId)=>{
            var playerIndex;
            for(var i=0; i<relativeData.length; i++){
                if(relativeData[i].carIdxName["id"] == playerCarId){
                    playerIndex = i;
                }
            }
            for(var i = -1*rowsAhead; i<=rowsBehind; i++){
                if(playerIndex + i >= 0 && playerIndex + i <relativeData.length && playerIndex != undefined){
                    var carData = relativeData[i+playerIndex];
                    var position = carData['carIdxPosition'];
                    var relativePosition = carData['relativePosition'];
                    var driverInfo = carData['carIdxName'];
                    var id = driverInfo['id']
                    var name = driverInfo['name'];
                    var number = driverInfo['number'];
                    var iRating = driverInfo['iRating'];
                    var lapAhead = carData['lapAhead'];
                    var lapBehind = carData['lapBehind'];
                    var carClassColor = carData['carClassColor'] + 'AA';
                    var tyreCompound = carData['tyreType'];
                    var manufacturer = carData['manufacturer'];
                    table.rows[i +(rowsAhead)].cells[3].innerHTML = relativePosition;
                    for(var j = 0; j< table.rows[i+(rowsAhead)].cells[2].children.length -1; j++){
                        table.rows[i+(rowsAhead)].cells[2].children[j].style.display = 'none';
                    }
                    if(showTyres){
                        table.rows[i+(rowsAhead)].cells[2].children[tyreCompound+1].style.display = 'inline-block';
                    }else{
                        table.rows[i+(rowsAhead)].cells[2].children[tyreCompound+1].style.display = 'none';
                    }
                    if(show_iRating){
                        table.rows[i+(rowsAhead)].cells[2].children[7].style.display = 'inline-block';
                    }else{
                        table.rows[i+(rowsAhead)].cells[2].children[7].style.display = 'none';
                    }
                    if(showCarBrand){
                        table.rows[i+(rowsAhead)].cells[2].children[0].style.display = 'inline-block';
                    }
                    table.rows[i+(rowsAhead)].cells[2].children[0].src = manufacturer;
                    table.rows[i+(rowsAhead)].cells[2].children[6].innerHTML = name;
                    table.rows[i+(rowsAhead)].cells[2].children[6].style.display = 'inline-block';
                    table.rows[i+(rowsAhead)].cells[2].children[7].innerHTML = iRating;
                    table.rows[i +(rowsAhead)].cells[1].innerHTML = number;
                    if(carClassColor != "#ffffffAA"){
                        table.rows[i+(rowsAhead)].cells[1].style.color = 'black';
                        table.rows[i +(rowsAhead)].cells[1].style.backgroundColor = carClassColor;
                    }else{
                        table.rows[i+(rowsAhead)].cells[1].style.color = 'white';
                        table.rows[i+(rowsAhead)].cells[1].style.backgroundColor = 'transparent'
                    }
                    table.rows[i +(rowsAhead)].cells[0].innerHTML = position == 0? '':position;
                    if(lapAhead){
                        table.rows[i+(rowsAhead)].style.color = "#F22";
                    }else if(lapBehind){
                       table.rows[i+(rowsAhead)].style.color = "#55F";                        
                    }else{
                        table.rows[i+(rowsAhead)].style.color = "#FFF";
                    }
                }else{
                    table.rows[i +(rowsAhead)].cells[3].innerHTML = ' ';
                    table.rows[i +(rowsAhead)].cells[2].children[5].innerHTML = ' ';
                    for(var j =0; j<table.rows[i+(rowsAhead)].cells[2].children.length; j++){
                        table.rows[i+(rowsAhead)].cells[2].children[j].style.display = 'none';
                    }
                    table.rows[i +(rowsAhead)].cells[1].innerHTML = ' ';
                    table.rows[i +(rowsAhead)].cells[1].style.backgroundColor = 'transparent';
                    table.rows[i +(rowsAhead)].cells[0].innerHTML = ' ';
                }
            }
        });
        socket.on('clearOverlays', ()=>{
            for(var i = 0;i< table.rows.length; i++){
                for(var j = 0; j< table.rows[i].cells.length; j++){
                    if(table.rows[i].cells[j].hasChildNodes()){
                        for(var h = 0; h<table.rows[i].cells[j].children.length; h++){
                            table.rows[i].cells[j].children[h].innerHTML = ""
                        }
                    }else{
                        table.rows[i].cells[j].innerHTML = ""
                    }
                }
            }
        });
        socket.on('relativeTableSize',(a,b)=>{
            initializeTable(document.getElementById('table'),a,b);
            rowsAhead = a;
            rowsBehind = b;
        })
        socket.on('relativeSliderChanged',(id, checked)=>{
            switch(id){
                case 'show_iRating':
                    show_iRating = checked;
                    break;
                case 'showTyres':
                    showTyres = checked;
                    break;
                case 'showBranding':
                    showCarBrand = checked;
                    break;
            }
        })
        socket.on('relativeSelectChangedDiv',(value,id)=>{
            if(value !='-none-'){
                document.getElementById(id).style.display = 'table-cell';
                document.getElementById(id).innerHTML = value;
            }else{
                document.getElementById(id).style.display = 'none';
            }
            socket.emit('sentRelativeSize', table.scrollWidth, document.body.scrollHeight,(response)=>{
        
            });
        })
        socket.on('changeRelativeZoom',(zoom)=>{
            document.body.style.scale = zoom/10;
            document.body.style.transformOrigin = "0 0"
            for(var i = 0; i<document.body.children.length; i++){
                document.body.children[i].style.transformOrigin = "0 0"
            }
            socket.emit('sentRelativeSize',table.scrollWidth,document.body.scrollHeight,(response)=>{
    
            });
        })
    }
}
function initializeTable(t, ra, rb) {
    t.innerHTML = "";
    for (var i = 0; i < ra + rb + 1; i++) {
        tr = t.insertRow();
        tr.style.height = '19px';
        td1 = tr.insertCell();
        td1.style.textAlign = 'center';
        td1.style.width='30px';
        td2 = tr.insertCell();
        td2.style.textAlign = 'center';
        td2.style.width='50px';
        td3 = tr.insertCell();

        var soft = document.createElement('img');
        soft.src='images/soft.png';
        soft.style.height='14px';
        soft.style.width='14px';
        soft.style.verticalAlign = 'text-top';
        soft.style.paddingRight = '5px';
        soft.style.paddingTop = '1px';
        soft.style.display = "none";

        var medium = document.createElement('img');
        medium.src='images/medium.png';
        medium.style.height='14px';
        medium.style.width='14px';
        medium.style.verticalAlign = 'text-top';
        medium.style.paddingRight = '5px';
        medium.style.paddingTop = '1px';
        medium.style.display = "none";


        var hard = document.createElement('img');
        hard.src='images/hard.png';
        hard.style.height='14px';
        hard.style.width='14px';
        hard.style.verticalAlign = 'text-top';
        hard.style.paddingRight = '5px';
        hard.style.paddingTop = '1px';
        hard.style.display = "none";


        var inter = document.createElement('img');
        inter.src='images/inter.png';
        inter.style.height='14px';
        inter.style.width='14px';
        inter.style.verticalAlign = 'text-top';
        inter.style.paddingRight = '5px';
        inter.style.paddingTop = '1px';
        inter.style.display = "none";


        var wet = document.createElement('img');
        wet.src='images/wet.png';
        wet.style.height='14px';
        wet.style.width='14px';
        wet.style.verticalAlign = 'text-top';
        wet.style.paddingRight = '5px';
        wet.style.paddingTop = '1px';
        wet.style.display = "none";
        
        var manufacturerImg = document.createElement('img');
        manufacturerImg.style.height='14px';
        manufacturerImg.style.width='14px';
        manufacturerImg.style.verticalAlign = 'text-top';
        manufacturerImg.style.paddingTop = '1px';
        manufacturerImg.style.paddingRight = '5px';
        manufacturerImg.style.display = 'none';

        var nameDiv = document.createElement('div');
        nameDiv.style.display='inline-block';
        nameDiv.style.flexGrow=1;
        nameDiv.style.overflow='hidden';
        nameDiv.style.textOverflow='ellipsis';
        nameDiv.style.whiteSpace='nowrap';
        nameDiv.style.paddingRight = '5px';
        nameDiv.style.paddingTop = '1px';
        nameDiv.style.width = '170px';

        var iRatingDiv = document.createElement('div');
        iRatingDiv.style.display = 'none';
        iRatingDiv.style.width = '40px';
        iRatingDiv.style.height = '14px';
        iRatingDiv.style.marginTop = '2px';
        iRatingDiv.style.backgroundColor = '#FFFA';
        iRatingDiv.style.borderRadius = '2px';
        iRatingDiv.style.color = 'black';
        iRatingDiv.style.textAlign = 'center'
        iRatingDiv.style.fontSize = '12px';
        
        

        td3.appendChild(manufacturerImg);
        td3.appendChild(soft);
        td3.appendChild(medium);
        td3.appendChild(hard);
        td3.appendChild(wet);
        td3.appendChild(inter); 
        td3.appendChild(nameDiv);
        td3.appendChild(iRatingDiv);

        td3.style.width = '250px';
        td3.style.overflow ='hidden';
        td3.style.display = 'flex';

        td4 = tr.insertCell();
        td4.style.textAlign = 'center';
        td4.style.width='100px';
    }
    t.rows[ra].style.backgroundColor = '#FF02';
    document.getElementById('header').style.width = table.scrollWidth.toString() + 'px';
    document.getElementById('footer').style.width = table.scrollWidth.toString() + 'px';

    socket.emit('sentRelativeSize', table.scrollWidth, document.body.scrollHeight,(response)=>{
        
    });
}
