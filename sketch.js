// sketch.js
let sceneCounter = 3;
let forestScene;
let cityScene;
let arControlScene;
let arControlScene1;
let arDetectEnabled = false;
let arVideo = true;
let dynapuffFont;
let windSounds = [];
let showHelp = true;
let fingerMetrics;

let lastDirection = "None";
let lastLipsStatus = "None";

let currentFinger = "middle";
let fingerCircleRadius = 30;
let fingerCircleAlpha = 200;

const MIN_RADIUS = 10;
const MAX_RADIUS = 60;
const RADIUS_STEP = 5;

function preload() {

  handPoseModel = ml5.handPose({
    maxHands: 1,
    modelType: "full",
    flipped: false,
  });
  
  faceMeshModel = ml5.faceMesh({ 
    maxFaces: 1, 
    refineLandmarks: true, 
    flipped: false,
  });

  backgroundImg = loadImage('assets/thumbnail.png');
  dynapuffFont = loadFont('assets/DynaPuff[wdth,wght].ttf');

  windSounds = [
    loadSound('assets/wind1.mp3'),
    loadSound('assets/wind2.mp3')
  ];
  rainSound = loadSound('assets/rain.mp3');

  waterSounds = [
    loadSound('assets/water1.mp3'),
    loadSound('assets/water2.mp3')
  ];

  lightingSounds = [
    loadSound('assets/lighting1.mp3'),
    loadSound('assets/lighting2.mp3'),
    loadSound('assets/lighting3.mp3')
  ];

  hornSounds = [
    loadSound('assets/horn1.mp3'),
    loadSound('assets/horn2.mp3'),
    loadSound('assets/horn3.mp3'),
    loadSound('assets/horn4.mp3'),
    loadSound('assets/horn5.mp3'),
    loadSound('assets/horn6.mp3')
  ];

  doorbellSounds = [
    loadSound('assets/doorbell1.mp3'),
    loadSound('assets/doorbell2.mp3'),
    loadSound('assets/doorbell3.mp3')
  ];

  fountainSound = loadSound('assets/fountain.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  forestScene = new ForestScene(windSounds, rainSound, waterSounds, lightingSounds);
  cityScene = new CityScene(hornSounds, doorbellSounds, fountainSound);
  cameraWindow = new ARControlScene(handPoseModel, faceMeshModel, 255);
  arControlScene = new ARControlScene(handPoseModel, faceMeshModel, 0);

  textFont(dynapuffFont);
  textAlign(CENTER, CENTER);
}

function draw() {

    if (sceneCounter === 3) {
      drawMainMenu();
      if (arDetectEnabled && arControlScene) {
        drawFingerPoint();
      }
    } else if (sceneCounter === 1) {
      forestScene.draw();
      handleARControlsScene1();
      drawHelpText();
    } else if (sceneCounter === 2) {
      cityScene.draw();
      handleARControlsScene2();
      drawHelpText();
    } 

    if (arVideo) {
      push();

      let arWidth = width / 4;
      let arHeight = height / 4;

      let arX = width - arWidth;
      let arY = height - arHeight;

      fill(0, 0, 0, 50);
      noStroke();
      rect(arX, arY, arWidth, arHeight);

      translate(arX, arY);
      scale(arWidth / width, arHeight / height);   

      cameraWindow.draw();    
      pop();
  }

  arControlScene.draw();
  
}

function handleARControlsScene1() {
  if (!arDetectEnabled || !arControlScene) return;

  drawFingerPoint();
  
  let currentDirection = arControlScene.lastMoveDirection;
  if (currentDirection !== lastDirection) {
    forestScene.handleArControlMoveDirection(currentDirection);
    lastDirection = currentDirection;
  }

  const headScaling = arControlScene.checkRecentScaling();
  if (headScaling === true) {
    forestScene.handleArControlHandAction(
      fingerMetrics.width,
      fingerMetrics.height
    );
  }

  const isZoomIn = arControlScene.scaleDirection === "Zoom Out";
  forestScene.handleArControlHandActionMove(
    fingerMetrics.width,
    fingerMetrics.height,
    isZoomIn
  );

  let currentLipsStatus = arControlScene.lipsStatus;
  if (currentLipsStatus !== lastLipsStatus) {
    forestScene.handleArControlLipsStateDetected(currentLipsStatus);
    lastLipsStatus = currentLipsStatus;
  }

  forestScene.handleArControlFingerPosition(
    fingerMetrics.width,
    fingerMetrics.height,
    fingerCircleRadius
  );
}

function handleARControlsScene2() {
  if (!arDetectEnabled || !arControlScene) return;

  drawFingerPoint();

  const headMoving = arControlScene.checkRecentMovements();
  if (headMoving === true) {
    cityScene.handleArControlHandActionMove(
      fingerMetrics.width,
      fingerMetrics.height,
      true,
      fingerCircleRadius
    );
  }

  const headScaling = arControlScene.checkRecentScaling();
  if (headScaling === true) {
    cityScene.handleArControlHandAction(
      fingerMetrics.width,
      fingerMetrics.height,
      fingerCircleRadius
    );
  }

}

function mousePressed() {
  if (sceneCounter === 3) {
    let buttonWidth = width * 0.2;
    let buttonHeight = height * 0.08;
    let spacing = height * 0.05;
    
    if (width < 600) {
      buttonWidth = width * 0.8;
      buttonHeight = height * 0.1;
      spacing = height * 0.03;
    }
    
    let centerX = width / 2;
    let centerY = height / 2;

    if (
      mouseX > centerX - buttonWidth / 2 &&
      mouseX < centerX + buttonWidth / 2 &&
      mouseY > centerY - 2*(buttonHeight + spacing / 2) &&
      mouseY < centerY - 2*(buttonHeight + spacing / 2) + buttonHeight
    ) {
      arDetectEnabled = !arDetectEnabled;
      if (arDetectEnabled) {
        arControlScene.startDetect();
      } else {
        arControlScene.stopDetect();
      }
    }
    
    else if (
      mouseX > centerX - buttonWidth / 2 &&
      mouseX < centerX + buttonWidth / 2 &&
      mouseY > centerY - buttonHeight - spacing / 2 &&
      mouseY < centerY - spacing / 2
    ) {
      sceneCounter = 1;
    }

    else if (
      mouseX > centerX - buttonWidth / 2 &&
      mouseX < centerX + buttonWidth / 2 &&
      mouseY > centerY + spacing / 2 &&
      mouseY < centerY + buttonHeight + spacing / 2
    ) {
      sceneCounter = 2;
    }
  }

  else if (sceneCounter === 1) {
    forestScene.handleMousePressed();
  }
  else if (sceneCounter === 2) {
    cityScene.handleMousePressed();
  }
}

function mouseDragged() {
  if (sceneCounter === 1) {
    forestScene.handleMouseDragged();
  } else if (sceneCounter === 2) {
    cityScene.handleMouseDragged();
  }
}

function mouseReleased() {
  if (sceneCounter === 1) {
    forestScene.handleMouseReleased();
  } else if (sceneCounter === 2) {
    cityScene.handleMouseReleased();
  }
}

function mouseMoved() {
  if (sceneCounter === 1) {
    forestScene.handleMouseMove(mouseX, mouseY);
  }
}

function mouseWheel(event) {
  if (event.delta > 0) {

    fingerCircleRadius = max(MIN_RADIUS, fingerCircleRadius - RADIUS_STEP);
  } else {

    fingerCircleRadius = min(MAX_RADIUS, fingerCircleRadius + RADIUS_STEP);
  }
  
  return false;
}

function keyReleased() {
  if (sceneCounter === 1 && (key === 'a' || key === 'A' || key === 'd' || key === 'D')) {
    forestScene.handleKeyReleased(key);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    sceneCounter = 1;
  } else if (keyCode === RIGHT_ARROW) {
    sceneCounter = 2;
  } else if (keyCode === UP_ARROW) {
    sceneCounter = 3;
  } else if (key === " ") {
    saveCanvas("thumbnail.png");
  } else if (key === 'w' || key === 'W') {
    sceneCounter = 3;
  } else if (key === 'h' || key === 'H') {
    showHelp = !showHelp;
  } else if (key === 'r' || key === 'R') {
    resetAllScenes();
  } else if (key === 'c' || key === 'C') {
    arDetectEnabled = !arDetectEnabled;
    if (arDetectEnabled) {
      arControlScene.startDetect();

    } else {
      arControlScene.stopDetect();

    } 
  } else if (key === 'v' || key === 'V') {
    arVideo = !arVideo;
  } else if (key === 'f' || key === 'F') {
    console.log("Toggle fullscreen");
    arControlScene.toggleStatusInfoOpacity();
  }
  else if (key === '1') {
    switchFingerTracking("thumb");
  }
  else if (key === '2') {
    switchFingerTracking("index");
  }
  else if (key === '3') {
    switchFingerTracking("middle");
  }
  else if (key === '4') {
    switchFingerTracking("ring");
  } 
  else if (key === '5') {
    switchFingerTracking("pinky");
  } 
  else if (sceneCounter === 1) {
    if (key === 'a' || key === 'A' || key === 'd' || key === 'D' || key === 's' || key === 'S' || key === 'q' || key === 'Q' || key === 'e' || key === 'E' || key === 'r' || key === 'R') {
      forestScene.handleKeyPressed(key);
    }
  } 
  else if (sceneCounter === 2) {
    if (key === 'a' || key === 'A' || key === 'd' || key === 'D' || key === 's' || key === 'S' || key === 'q' || key === 'Q' || key === 'e' || key === 'E' || key === 'r' || key === 'R') {
      cityScene.handleKeyPressed(key);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawMainMenu() {

  let imgRatio = backgroundImg.width / backgroundImg.height;
  let screenRatio = width / height;
  let imgX = 0, imgY = 0, imgW = width, imgH = height;
  
  if (screenRatio > imgRatio) {
    imgH = width / imgRatio;
    imgY = (height - imgH) / 2;
  } else {
    imgW = height * imgRatio;
    imgX = (width - imgW) / 2;
  }

  image(backgroundImg, imgX, imgY, imgW, imgH);
  
  fill(0, 0, 0, 100); 
  rect(0, 0, width, height);

  let buttonWidth = width * 0.2;
  let buttonHeight = height * 0.08;
  let spacing = height * 0.05;
  
  if (width < 600) {
    buttonWidth = width * 0.8;
    buttonHeight = height * 0.1;
    spacing = height * 0.03;
  }
  
  let centerX = width / 2;
  let centerY = height / 2;

  drawButton(
    centerX - buttonWidth / 2,
    centerY - 2*(buttonHeight + spacing / 2),
    buttonWidth,
    buttonHeight,
    "Start AR Control"
  );
  
  drawButton(
    centerX - buttonWidth / 2,
    centerY - buttonHeight - spacing / 2,
    buttonWidth,
    buttonHeight,
    "Scene 1: The rainforest"
  );
  
  drawButton(
    centerX - buttonWidth / 2,
    centerY + spacing / 2,
    buttonWidth,
    buttonHeight,
    "Scene 2: The city"
  );

  drawHelpText();
}

function drawButton(x, y, w, h, buttonText) {

  fill(245, 106, 57, 150);
  stroke(0);
  rect(x, y, w, h, h * 0.2);
  
  fill(0);
  noStroke();
  textSize(h * 0.4);
  push();
  textAlign(CENTER, CENTER);
  text(buttonText, x + w/2, y + h/2);
  pop();
}

function drawHelpText() {
  if (!showHelp) return;

  push();
  fill(0, 0, 0, 200);
  noStroke();
  
  let fontSize = width * 0.015;
  if (width < 600) {
    fontSize = width * 0.03;
  }
  textSize(fontSize);
  
  let margin = width * 0.02;
  let lineHeight = fontSize * 1.5;
  let x = margin;
  let y = margin + lineHeight;
  
  textAlign(LEFT, TOP);
  
  if (sceneCounter === 3) {
    text("Welcome to my interactive artwork! You can use mouse, keyboard, or AR control!", x, y);
    text("Press H to toggle help text, press V to toggle video window, press SPACEBAR for screenshot.", x, y + lineHeight);
    text("AR control requires camera to capture your hands and face. Please adjust your camera position for proper interaction.", x, y + lineHeight * 2);
    text("Click button or press C to toggle AR control on/off, press F to show/hide AR detection info.", x, y + lineHeight * 3);
    text("Number keys 1,2,3,4,5 switch black cursor to different fingers, middle finger by default.", x, y + lineHeight * 4);
    text("Click buttons to navigate different scenes, use LEFT/RIGHT arrow keys to switch between Scene 1 and 2.", x, y + lineHeight * 5);
    text("Press W or UP arrow to return to main menu, press R to reset everything.", x, y + lineHeight * 6);
    text("The mouse wheel controls the size of the black cursor.", x, y + lineHeight * 7);
  }
  else if (sceneCounter === 1) {
    text("Welcome to the rainforest scene! If you have questions about shortcuts, press R to return to the initial scene and read!", x, y);
    text("Hold A/D keys to create wind, release to stop.", x, y + lineHeight);
    text("Press S to start/stop rain. Press Q/E to adjust the size of raindrops.", x, y + lineHeight * 2);
    text("Mouse can interact with coconuts, rocks, and puddles.", x, y + lineHeight * 3);
    text("AR can also interact, first enable AR control.", x, y + lineHeight * 4);
    text("Wave your hand left/right to create different winds, wave up/down to calm the wind.", x, y + lineHeight * 5);
    text("Open your mouth wide to start the rain, the larger your mouth, the heavier the rain.", x, y + lineHeight * 6);
    text("Fingers control the black cursor movement, when moved to coconuts, they will fall.", x, y + lineHeight * 7);
    text("Move black cursor to puddles and touch/release thumb and index finger twice to trigger puddle interaction.", x, y + lineHeight * 8);
    text("Move black cursor to rocks and gradually decrease distance between thumb and index finger to pick up rocks.", x, y + lineHeight * 9);
    text("After moving the rock, increase distance between thumb and index finger to release it.", x, y + lineHeight * 10);
    text("Try dragging rocks into puddles to make splashes, or experience a storm!", x, y + lineHeight * 11);
  }
  else if (sceneCounter === 2) {
    text("Welcome to the bustling city intersection! If you have questions about shortcuts, press R to return to the initial scene and read!", x, y)
    text("Hold S key to reset all streetlights to default state.", x, y + lineHeight);
    text("Click cars/doors to honk, click streetlights/traffic lights to turn them on/off.", x, y + lineHeight * 2);
    text("Click fire hydrant to water the grass, click grass to grow flowers.", x, y + lineHeight * 3);
    text("AR can also interact, first enable AR control.", x, y + lineHeight * 4);
    text("Move black cursor to corresponding objects and touch/release thumb and index finger twice to trigger interaction (sensitive).", x, y + lineHeight * 5);
    text("Or move black cursor to corresponding objects and try nodding several times to trigger interaction (less sensitive).", x, y + lineHeight * 6);
    text("Traffic and pedestrians will move according to traffic light changes, and the scene will also transition between day and night!", x, y + lineHeight * 7);
  }
  pop();
}

function drawFingerPoint() {

  switch(currentFinger) {
      case "thumb":
          fingerMetrics = arControlScene.fingerMetrics.thumb;
          break;
      case "index":
          fingerMetrics = arControlScene.fingerMetrics.index;
          break;
      case "middle":
          fingerMetrics = arControlScene.fingerMetrics.middle;
          break;
      case "ring":
          fingerMetrics = arControlScene.fingerMetrics.ring;
          break;
      case "pinky":
          fingerMetrics = arControlScene.fingerMetrics.pinky;
          break;
      default:
          fingerMetrics = arControlScene.fingerMetrics.index;
  }

  if (fingerMetrics && fingerMetrics.width !== 0 && fingerMetrics.height !== 0) {

      const screenX = fingerMetrics.width * width;
      const screenY = fingerMetrics.height * height;

      push();
      fill(0, 0, 0, fingerCircleAlpha); 
      noStroke();
      circle(screenX, screenY, fingerCircleRadius * 2);
      pop();
  }
}

function switchFingerTracking(fingerType) {
  if (["thumb", "index", "middle", "ring", "pinky"].includes(fingerType)) {
      currentFinger = fingerType;
  }
}


function resetAllScenes() {

  stopAllSounds();
  sceneCounter = 3;
  
  forestScene = new ForestScene(windSounds, rainSound, waterSounds, lightingSounds);
  
  cityScene = new CityScene(hornSounds, doorbellSounds, fountainSound);
}

function stopAllSounds() {

  windSounds.forEach(sound => {
    if (sound.isPlaying()) {
      sound.stop();
    }
  });
  
  if (rainSound.isPlaying()) {
    rainSound.stop();
  }
  
  waterSounds.forEach(sound => {
    if (sound.isPlaying()) {
      sound.stop();
    }
  });
  
  lightingSounds.forEach(sound => {
    if (sound.isPlaying()) {
      sound.stop();
    }
  });
  
  hornSounds.forEach(sound => {
    if (sound.isPlaying()) {
      sound.stop();
    }
  });
  
  doorbellSounds.forEach(sound => {
    if (sound.isPlaying()) {
      sound.stop();
    }
  });
  
  if (fountainSound.isPlaying()) {
    fountainSound.stop();
  }
}