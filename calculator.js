let formula = "Math.sin(x)**3";
let shouldDrawGraphSlowly = false;
let numericAxis = true;

let canvasOffset = [0, 0];

function handleCanvasMouseWheel(event) {
    if(event.deltaY < 0){
        document.getElementById("yScale").value = Math.min(parseFloat(document.getElementById("yScale").value) + 1, 300);
        document.getElementById("xScale").value = Math.min(parseFloat(document.getElementById("xScale").value) + 1, 300);
    }else{
        document.getElementById("yScale").value = Math.max(parseFloat(document.getElementById("yScale").value) - 1, 25);
        document.getElementById("xScale").value = Math.max(parseFloat(document.getElementById("xScale").value) - 1, 25);
    }
    DrawGraph();
}
function handleCanvasMouseMove(event){
    if(event.buttons & 1 == 1){
        canvasOffset[0] += event.movementX/40;
        canvasOffset[1] += event.movementY/40;
        DrawGraph();
    }
}
function ResetView(){
    canvasOffset = [0, 0];
    document.getElementById("yScale").value = 50;
    document.getElementById("xScale").value = 50;
    DrawGraph();
}
function OnButtonPress(key){
    if(key == "backspace"){
        formula = formula.slice(0, -1);
        if(formula[formula.length -1] == '.'){
            formula = formula.slice(0, -5);
        }
    }
    else if(key == "clear"){
        formula = '';
    }else if(key == "axis"){
        numericAxis = !numericAxis;
    }
    else{
        formula += key;
    }
    UpdateFormula();
    DrawGraph();
}
function UpdateFormula(){
    let display = document.getElementById("formula-display");

    let displayFormula = formula;

    //replace **
    displayFormula = displayFormula.replaceAll('**', '<sup>');
    const indexes = [...displayFormula.matchAll(new RegExp("<sup>", 'gi'))].map(a => a.index);
    for(let i = 0; i < indexes.length; i++){
        let number = GetNextNumberAt(indexes[i] + 5, displayFormula);
        displayFormula = displayFormula.slice(0, indexes[i] + 5 + number.length) + '</sup>' + displayFormula.slice(indexes[i] + 5 + number.length);
    }
    
    displayFormula = displayFormula.replaceAll('Math.', '');

    display.innerHTML = 'f<sub>(x)</sub>= ' + displayFormula;
}
function GetNextNumberAt(index, str){
    let number = '';
    
    if(index >= str.length) return number;

    if(str[index] == '('){
        while(index < str.length && str[index] != ')'){
            number += str[index];
            index++;
        }
        number += ')';
        return number;
    }
    if(isNumber(str[index])){
        while(index < str.length && isNumber(str[index])){
            number += str[index];
            index++;
        }
        return number;
    }
}
function isNumber(str){
    return /^\d+$/.test(str);
}
function DrawGraphBackground(){
    let canvas = document.getElementById("graph-canvas");
    let ctx = canvas.getContext("2d");
    ctx.beginPath();

    ctx.fillStyle = "#dfe6e9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //render numbers
    const yScale = document.getElementById("yScale").value <= 0 ? 1 : document.getElementById("yScale").value;
    const xScale = document.getElementById("xScale").value <= 0 ? 1 : document.getElementById("xScale").value;
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;

    ctx.font = "12px Arial";
    ctx.fillStyle = "#2d3436";
    ctx.strokeStyle = "#c8cbcc";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    //numbers on x axis
    ctx.lineWidth = 1;
    const xStart = (-250/xScale);
    const yLineOffset = Math.min(Math.max(canvasOffset[1]*yScale, -145), 125);
    for(let x = xStart; x <= -xStart; x+= 1){

        //number lines
        ctx.fillRect(halfWidth + x * xScale, halfHeight - 3 + yLineOffset, 1, 6);
        ctx.setLineDash([10, 10]);
        ctx.moveTo(halfWidth + x * xScale, 0);
        ctx.lineTo(halfWidth + x * xScale, canvas.height);

        //number text
        const number = numericAxis ? Math.round((x-canvasOffset[0])*100)/100 : Math.round(((x-canvasOffset[0])/Math.PI)*100)/100 + 'π';
        if(number == 0) continue;
        ctx.fillText(number, halfWidth + x * xScale, halfHeight + 10 + yLineOffset);
    }
    ctx.stroke();

    //numbers on y axis
    ctx.textAlign = "right";
    ctx.beginPath();

    const yStart = -250/yScale;
    const xLineOffset = Math.min(Math.max(canvasOffset[0]*xScale, -222), 248);
    for(let y = yStart; y <= -yStart; y+= 1){
        //number lines
        ctx.fillRect(halfWidth - 3  + xLineOffset, halfHeight + y * yScale, 6, 1);
        ctx.setLineDash([10, 10]);
        ctx.moveTo(0, halfHeight + y * yScale);
        ctx.lineTo(canvas.width, halfHeight + y * yScale);

        //number text
        ctx.fillText(Math.round((-y+canvasOffset[1])*100)/100, halfWidth - 2 + xLineOffset, halfHeight + y * yScale + 10);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    //render static background
    ctx.strokeStyle = "#636e72";
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(halfWidth + xLineOffset, 0);
    ctx.lineTo(halfWidth + xLineOffset, canvas.height);

    ctx.moveTo(0, halfHeight + yLineOffset);
    ctx.lineTo(canvas.width, halfHeight + yLineOffset);

    ctx.stroke();
}
let PreviousLinePos = [0, 0];
function DrawGraph(){
    shouldDrawGraphSlowly = false;
    DrawGraphBackground();
    let canvas = document.getElementById("graph-canvas");
    let ctx = canvas.getContext("2d");

    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;
    const yScale = document.getElementById("yScale").value <= 0 ? 1 : document.getElementById("yScale").value;
    const xScale = document.getElementById("xScale").value <= 0 ? 1 : document.getElementById("xScale").value;
    const xStart = -250/xScale;

    //render graph
    ctx.strokeStyle = "#2d3436";
    ctx.beginPath();
    ctx.lineWidth = 2;

    //try to render the graph
    try{
        for(let x = xStart-canvasOffset[0]; x < -xStart-canvasOffset[0]; x += 0.03){
            let y = eval(formula);
            const xPos = halfWidth + (x+canvasOffset[0]) * xScale;
            const yPos = halfHeight - (y-canvasOffset[1]) * yScale;
            //dont draw if the distance is too extreme (prevents false drawing when going from one infinity to another (eg. 1/x))
            if(Math.abs(PreviousLinePos[1] - yPos) < Math.abs(yScale * 100))
                ctx.lineTo(xPos, yPos+canvasOffset[1]);
            else
                ctx.moveTo(xPos, yPos+canvasOffset[1]);
            PreviousLinePos = [xPos, yPos+canvasOffset[1]];
        }
    }catch(e){
        //console.log(e);
    }
    finally{
        ctx.stroke();
    }
}

async function DrawGraphSlowly(){
    if(shouldDrawGraphSlowly) return;
    shouldDrawGraphSlowly = true;
    DrawGraphBackground();
    let canvas = document.getElementById("graph-canvas");
    let ctx = canvas.getContext("2d");

    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;
    const yScale = document.getElementById("yScale").value <= 0 ? 1 : document.getElementById("yScale").value;
    const xScale = document.getElementById("xScale").value <= 0 ? 1 : document.getElementById("xScale").value;
    const xStart = -250/xScale;
    const yStart = -250/yScale;

    //render graph
    ctx.strokeStyle = "#2d3436";
    ctx.beginPath();
    ctx.lineWidth = 2;

    //try to render the graph
    try{
        for(let x = xStart-canvasOffset[0]; x < -xStart-canvasOffset[0]; x += 0.01){
            if(!shouldDrawGraphSlowly) return

            let y = eval(formula);
            const xPos = halfWidth + (x+canvasOffset[0]) * xScale;
            const yPos = halfHeight - (y-canvasOffset[1]) * yScale;
            //dont draw if the distance is too extreme (prevents false drawing when going from one infinity to another (eg. 1/x))
            if(Math.abs(PreviousLinePos[1] - yPos) < Math.abs(yScale * 100))
                ctx.lineTo(xPos, yPos);
            else
                ctx.moveTo(xPos, yPos);
            PreviousLinePos = [xPos, yPos];

            //only await when drawing visible part of the graph
            if(y > yStart && y < -yStart){
                await new Promise(r => setTimeout(r, xScale/10));
            }
            ctx.stroke();
        }
    }catch(e){
        //console.log(e);
    }
    finally{
        shouldDrawGraphSlowly = false;
    }
}
const backgroundColors = [
    "#e67d7c",
    "#fab1a0",
    "#f08baf",
    "#86bdf0",
    "#c5f5b3",
    "#c59bf2"
]
setInterval(() => {
    document.body.style.backgroundColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
}, 15000);

DrawGraph();
