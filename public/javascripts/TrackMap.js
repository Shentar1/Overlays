let mapDiv;
let mapUrl;
var activeLine;
var pitLine;
var startFinish;
var turns;
var startFinishPosition;
var startFinishIntersection;

document.onreadystatechange = function () {
if (document.readyState == "complete") {
    socket.on('sentTrackMapData', function (data) {
        if(mapUrl !== data.trackMapURL) {
            mapUrl = data.trackMapURL;
            buildMap();
        }
        data.driverPositions.forEach(driver => {
            if(document.getElementById(driver.carNumber)) {
                let driverMarker = document.getElementById(driver.carNumber);
                driverMarker.style.position = 'absolute';
                //works for most tracks with a continuous draw and with start/finish lines at the same point. 
                //needs manual offsets for tracks with split start/finish lines
                //needs some kind of skip or animation for tracks with breaks in the active layer of the map.
                
                if (activeLine) {
                    const path = activeLine.querySelector('path');
                    const length = path.getTotalLength();
                    const svgWidth = activeLine.viewBox.baseVal.width;
                    const scale = (activeLine.getBoundingClientRect().width / svgWidth)-0.03;
                    
                    let a = (-length/2 * driver.x + startFinishIntersection)>0 ? (-length/2* driver.x + startFinishIntersection) : (-length/2 * driver.x + startFinishIntersection + length/2)
                    let b = (length/2 * driver.x + startFinishIntersection) > 0? (length/2*driver.x+startFinishIntersection):(length/2 *driver.x + startFinishIntersection + length/2);
                    
                    if (a>length/2){
                        a = startFinishIntersection + (length/2*driver.x);
                    }
                    if(b>length/2){
                        b=startFinishIntersection - (length/2*driver.x);
                    }
                    let point;
                    if(data.trackDirection === 'left'){
                        point = path.getPointAtLength(a);
                    }else{
                        point = path.getPointAtLength(b);
                    }
                    driverMarker.style.left = ((point.x * scale)) + 'px';
                    a<length/2 ? driverMarker.style.top = ((point.y * scale) - (20 * scale)) + 'px' : driverMarker.style.top = (point.y * scale) + 'px';
                }

            }else{
                let driverMarker = document.createElement('div');
                let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '30px')
                text.setAttribute('font-weight', 'bolder')
                text.setAttribute('fill', 'black');
                text.textContent = driver.carNumber;
                svg.appendChild(circle);
                svg.appendChild(text);
                driverMarker.appendChild(svg);
                driverMarker.className = 'driver-marker';
                driverMarker.id = driver.carNumber;
                driverMarker.style.position = 'absolute';
                mapDiv.appendChild(driverMarker);
                if(!driver.playerCar){
                    svg.setAttribute('width', '40');
                    svg.setAttribute('height', '40');
                    circle.setAttribute('cx', '20');
                    circle.setAttribute('cy', '20');
                    circle.setAttribute('r', '20');
                    circle.setAttribute('fill', 'red');
                    circle.setAttribute('stroke', 'black');
                    text.setAttribute('x', '20');
                    text.setAttribute('y', '32');
                    driverMarker.style.zIndex = '1000';
                }else{
                    svg.setAttribute('width', '60');
                    svg.setAttribute('height', '60');
                    circle.setAttribute('cx', '30');
                    circle.setAttribute('cy', '30');
                    circle.setAttribute('r', '25');
                    circle.setAttribute('fill', '#888888');
                    circle.setAttribute('stroke', 'black');
                    text.setAttribute('x', '30');
                    text.setAttribute('y', '40');
                    driverMarker.style.zIndex = '1001';
                }
            }
        });
    });
}
}
function findIntersection(path1, path2) {
    const length1 = path1.getTotalLength();
    const length2 = path2.getTotalLength();
    let bestDistance = Infinity;
    let bestPoint = 0;

    for (let i = 0; i < length2; i += 10) {
        const point2 = path2.getPointAtLength(i);
        for (let j = 0; j < length1; j += 10) {
            const point1 = path1.getPointAtLength(j);
            const distance = Math.hypot(point2.x - point1.x, point2.y - point1.y);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestPoint = i;
            }
        }
    }
    return bestPoint;
}

function buildMap() {
    while (mapDiv && mapDiv.firstChild) {
        mapDiv.removeChild(mapDiv.firstChild);
    }
    document.getElementsByTagName('body')[0].style.backgroundColor = 'black';
    mapDiv = document.getElementById('map');
    const loadSVG = async (url) => {
        const response = await fetch(url);
        const svgText = await response.text();
        const div = document.createElement('div');
        div.innerHTML = svgText;
        const svg = div.querySelector('svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        return svg;
    };

    Promise.all([
        loadSVG(mapUrl + 'active.svg'),
        loadSVG(mapUrl + 'pitroad.svg'),
        loadSVG(mapUrl + 'start-finish.svg'),
        loadSVG(mapUrl + 'turns.svg')
    ]).then(([activeLine, pitLine, startFinish, turns]) => {
        startFinish.children[1].style.fill = '#d82520'
        startFinish.children[2].style.fill = '#d82520'
        mapDiv.appendChild(activeLine);
        mapDiv.appendChild(pitLine);
        mapDiv.appendChild(startFinish);
        mapDiv.appendChild(turns);
        
        if(activeLine){
            const path = activeLine.querySelector('path');
            startFinishIntersection = findIntersection(startFinish.querySelector('path'), path);
            startFinishPosition = startFinishIntersection / path.getTotalLength();
        }
        this.activeLine = activeLine;
        this.pitLine = pitLine;
        this.startFinish = startFinish;
        this.turns = turns;
    });
}
