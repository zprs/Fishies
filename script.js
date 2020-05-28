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
    this.tailLength = 25;

    this.tailRotation = 0;
    this.tailAngularVelocity = 0;
    this.tailAngularAcceleration = 2;

    this.movementSpeed = 2;

    this.minFlapStrength = 0.2;
    this.maxFlapStrength = 1;
    this.flapCurveMultiplier = 3;

    this.maxTurnAngle = Math.PI / 2;

    this.tailIntegral = 0;

    this.targetX = 0;
    this.targetY = 0;

    // actionQueue: list of objects with:
    // key of 0 representative of a left tail stroke, 1 representative of a right stroke
    // value is equal to the target stroke extension
    this.actionQueue = [{turnDirection: 0, flapStrength: 0, flapSpeed: 0, flapDistance: 0}];

    this.draw = function() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = 1;   
        ctx.lineWidth = 5;
        
        //Draw -----
        ctx.beginPath();  
        ctx.moveTo(-this.length / 2, 0);
        ctx.lineTo(this.length, 0);
        ctx.lineTo(Math.cos(this.tailRotation) * this.tailLength + this.length, Math.sin(this.tailRotation) * this.tailLength);
        ctx.stroke();

        ctx.restore();
    }

    this.makeDecision = function(lastDecision){

        //Is the optimal path to go towards the target achieved by a left or right turn ?
        // -> (based on the shortest angle distance between target and fish while keeping the current rotation into account)
        var targetDeltaRad = (Math.atan2((this.targetY - this.y), (this.targetX - this.x)) + Math.PI);
        var angleDifference = shortAngleDist(this.rotation, targetDeltaRad);
        var turnDirection = -Math.sign(angleDifference);

        console.log(targetDeltaRad, turnDirection);

        //How much this stroke is going to cause the fish to move (rotate and translate)
        var strengthRange = this.maxFlapStrength - this.minFlapStrength;
        var b = this.minFlapStrength - strengthRange;
        var numerator = this.maxFlapStrength - b;
        var flapStrength = numerator / (1 + Math.pow(2, -this.flapCurveMultiplier * Math.abs(angleDifference))) + b;

        //Fish wants to turn in the same direction still
        if(lastDecision == turnDirection && turnDirection != 0)
        {
            //Make a small flap in the opposite direction
            turnDirection = turnDirection == 1 ? -1 : 1;
            flapStrength = .1;
        }
        
        if(turnDirection == 0) //Fish is already pointing directly at the target  ¯\_(ツ)_/¯
            console.log("Ummmmmmmm. I will find a solution later. Probably just going to be the opposite of the stroke that the fish just made");

        this.actionQueue.push({turnDirection: turnDirection, flapStrength: flapStrength, forwardStrength: .5});
    }

    this.update = function() {

        this.targetX = mouse.x;
        this.targetY = mouse.y;

        var targetRotation = this.maxTurnAngle * this.actionQueue[0].flapStrength * this.actionQueue[0].turnDirection; // flap strength of 1 = 90 degrees

        if(Math.abs(this.tailRotation - targetRotation) > .05)
        {
            //continue with this action
            //P Controller for tail movement (Will need to be changed, just thrown in temporarily)

            var error = targetRotation - this.tailRotation;

            this.tailAngularVelocity += this.tailAngularAcceleration * error;
            this.tailRotation += this.tailAngularVelocity
            //this.rotation -= error * .2 * this.actionQueue[0].flapStrength;

            //this.x -= Math.cos(this.rotation) * this.actionQueue[0].forwardStrength * this.movementSpeed;
            //this.y -= Math.sin(this.rotation) * this.actionQueue[0].forwardStrength * this.movementSpeed;
            
            //PID(targetRotation, this.tailRotation, this.lastTailRotation, this.tailIntegral, deltaTime, tailGains.I, tailGains.D, tailGains.P);
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

Number.prototype.Clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};




//A shifts the top -> set to max stroke value
//B shifts the bottom -> set to 1/2
//C  -> min stroke value