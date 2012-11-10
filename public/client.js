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
    38: {
      ev: 'move',
      action: 'front'
    },
    40: {
      ev: 'move',
      action: 'back'
    },
    37: {
      ev: 'move',
      action: 'left'
    },
    39: {
      ev: 'move',
      action: 'right'
    },
    16: {
      ev: 'move',
      action: 'up'
    },
    191: {
      ev: 'move',
      action: 'down'
    },
    220: {
      ev: 'move',
      action: 'counterClockwise'
    },
    222: {
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
    $('.help').fadeOut(150);
    
    $('[data-param="' + evData.action + '"]').addClass('visible').siblings().removeClass('visible');
    
    return faye.publish("/drone/" + evData.ev, {
      action: evData.action,
      speed: sfaye.peed,
      duration: evData.duration
    });
  });
  $(document).keyup(function(ev) {
    $('[data-param]').removeClass('visible');
    
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
	if(navigator.userAgent.toLowerCase().indexOf('iphone') !== -1) {
	  $('.help').hide();
	} else {
	  $('.middle, #sphere').hide();
	}

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


   var xdiff = this.oldx - x;
   var ydiff = this.oldy -y;
$('h1').html(xdiff+',  '+ydiff);

   if(xdiff < ydiff) { // is it more left or forward?
      if(x < 160) {
        $('h1').html('back'+this.oldx);
        faye.publish("/drone/move", {
            action: 'left',
            speed: 0.3,
            duration: 2000
          }
        );
      }

      if(x > 160) {
          $('h1').html('forward'+this.oldy);
       }



   }else {
      if(y > 145) {
    $('h1').html('right'+this.oldy);
  }

  if(y < 145) {
    $('h1').html('left'+this.oldy);
  }



   }

  
   this.oldx= x;
   this.oldy = y;



},25);}


function boundingBoxCheck(){if(x<0){x=0;vx=-vx;}
if(y<0){y=0;vy=-vy;}
if(x>document.documentElement.clientWidth-20){x=document.documentElement.clientWidth-20;vx=-vx;}
if(y>document.documentElement.clientHeight-20){y=document.documentElement.clientHeight-20;vy=-vy;}}
});
