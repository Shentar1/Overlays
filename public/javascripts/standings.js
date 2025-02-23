var rowsAhead;
var rowsBehind;
var showCarBrand;
var show_iRating;
var showTyres;
// Calculate how many rows to show initially (15) and how many remaining
let totalRows = 63;
let visibleRows = Math.min(15, totalRows);
let remainingRows = totalRows - visibleRows;
let currentStartIndex = visibleRows;

document.onreadystatechange = ()=>{
    if(document.readyState == "complete"){
        let body = document.getElementById('table');
        let table = document.getElementsByTagName('table')[0];
        let pos = document.getElementsByClassName('pos');
        let num = document.getElementsByClassName('num');
        let name = document.getElementsByClassName('name');
        let gap = document.getElementsByClassName('gap');
        let int = document.getElementsByClassName('int');
        let bestLap = document.getElementsByClassName('bestLap');
        let lastLap1 = document.getElementsByClassName('lastLap1');
        let lastLap2 = document.getElementsByClassName('lastLap2');
        let lastLap3 = document.getElementsByClassName('lastLap3');
        let delta = document.getElementsByClassName('delta');
        let header = document.getElementById('header');
        let timeHeader = document.getElementById('timeHeader');
        let lapsHeader = document.getElementById('lapsHeader');
        

        for(let i = 0; i<63; i++){
            addTableRow(table,body);
        }
        socket.emit('getStandingsSettings',(response)=>{
            if(response.status == "ok"){
                rowsAhead = response.rowsAhead;
                rowsBehind = response.rowsBehind;
                showCarBrand = response.showCarBrand;
                show_iRating = response.show_iRating;
                showTyres = response.showTyres;
            }
        });
        socket.on('sentStandingsData', (standingsData, playerCarId)=>{
            var playerIndex;
            for(var i=0; i<standingsData.length; i++){
                if(standingsData[i].carIdx["id"] === playerCarId){
                    playerIndex = i;
                }
            }
           if(standingsData){
                totalRows = standingsData.length;
                if(standingsData[0].timeRemaining){
                    standingsData[0].timeRemaining!=="00:00:00"?timeHeader.style.display = 'inline-block':timeHeader.style.display = 'none';
                    standingsData[0].timeRemaining!=="00:00:00"?timeHeader.innerHTML = standingsData[0].timeRemaining:0;
                }else{
                    timeHeader.style.display = 'none';
                }
                if(standingsData.lapsRemaining){
                    standingsData[0].lapsRemaining!==0?lapsHeader.style.display = 'inline-block':lapsHeader.style.display = 'none';
                    standingsData[0].lapsRemaining!==0?lapsHeader.innerHTML = standingsData[0].lapsRemaining:0;
                }else{
                    lapsHeader.style.display = 'none';
                }
           }
            for(var i = 0; i<=standingsData.length; i++){
                if(standingsData[i] != undefined){
                    var _carData = standingsData[i];
                    var _position = _carData['position'];
                    var _gap = _carData['gap'];
                    var _interval = _carData['interval'];
                    var _relativePosition = _carData['relativePosition'];
                    var _driverInfo = _carData['carIdxName'];
                    var _id = _carData['carIdx']
                    var _name = _carData['name'];
                    var _number = _carData['number'];
                    var _iRating = _carData['iRating'];
                    var _lapAhead = _carData['lapAhead'];
                    var _lapBehind = _carData['lapBehind'];
                    var _carClassColor = _carData['carClassColor'] + 'AA';
                    var _tyreCompound = _carData['tireCompound'];
                    var _manufacturer = _carData['manufacturer'];
                    var _bestLap = _carData['bestLap'];
                    var _lastLap1 = _carData['lastLap1'];
                    var _lastLap2 = _carData['lastLap2'];
                    var _lastLap3 = _carData['lastLap3'];
                    var _delta = _carData['delta'];
                    
                    pos[i+1].innerHTML = _position;
                    pos[i+1].style.textAlign = 'right';
                    num[i+1].innerHTML = _number;
                    num[i+1].style.backgroundColor = _carClassColor;
                    num[i+1].style.color = 'black';
                    num[i+1].style.textAlign = 'center';
                    Array.from(name[i+1].children).filter(el=>el.tagName==='SPAN').forEach(span => span.innerHTML = _name);
                    Array.from(name[i+1].children).filter(el=>el.tagName==='DIV').forEach(div => div.innerHTML = _iRating);
                    name[i+1].querySelector('span').style.paddingLeft = '1vw';
                    gap[i+1].innerHTML = _gap;
                    gap[i+1].style.textAlign = 'center';
                    int[i+1].innerHTML = _interval;
                    int[i+1].style.textAlign = 'center';
                    bestLap[i+1].innerHTML = _bestLap;
                    bestLap[i+1].style.textAlign = 'center';
                    lastLap1[i+1].innerHTML = _lastLap1;
                    lastLap1[i+1].style.textAlign = 'center';
                    
                    //lastLap2[i+1].innerHTML = _lastLap2;
                    //lastLap3[i+1].innerHTML = _lastLap3;
                    delta[i+1].innerHTML = _delta;
                    delta[i+1].style.textAlign = 'center';
                    if (_delta < 0) {
                        delta[i+1].style.color = '#90EE90';
                    } else if (_delta > 0) {
                        delta[i+1].style.color = 'red';
                    }
                    // Format lap times as mm:ss.xxx
                    [_bestLap, _lastLap1, _delta].forEach((time, index) => {
                        if (!isNaN(time) && time !== '') {
                            const minutes = Math.floor(time / 60);
                            const seconds = Math.abs(time % 60).toFixed(3);
                            const formattedTime = `${minutes}:${seconds.padStart(6, '0')}`;
                            if (index === 0) bestLap[i+1].innerHTML = formattedTime;
                            if (index === 1) lastLap1[i+1].innerHTML = formattedTime;
                            if (index === 2) delta[i+1].innerHTML = time.toFixed(1);
                        }
                    });
                    // Show manufacturer logo if enabled
                    var images = Array.from(name[i+1].children).filter(el => el.tagName === 'IMG')
                    images.forEach(img => img.style.display = 'none');
                    if (showCarBrand && _manufacturer) {
                        const manufacturerImg = images.find(img => img.src.includes(_manufacturer.toLowerCase()));
                        if (manufacturerImg) manufacturerImg.style.display = 'block';
                    }else{
                        const manufacturerImg = images.find(img => img.src.includes(_manufacturer.toLowerCase()));
                        if (manufacturerImg) manufacturerImg.style.display = 'none';
                    }

                    // Show tire compound if enabled
                    if (showTyres && _tyreCompound) {
                        switch (_tyreCompound) {
                            case -2:
                                _tyreCompound = 'soft';
                                break;
                            case -1:
                                _tyreCompound = 'medium';
                                break;
                            case 0:
                                _tyreCompound = 'hard';
                                break;
                            case 1:
                                _tyreCompound = 'inter';
                                break;
                            case 2:
                                _tyreCompound = 'wet';
                                break;
                            default:
                                _tyreCompound = 'hard';
                                break;
                        }
                        const tireImg = Array.from(name[i+1].children).find(img => img.src.includes(_tyreCompound.toLowerCase()));
                        if (tireImg) tireImg.style.display = 'block';
                    }
                    else{
                        //const tireImg = Array.from(name[i+1].children).find(img => img.src.includes(_tyreCompound.toLowerCase()));
                        //if (tireImg) tireImg.style.display = 'none';
                    }
                    if(show_iRating){
                        let iRating = document.getElementsByClassName('iRating');
                        iRating[i].style.display = 'inline-block';
                        let n = document.getElementsByClassName('nameSpan');
                        n[i].style.width= '20vw';
                    }else{
                        document.getElementsByClassName('iRating')[i].style.display = 'none';
                        let n = document.getElementsByClassName('nameSpan')[i];
                        n.style.width= '25vw';
                    }
                    if(i<visibleRows){
                        body.rows[i].style.display = 'table-row';  
                    }
                }else{
                    
                }
            }
            if(playerIndex){
                body.rows[playerIndex].style.backgroundColor = 'rgba(0.5, 1, 0, 0.5)';
            }
            for(var i = standingsData.length; i<table.rows.length; i++){
                body.rows[i-1].style.display = 'none';
            }
        });
        socket.on('clearOverlays', ()=>{
            for(var i = 0;i< body.rows.length; i++){
                for(var j = 0; j< body.rows[i].cells.length; j++){
                    if(body.rows[i].cells[j].hasChildNodes()){
                        for(var h = 0; h<body.rows[i].cells[j].children.length; h++){
                            body.rows[i].cells[j].children[h].innerHTML = ""
                        }
                    }else{
                        body.rows[i].cells[j].innerHTML = ""
                    }
                }
                body.rows[i].style.display = 'none';
            }
            lapsHeader.innerHTML = '0/0';
            timeHeader.innerHTML = '00:00:00';
            lapsHeader.style.display = 'none';
            timeHeader.style.display = 'none';
        });
        socket.on('standingsTableSize',(a,b)=>{
            initializeTable(document.getElementById('table'),a,b);
            rowsAhead = a;
            rowsBehind = b;
        })
        socket.on('standingsSliderChanged',(id, checked)=>{
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
        socket.on('standingsSelectChangedDiv',(value,id)=>{
            if(value !='-none-'){
                document.getElementById(id).style.display = 'table-cell';
                document.getElementById(id).innerHTML = value;
            }else{
                document.getElementById(id).style.display = 'none';
            }
        })
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideAndFadeOut {
                0% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(17vw); opacity: 0; }
            }
            @keyframes slideAndFadeIn {
                0% { transform: translateX(-17vw); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Hide all rows beyond initial visible rows
        for (let i = visibleRows+5; i < body.rows.length; i++) {
            body.rows[i].style.display = 'none';
        }

        // Clear any existing interval
        if (window.standingsInterval) {
            clearInterval(window.standingsInterval);
        }
        
        // Set up interval to cycle through remaining rows
        if (remainingRows > 0) {
            window.standingsInterval = setInterval(() => {
                // Get all rows that have content
                const nonEmptyRows = Array.from(body.rows).filter(row => {
                    return Array.from(row.cells).some(cell => cell.textContent.trim() !== '');
                });
                
                // Animate out previous batch
                const rowsToHide = nonEmptyRows.slice(currentStartIndex, Math.min(currentStartIndex + 5, totalRows));
                rowsToHide.forEach(row => {
                    if (row) {
                    row.style.animation = 'slideAndFadeOut 0.5s forwards';
                    setTimeout(() => row.style.display = 'none', 500);
                    }
                });
                
                // Reset to start if we've shown all rows
                currentStartIndex = (currentStartIndex + 5 >= totalRows) ? visibleRows : currentStartIndex + 5;
                
                // Animate in next batch after previous animation completes
                setTimeout(() => {
                    const rowsToShow = nonEmptyRows.slice(currentStartIndex, Math.min(currentStartIndex + 5, totalRows));
                    rowsToShow.forEach(row => {
                    if (row) {
                        row.style.display = 'table-row';
                        row.style.animation = 'slideAndFadeIn 0.5s forwards';
                    }
                    });
                }, 500);
            }, 10000);
        }
    }
}
function addTableRow(table,body){
    tr =document.createElement('tr');
    body.appendChild(tr);
    for(var i = 0; i<table.firstChild.firstChild.children.length; i++){
        td = document.createElement('td');
        tr.appendChild(td);
        td.className = table.firstChild.firstChild.children[i].className;
        if(td.className == 'name'){
            var compounds = ['soft', 'medium', 'hard', 'inter', 'wet'];
            td.style.position = 'relative';
            compounds.forEach(compound => {
                let img = document.createElement('img');
                img.src = `../images/tires/${compound}.png`;
                img.style.height = '3vw';
                img.style.display = 'none';
                img.style.position = 'absolute';
                img.style.right = '0';
                img.style.top = '50%';
                img.style.transform = 'translateY(-50%)';
                td.appendChild(img);
            });
        let nameSpan = document.createElement('span');
        nameSpan.style.marginLeft = '3vw';
        nameSpan.style.overflow = 'hidden';
        nameSpan.style.textOverflow = 'ellipsis'; 
        nameSpan.style.whiteSpace = 'nowrap';
        nameSpan.style.width = '23vw';
        nameSpan.style.display = 'inline-block';
        nameSpan.style.verticalAlign = 'middle';
        nameSpan.className = 'nameSpan';

        let iRatingDiv = document.createElement('div');
        iRatingDiv.className = 'iRating';
        iRatingDiv.style.display = 'none';
        iRatingDiv.style.width = '6vw';
        iRatingDiv.style.height = '2vw';
        iRatingDiv.style.marginTop = '0.5vw';
        iRatingDiv.style.marginRight = '6vw';
        iRatingDiv.style.backgroundColor = '#FFFA';
        iRatingDiv.style.borderRadius = '0.5';
        iRatingDiv.style.color = 'black';
        iRatingDiv.style.textAlign = 'center'
        iRatingDiv.style.fontSize = '2vw';
        iRatingDiv.style.textOverflow = 'none';
        iRatingDiv.style.overflow = 'hidden';
        iRatingDiv.style.whiteSpace = 'nowrap';
        iRatingDiv.style.verticalAlign = 'middle';


        td.appendChild(nameSpan);
        td.appendChild(iRatingDiv);
        let manufacturers = ['acura', 'alfa-romeo','aston-martin', 'audi', 'bmw', 'buick', 'cadillac', 'chevrolet','classiclotus','crown','dallara', 'dirtcar','ferrari', 'ford', 'holden','hyundai','kia','lamborghini','ligier','mazda','mclaren', 'mercedes', 'pontiac', 'porsche','radical','riley','ruf','skip-barber','toyota','volkswagen','williams'];
        manufacturers.forEach(manufacturer => {
            let logo = document.createElement('img');
            logo.src = `../images/${manufacturer}.png`;
            logo.style.display = 'none';
            logo.style.position = 'absolute';
            logo.style.height = '3vw';
            logo.style.left = '0.5vw';
            logo.style.top = '50%';
            logo.style.transform = 'translateY(-50%)';
            td.appendChild(logo);
        });
        }
    }
}