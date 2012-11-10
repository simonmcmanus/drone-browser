(function() {
  var faye, keymap, speed;
  faye = new Faye.Client("/faye", {
    timeout: 120
  });
  faye.subscribe("/drone/navdata", function(data) {
    ["batteryPercentage", "clockwiseDegrees", "altitudeMeters", "frontBackDegrees", "leftRightDegrees", "xVelocity", "yVelocity", "zVelocity"].forEach(function(type) {
      return $("#" + type).html(Math.round(data.demo[type], 4));
    });
    return showBatteryStatus(data.demo.batteryPercentage);
  });
  window.showBatteryStatus = function(batteryPercentage) {
    $("#batterybar").width("" + batteryPercentage + "%");
    if (batteryPercentage < 30) {
      $("#batteryProgress").removeClass("progress-success").addClass("progress-warning");
    }
    if (batteryPercentage < 15) {
      $("#batteryProgress").removeClass("progress-warning").addClass("progress-danger");
    }
    return $("#batteryProgress").attr({
      "data-original-title": "Battery status: " + batteryPercentage + "%"
    });
  };
  faye.subscribe("/drone/image", function(src) {
    return $("#cam").attr({
      src: src
    });
  });
  keymap = {
    87: {
      ev: 'move',
      action: 'front'
    },
    83: {
      ev: 'move',
      action: 'back'
    },
    65: {
      ev: 'move',
      action: 'left'
    },
    68: {
      ev: 'move',
      action: 'right'
    },
    38: {
      ev: 'move',
      action: 'up'
    },
    40: {
      ev: 'move',
      action: 'down'
    },
    37: {
      ev: 'move',
      action: 'counterClockwise'
    },
    39: {
      ev: 'move',
      action: 'clockwise'
    },
    32: {
      ev: 'drone',
      action: 'takeoff'
    },
    27: {
      ev: 'drone',
      action: 'land'
    },
    49: {
      ev: 'animate',
      action: 'flipAhead',
      duration: 15
    },
    50: {
      ev: 'animate',
      action: 'flipLeft',
      duration: 15
    },
    51: {
      ev: 'animate',
      action: 'yawShake',
      duration: 15
    },
    52: {
      ev: 'animate',
      action: 'doublePhiThetaMixed',
      duration: 15
    },
    53: {
      ev: 'animate',
      action: 'wave',
      duration: 15
    },
    69: {
      ev: 'drone',
      action: 'disableEmergency'
    }
  };
  speed = 0;
  $(document).keydown(function(ev) {
    var evData;
    if (keymap[ev.keyCode] == null) {
      return;
    }
    ev.preventDefault();
    speed = speed >= 1 ? 1 : speed + 0.08 / (1 - speed);
    evData = keymap[ev.keyCode];
    return publish("/drone/" + evData.ev, {
      action: evData.action,
      speed: sfaye.peed,
      duration: evData.duration
    });
  });
  $(document).keyup(function(ev) {
    speed = 0;
    return faye.publish("/drone/drone", {
      action: 'stop'
    });
  });
  $("*[data-action]").on("mousedown", function(ev) {

    console.log("/drone/" + $(this).attr("data-action"), {
      action: $(this).attr("data-param"),
      speed: 0.3,
      duration: 1000 * parseInt($("#duration").val())
    });
    return faye.publish("/drone/" + $(this).attr("data-action"), {
      action: $(this).attr("data-param"),
      speed: 0.3,
      duration: 1000 * parseInt($("#duration").val())
    });
  });
  $("*[data-action]").on("mouseup", function(ev) {
    return faye.publish("/drone/move", {
      action: $(this).attr("data-param"),
      speed: $(this).attr("data-action") === "move" ? 0 : void 0
    });
  });
  $("*[rel=tooltip]").tooltip();
}).call(this);



//  ball stuff = 
//  
$(document).ready(function() {
  var x=0,y=0,vx=0,vy=0,ax=0,ay=0;
  var sphere=document.getElementById("sphere");
  if(window.DeviceMotionEvent!=undefined){
    window.ondevicemotion=function(e){
      ax=event.accelerationIncludingGravity.x*5;
      ay=event.accelerationIncludingGravity.y*5;
      document.getElementById("accelerationX").innerHTML=e.accelerationIncludingGravity.x;
      document.getElementById("accelerationY").innerHTML=e.accelerationIncludingGravity.y;
      document.getElementById("accelerationZ").innerHTML=e.accelerationIncludingGravity.z;
      if(e.rotationRate){
        document.getElementById("rotationAlpha").innerHTML=e.rotationRate.alpha;
        document.getElementById("rotationBeta").innerHTML=e.rotationRate.beta;
        document.getElementById("rotationGamma").innerHTML=e.rotationRate.gamma;}
      }
      setInterval(function(){
        var landscapeOrientation=window.innerWidth/window.innerHeight>1;
        if(landscapeOrientation){
          vx=vx+ay;vy=vy+ax;
        }else{
          vy=vy-ay;vx=vx+ax;
        }
        vx=vx*0.98;vy=vy*0.98;y=parseInt(y+vy/50);x=parseInt(x+vx/50);

boundingBoxCheck();


sphere.style.top=y+"px";


sphere.style.left=x+"px";

$('h1').html(x);

faye.publish("/drone/move", {
    action: x,
    speed: 0.3,
    duration: 2000
  }
);



},25);}


function boundingBoxCheck(){if(x<0){x=0;vx=-vx;}
if(y<0){y=0;vy=-vy;}
if(x>document.documentElement.clientWidth-20){x=document.documentElement.clientWidth-20;vx=-vx;}
if(y>document.documentElement.clientHeight-20){y=document.documentElement.clientHeight-20;vy=-vy;}}
})
