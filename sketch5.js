// sketch.js - 主文件
let sceneCounter = 1;
let seasonProgress = 0; // 控制季节变化
let dayProgress = 0; // 控制昼夜变化
let forestScene;
let windSounds = [];

function preload() {
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
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  forestScene = new ForestScene(windSounds, rainSound, waterSounds, lightingSounds);
}

function draw() {
  if (sceneCounter === 1) {
    forestScene.draw();
  } else if (sceneCounter === 2) {
    drawCityScene();
  }
}

function mousePressed() {
  if (sceneCounter === 1) {
    forestScene.handleMousePressed();
  }
}

function mouseDragged() {
  if (sceneCounter === 1) {
    forestScene.handleMouseDragged();
  }
}

function mouseReleased() {
  if (sceneCounter === 1) {
    forestScene.handleMouseReleased();
  }
}

function mouseMoved() {
  if (sceneCounter === 1) {
    forestScene.handleMouseMove(mouseX, mouseY);
  }
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
  } else if (key === " ") {
    saveCanvas("thumbnail.png");
  } else if (sceneCounter === 1) {
    if (key === 'a' || key === 'A' || key === 'd' || key === 'D' || key === 's' || key === 'S' || key === 'q' || key === 'Q' || key === 'e' || key === 'E') {
      forestScene.handleKeyPressed(key);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}