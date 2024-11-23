let formula = "(x**2)/5";
let ShouldDrawGraphSlowly = false;
let NumericAxis = true;
function handleCanvasMouseWheel(event) {
    if(event.deltaY < 0){
        document.getElementById("yScale").value = Math.min(parseFloat(document.getElementById("yScale").value) + 1, 999);
        document.getElementById("xScale").value = Math.min(parseFloat(document.getElementById("xScale").value) + 1, 999);
    }else{
        document.getElementById("yScale").value = Math.max(parseFloat(document.getElementById("yScale").value) - 1, 1);
        document.getElementById("xScale").value = Math.max(parseFloat(document.getElementById("xScale").value) - 1, 1);
    }
    DrawGraph();
  }
function OnButtonPress(key){
    if(key == "backspace"){
        formula = formula.slice(0, -1);
    }
    else if(key == "clear"){
        formula = '';
    }else if(key == "axis"){
        NumericAxis = !NumericAxis;
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
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;
    const yScale = document.getElementById("yScale").value <= 0 ? 1 : document.getElementById("yScale").value;
    const xScale = document.getElementById("xScale").value <= 0 ? 1 : document.getElementById("xScale").value;

    ctx.font = "12px Arial";
    ctx.fillStyle = "#2d3436";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    //numbers on x axis
    const xStart = -250/xScale;
    for(let x = xStart; x < -xStart; x+= 50/xScale){
        if(x == 0) continue;
        ctx.strokeStyle = "#636e72";
        const number = NumericAxis ? Math.round(x*100)/100 : Math.round((x/Math.PI)*100)/100 + 'π';
        ctx.fillText(number, halfWidth + x * xScale, halfHeight + 10);

        //number lines
        ctx.fillRect(halfWidth + x * xScale, halfHeight - 3, 1, 6);
        ctx.setLineDash([10, 10]);
        ctx.moveTo(halfWidth + x * xScale, 0);
        ctx.lineTo(halfWidth + x * xScale, canvas.height);
        ctx.stroke();
    }

    //numbers on y axis
    ctx.textAlign = "right";
    ctx.strokeStyle = "#c8cbcc";

    const yStart = -250/yScale;
    for(let y = yStart; y < -yStart; y+= 50/yScale){
        ctx.fillText(Math.round(-y*100)/100, halfWidth - 2, halfHeight + y * yScale + 10);

        //number lines
        ctx.fillRect(halfWidth - 3, halfHeight + y * yScale, 6, 1);
        ctx.setLineDash([10, 10]);
        ctx.moveTo(0, halfHeight + y * yScale);
        ctx.lineTo(canvas.width, halfHeight + y * yScale);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    //render static background
    ctx.strokeStyle = "#636e72";
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, canvas.height);

    ctx.moveTo(0, halfHeight);
    ctx.lineTo(canvas.width, halfHeight);

    ctx.stroke();
}
let PreviousLinePos = [0, 0];
function DrawGraph(){
    ShouldDrawGraphSlowly = false;
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
        for(let x = xStart; x < -xStart; x += 0.1){
            let y = eval(formula);
            const xPos = halfWidth + x * xScale;
            const yPos = halfHeight - y * yScale;
            //dont draw if the distance is too extreme (prevents false drawing when going from one infinity to another (eg. 1/x))
            if(Math.sqrt((PreviousLinePos[0] - xPos)**2 + (PreviousLinePos[1] - yPos)**2) < 800)
                ctx.lineTo(xPos, yPos);
            else
                ctx.moveTo(xPos, yPos);
            PreviousLinePos = [xPos, yPos];
        }
    }catch(e){
        //console.log(e);
    }
    finally{
        ctx.stroke();
    }
}

async function DrawGraphSlowly(){
    if(ShouldDrawGraphSlowly) return;
    ShouldDrawGraphSlowly = true;
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
        for(let x = xStart; x < -xStart; x += 0.1){
            if(!ShouldDrawGraphSlowly) return

            let y = eval(formula);
            const xPos = halfWidth + x * xScale;
            const yPos = halfHeight - y * yScale;
            //dont draw if the distance is too extreme (prevents false drawing when going from one infinity to another (eg. 1/x))
            if(Math.sqrt((PreviousLinePos[0] - xPos)**2 + (PreviousLinePos[1] - yPos)**2) < 800)
                ctx.lineTo(xPos, yPos);
            else
                ctx.moveTo(xPos, yPos);
            PreviousLinePos = [xPos, yPos];

            //only await when drawing visible part of the graph
            if(y > yStart && y < -yStart){
                await new Promise(r => setTimeout(r, xScale/100));
            }
            ctx.stroke();
        }
    }catch(e){
        //console.log(e);
    }
    finally{
        ShouldDrawGraphSlowly = false;
    }
}

DrawGraph();
