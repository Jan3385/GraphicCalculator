//let formula = "Math.sin(x)**(1+2)";
let formulas = ["Math.sin(x)**(1+2)"];
const formulaColors = ["#e03143", "#4287f5", "#33b031", "#6c7578", "#c48639", "#8638c2"];
let selectedFormula = 0;
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
        canvasOffset[0] += event.movementX/document.getElementById("xScale").value;
        canvasOffset[1] += event.movementY/document.getElementById("yScale").value;
        DrawGraph();
    }
}
function ResetView(){
    canvasOffset = [0, 0];
    document.getElementById("yScale").value = 50;
    document.getElementById("xScale").value = 50;
    DrawGraph();
}
function DeleteFormula(){
    if(formulas.length == 1) return;
    formulas.splice(formulas.length-1);
    if(selectedFormula >= formulas.length){
        selectedFormula = formulas.length - 1;
        document.getElementsByClassName("formula")[selectedFormula].id = "selected";
    }

    let elements = document.getElementsByClassName("formulas-list")[0].childNodes;
    let element = Array.from(elements).find(e => e.id == "form"+formulas.length);
    element.remove();

    DrawGraph();
}
function AddFormula(){
    formulas.push('');
    let element = document.createElement("div");
    element.className = "formula-div";
    element.id = "form" + (formulas.length-1);

    let formula = document.createElement("p");
    formula.className = "formula";
    formula.innerHTML = `f<sub>${formulas.length}</sub>(x)= `;
    let x = formulas.length-1;
    formula.addEventListener("click", () => SetFormula(x));
    element.appendChild(formula);

    let color = document.createElement("div");
    color.className = "formula-color";
    color.style.backgroundColor = formulaColors[(formulas.length-1) % formulaColors.length];
    element.appendChild(color);

    document.getElementsByClassName("formulas-list")[0].appendChild(element);

    document.getElementById("formula-display").scrollBy(0, 100);

    SetFormula(formulas.length-1);
}
function SetFormula(index){
    document.getElementById("selected").id = "";
    selectedFormula = index;
    document.getElementsByClassName("formula")[index].id = "selected";
    DrawGraph();
}
function GetActiveFormula(){
    console.assert(selectedFormula < formulas.length, "Selected formula is out of bounds");
    return formulas[selectedFormula];
}
function SetActiveFormula(set){
    console.assert(selectedFormula < formulas.length, "Selected formula is out of bounds");
    formulas[selectedFormula] = set;
}
function AddToActiveFormula(add){
    console.assert(selectedFormula < formulas.length, "Selected formula is out of bounds");
    formulas[selectedFormula] += add;
}
function OnButtonPress(key){
    if(key == "backspace"){
        let formula = GetActiveFormula();
        const deletedKey = formula[formula.length - 1];
        formula = formula.slice(0, -1);
        if(formula[formula.length -1] == '.'){
            formula = formula.slice(0, -5);
        }
        if(deletedKey == "*" && formula[formula.length-1] == '*'){
            formula = formula.slice(0, -1);
        }
        SetActiveFormula(formula);
    }
    else if(key == "clear"){
        SetActiveFormula('');
    }else if(key == "axis"){
        numericAxis = !numericAxis;
    }
    else{
        AddToActiveFormula(key);
    }
    UpdateFormula(selectedFormula);
    DrawGraph();
}
function UpdateFormula(index){
    let elements = document.getElementsByClassName("formula");
    let display = elements[index];

    let displayFormula = GetActiveFormula();

    //replace **
    displayFormula = displayFormula.replaceAll('**', '<sup>');

    //add ending </sup>
    let sIndex = -1;
    do{
        sIndex = displayFormula.indexOf('<sup>', sIndex+1);
        if(sIndex == -1) break;
        let number = GetNextNumberAt(sIndex + 5, displayFormula);
        displayFormula = displayFormula.slice(0, sIndex + 5 + number.length) + '</sup>' + displayFormula.slice(sIndex + 5 + number.length);
    }while(sIndex != -1);
    
    //remove "Math."
    displayFormula = displayFormula.replaceAll('Math.', '');

    //add '↑' when the last substring is </sup> and the power of a number does not have ')'
    if(displayFormula[displayFormula.length - 1] == '>' && displayFormula[displayFormula.length - 6] == ')') displayFormula += '↑';

    display.innerHTML = `f<sub>${index+1}</sub>(x)= ` + displayFormula;
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
        while(index < str.length && (isNumber(str[index]) || str[index] == '.')){
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
    const xStart = (-(canvas.width/2)/xScale);
    const yLineOffset = Math.min(Math.max(canvasOffset[1]*yScale, -(canvas.height/2-5)), (canvas.height/2-25));
    for(let x = xStart + (canvasOffset[0]%1); x <= -xStart; x+= 1){

        //number lines
        ctx.fillRect(halfWidth + x * xScale, halfHeight - 3 + yLineOffset, 1, 6);
        //ctx.setLineDash([10, 10]);
        ctx.moveTo(halfWidth + x * xScale, 0);
        ctx.lineTo(halfWidth + x * xScale, canvas.height);

        //number text
        //change between numbers and radians
        const number = numericAxis ? 
            Math.round((x - (canvasOffset[0]))*100)/100 : 
            Math.round(((x)/Math.PI)*100)/100 + 'π';
        if(number == 0) continue;
        ctx.fillText(number, halfWidth + x * xScale, halfHeight + 10 + yLineOffset);
    }
    ctx.stroke();

    //numbers on y axis
    ctx.textAlign = "right";
    ctx.beginPath();

    const yStart = -(canvas.height/2)/yScale;
    const xLineOffset = Math.min(Math.max(canvasOffset[0]*xScale, -(canvas.width/2 - 40)), (canvas.width/2 - 2));
    for(let y = yStart + (canvasOffset[1]%1); y <= -yStart; y+= 1){
        //number lines
        ctx.fillRect(halfWidth - 3  + xLineOffset, halfHeight + y * yScale, 6, 1);
        //ctx.setLineDash([10, 10]);
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
    const canvas = document.getElementById("graph-canvas");
    const ctx = canvas.getContext("2d");

    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;
    const yScale = document.getElementById("yScale").value <= 0 ? 1 : document.getElementById("yScale").value;
    const xScale = document.getElementById("xScale").value <= 0 ? 1 : document.getElementById("xScale").value;
    const xStart = -(canvas.width/2)/xScale;

    //render graphs
    let graphStep = formulas <= 3 ? 0.1 : 0.03*formulas.length;
    //graphStep = graphStep * canvas.width / 500;

    try{
        for(const formula of formulas){
            ctx.beginPath();
            const transparency = formula == GetActiveFormula() ? (255).toString(16) : (140).toString(16);
            ctx.strokeStyle = formulaColors[formulas.indexOf(formula)%formulaColors.length] + transparency;
            ctx.lineWidth = 2;
            for(let x = xStart-canvasOffset[0]; x < -xStart-canvasOffset[0]; x += graphStep){
                
                let y = eval(formula);

                const xPos = halfWidth + (x+canvasOffset[0]) * xScale;
                const yPos = halfHeight - (y-canvasOffset[1]) * yScale;
                //dont draw if the distance is too extreme (prevents false drawing when going from one infinity to another (eg. 1/x))
                if((Math.sign(PreviousLinePos[1] == Math.sign(yPos)) || Math.abs(PreviousLinePos[1] - yPos) < Math.abs(canvas.height*0.8)))
                    ctx.lineTo(xPos, yPos+canvasOffset[1]);
                else
                    ctx.moveTo(xPos, yPos+canvasOffset[1]);
                PreviousLinePos = [xPos, yPos+canvasOffset[1]];
            }
            ctx.stroke();     
        }
    }catch(e){
        //console.log(e);
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
    const xStart = -(canvas.width/2)/xScale;
    const yStart = -(canvas.height/2)/yScale;

    //render graph
    ctx.strokeStyle = "#2d3436";
    ctx.beginPath();
    ctx.lineWidth = 2;

    let graphStep = formulas <= 3 ? 0.010 : 0.0030*formulas.length;
    //graphStep = graphStep * canvas.width / 500;
    //try to render the graph
    try{
        for(const formula of formulas){
            ctx.beginPath();
            const transparency = formula == GetActiveFormula() ? (255).toString(16) : (180).toString(16);
            ctx.strokeStyle = formulaColors[formulas.indexOf(formula)%formulaColors.length] + transparency;
            ctx.lineWidth = 2;
            for(let x = xStart-canvasOffset[0]; x < -xStart-canvasOffset[0]; x += graphStep){
                if(!shouldDrawGraphSlowly) return

                let y = eval(formula);
                const xPos = halfWidth + (x+canvasOffset[0]) * xScale;
                const yPos = halfHeight - (y-canvasOffset[1]) * yScale;
                //dont draw if the distance is too extreme (prevents false drawing when going from one infinity to another (eg. 1/x))
                if(Math.sign(PreviousLinePos[1] == Math.sign(yPos)) || Math.abs(PreviousLinePos[1] - yPos) < Math.abs(canvas.height*0.8))
                    ctx.lineTo(xPos, yPos);
                else
                    ctx.moveTo(xPos, yPos);
                PreviousLinePos = [xPos, yPos];

                //only await when drawing visible part of the graph
                if(y > yStart && y < -yStart){
                    await new Promise(r => setTimeout(r, xScale/20));
                }
                ctx.stroke();
            }
        }
    }catch(e){
        //console.log(e);
    }
    finally{
        shouldDrawGraphSlowly = false;
    }
}

function SetGraphFullscreen(){
    let canvasDiv = document.getElementById("canvas-div");
    let fullscreenNav = document.getElementById("fullscreen-nav");
    let canvas = document.getElementById("graph-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (canvasDiv.requestFullscreen) {
        canvasDiv.requestFullscreen();
    } else if (canvasDiv.webkitRequestFullscreen) { /* Safari */
        canvasDiv.webkitRequestFullscreen();
    } else if (canvasDiv.msRequestFullscreen) { /* IE11 */
        canvasDiv.msRequestFullscreen();
    }

    document.getElementById("yScale").value = Math.round(document.getElementById("yScale").value*2.32);
    document.getElementById("xScale").value = Math.round(document.getElementById("xScale").value*2.32);

    canvasDiv.onfullscreenchange = (event) => {
        if(!document.fullscreenElement){
            canvas.width = 500;
            canvas.height = 300;
            fullscreenNav.style.display = "none";

            document.getElementById("yScale").value = Math.round(document.getElementById("yScale").value/2.32);
            document.getElementById("xScale").value = Math.round(document.getElementById("xScale").value/2.32);

            DrawGraph();
        }    
    };
    fullscreenNav.style.display = "grid";
    DrawGraph();
}
function ExitFullscreen(){
    document.exitFullscreen();
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
