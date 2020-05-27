var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouse = {
    x: 0,
    y: 0,
    clicked: false,
    clickDown: false
}

//Events
window.addEventListener('mousemove', 
    function(event){
    mouse.x = event.x;
    mouse.y = event.y;

    console.log("x:" + mouse.x + ", y:" + mouse.y);
});



var fishes = [];
var debug = false;

function Fish(x, y)
{
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.turningSpeed = .1;
    this.speed = 1;

    this.draw = function(t) {

        var scale = 40;
        
        var tailTime = (t - 3);
        var tailHandleTime = t - 4;

        //Tail horizontal & vertical travel
        var tht = .25;
        var tvt = 1;

        var tailOffsetX = 120;

        var tx = tailOffsetX + scale * -tht * Math.cos(2 * tailTime) + tht;
        var ty = scale * -tvt * Math.cos(tailTime) + tvt;

        //Tail handle horizional & vertical travel
        var thht = .2;
        var thvt = 1.5;

        var tailHOffsetX = 90;

        var thx = tailHOffsetX + scale * thht * Math.cos(2 * tailHandleTime) + thht;
        var thy = scale * thvt * Math.cos(tailHandleTime) + thvt;

        //Head handle horizional & vertical travel
        var hhht = .5;
        var hhvt = 1;

        var headOffsetX = 40;
        var headHandleLength = 20;
        
        var hhx = headOffsetX + headHandleLength * -hhht * Math.cos(2 * t) + hhht;
        var hhy = headHandleLength * -hhvt * Math.cos(t) + hhvt;

        var headThickness = 20;
        var thickness = 20;

        //this.rotation -= (hhy / 30);

        ctx.save();
        ctx.translate(this.x, this.y);
    

        ctx.globalAlpha = 1;

        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(hhx - headThickness, hhy - headThickness, thx, thy, tx, ty);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(hhx - headThickness, hhy + headThickness, thx, thy + thickness, tx, ty);
        ctx.stroke();

        ctx.globalAlpha = 1;

        if(debug)
        {
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(thx, thy);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(hhx, hhy);
            ctx.stroke();
        }
    
        ctx.restore();
    }
    
    this.update = function(time){
        var mouseRad = (Math.atan2((mouse.y - this.y), (mouse.x - this.x)) + Math.PI)
        this.rotation += shortAngleDist(this.rotation, mouseRad) * this.turningSpeed;
        
        this.x -= Math.cos(this.rotation) * this.speed;
        this.y -= Math.sin(this.rotation) * this.speed;

        this.speed = (animationSpeed + 1);

        this.draw(time);
    }
}

var t = 0;

fishes.push(new Fish(200, 200));


var speedChangeInterval = 150;
var speedChangeTimer = 0;

var animationSpeed = .5;
var targetAnimationSpeed = .5;
var animStartTime = 0;


function draw() {


    if(speedChangeTimer < speedChangeInterval)
        speedChangeTimer++;
    else
    {
        speedChangeTimer = 0;
        targetAnimationSpeed = Math.random();
        animStartTime = t;
    }


    animationSpeed = lerp(animationSpeed, targetAnimationSpeed, (t - animStartTime) / speedChangeInterval);
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    t += animationSpeed + 1;

    var time = t / 20;
    fishes[0].update(time);
}

function shortAngleDist(a0,a1) {
    var max = Math.PI*2;
    var da = (a1 - a0) % max;
    return 2*da % max - da;
}

draw();

$(document).keypress(function(event){
    draw();
});

function lerp(start, end, t) {
    return start * (1 - t) + end * t
}