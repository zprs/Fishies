var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// var mouse = {
//     x: 0,
//     y: 0,
//     clicked: false,
//     clickDown: false
// }

//Events Listeners
window.addEventListener('mousemove', 
    function(event){
    mouse.x = event.x;
    mouse.y = event.y;

    console.log("x:" + mouse.x + ", y:" + mouse.y);
});

document.addEventListener("DOMContentLoaded", function(){
    start();
});


var fishes = [];
var debug = false;

function  start(){
    //Instantiating a fish object in the center of the page for testing purposes
    fishes.push(new Fish(canvas.width / 2, canvas.height / 2));

    draw();
}

function Fish(x, y)
{
    this.x = x;
    this.y = y;

    this.draw = function() {

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = 1;   
        
        //Draw -----


        ctx.restore();
    }
    
    this.update = function() {
        this.draw();
    }
}

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    for(var i = 0; i < fishes.length; i++)
    {
        fishes[i].update();
    }
}

function shortAngleDist(a0,a1) {
    var max = Math.PI*2;
    var da = (a1 - a0) % max;
    return 2*da % max - da;
}

$( document ).ready(function() {
    console.log( "ready!" );
});