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

//Events Listeners
window.addEventListener('mousemove', 
    function(event){
    mouse.x = event.x;
    mouse.y = event.y;
});

document.addEventListener("DOMContentLoaded", function(){
    console.log( "ready!" );
    start();
});


var fishes = [];
var debug = false;

function  start(){
    //Instantiating a fish object in the center of the page for testing purposes
    fishes.push(new Fish(canvas.width / 2, canvas.height / 2));

    animate();
}

//Editable values for altered effect: flapStrength
function Fish(x, y)
{
    this.x = x;
    this.y = y;
    this.rotation = 0; //Facing direction

    this.length = 50;

    this.tailRotation = 0;
    this.lastTailRotation = 0;
    this.tailAngularVelocity = 0;

    this.tailIntegral = 0;

    this.targetX = 0;
    this.targetY = 0;

    // actionQueue: list of objects with:
    // key of 0 representative of a left tail stroke, 1 representative of a right stroke
    // value is equal to the target stroke extension
    this.actionQueue = [{turnDirection: 0, flapStrength: 0}];

    this.draw = function() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = 1;   
        
        //Draw -----
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y);
        ctx.lineTo(Math.cos(this.tailRotation) + this.length + this.x, Math.sin(this.tailRotation) + this.y);

        ctx.restore();
    }

    this.makeDecision = function(lastDecision){

        //Is the optimal path to go towards the target achieved by a left or right turn ?
        // -> (based on the shortest angle distance between target and fish while keeping the current rotation into account)

        var targetDeltaRad = (Math.atan2((this.targetY - this.y), (this.targetX - this.x)) + Math.PI)
        turnDirection = Math.sign(shortAngleDist(this.rotation, targetDeltaRad));

        //Variable flap distance based on the powed that is going to be put into the stroke
        var flapStrength = 1; //For now set to a constant

        //Fish wants to turn in the same direction still
        if(lastDecision == turnDirection)
        {
            //Make a small flap in the opposite direction
            turnDirection = !turnDirection;
            flapStrength = 0.1;
        }
        
        if(turnDirection == 0) //Fish is already pointing directly at the target  ¯\_(ツ)_/¯
            console.log("Ummmmmmmm. I will find a solution later. Probably just going to be the opposite of the stroke that the fish just made");

        this.actionQueue.push({turnDirection: turnDirection, flapStrength: flapStrength});
    }

    this.update = function() {

        this.targetX = mouse.x;
        this.targetY = mouse.y;

        if(Math.abs(this.tailRotation) <= this.actionQueue[0].flapStrength)
        {
            //continue with this action
            //PID Controller for tail movement (Will need to be changed, just thrown in temporarily)
            var deltaTime = 1;
            var tailGains = {P: 1, I: 1, D: 1};

            var targetRoataion = Math.PI * this.actionQueue[0].flapStrength * this.tailRotation;
            this.tailRotation = PID(targetRoataion, this.tailRotation, this.lastTailRotation, this.tailIntegral, deltaTime, tailGains.I, tailGains.D, tailGains.P);
        }
        else
        {
            //Action is complete, make new decision and remove it from the queue
            this.makeDecision(this.actionQueue[0].turnDirection);
            this.actionQueue.splice(0, 1);
        }

        this.draw();
    }
}

function PID(targetVal, currentVal, lastVal, integralTerm, timeSinceLastUpdate, integralGain, derivativeGain, proportionalGain)
{
    error = targetVal - currentVal;

    // integral term calculation
    integralTerm += (integralGain * error * timeSinceLastUpdate);
    //integralTerm = Math.Clamp(integralTerm);

    // derivative term calculation
    var dInput = currentVal - lastVal;
    var derivativeTerm = derivativeGain * (dInput / timeSinceLastUpdate);

    // proportional term calculation
    var proportionalTerm = proportionalGain * error;

    var output = proportionalTerm + integralTerm - derivativeTerm;
    //output = Math.Clamp(output);

    return output;
}


function animate() {
    requestAnimationFrame(animate);
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
