let formula = "(x**2)/5";

function OnButtonPress(key){
    if(key == "backspace"){
        formula = formula.slice(0, -1);
    }
    else if(key == "clear"){
        formula = '';
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
    
    displayFormula = displayFormula.replaceAll('Math.', '');

    display.innerHTML = 'f<sub>(x)</sub>=' + displayFormula;
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
        ctx.fillText(Math.round(x*100)/100, halfWidth + x * xScale, halfHeight + 10);

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
function DrawGraph(){
    DrawGraphBackground();
    let canvas = document.getElementById("graph-canvas");
    let ctx = canvas.getContext("2d");
    ctx.beginPath();

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
            ctx.lineTo(halfWidth + x * xScale, halfHeight - y * yScale);
        }
    }catch(e){
        //console.log(e);
    }
    finally{
        ctx.stroke();
    }
}

async function DrawGraphSlowly(){
    DrawGraphBackground();
    let canvas = document.getElementById("graph-canvas");
    let ctx = canvas.getContext("2d");
    ctx.beginPath();

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
            let y = eval(formula);
            ctx.lineTo(halfWidth + x * xScale, halfHeight - y * yScale);

            //only await when drawing visible part of the graph
            if(y > yStart && y < -yStart){
                await new Promise(r => setTimeout(r, 1));
            }
            ctx.stroke();
        }
    }catch(e){
        //console.log(e);
    }
}

DrawGraph();
