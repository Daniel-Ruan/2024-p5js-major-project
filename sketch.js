// sketch.js
let sceneCounter = 3;
let forestScene;
let cityScene;
let dynapuffFont;
let windSounds = [];
let showHelp = true;

function preload() {
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

  textFont(dynapuffFont);
  textAlign(CENTER, CENTER);
}

function draw() {
  if (sceneCounter === 3) {
    drawMainMenu();
  } else if (sceneCounter === 1) {
    forestScene.draw();
    drawHelpText();
  } else if (sceneCounter === 2) {
    cityScene.draw();
    drawHelpText(); 
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
  } else if (sceneCounter === 1) {
    if (key === 'a' || key === 'A' || key === 'd' || key === 'D' || key === 's' || key === 'S' || key === 'q' || key === 'Q' || key === 'e' || key === 'E' || key === 'r' || key === 'R') {
      forestScene.handleKeyPressed(key);
    }
  } else if (sceneCounter === 2) {
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
    // 屏幕比图片宽，以宽度为基准
    imgH = width / imgRatio;
    imgY = (height - imgH) / 2;
  } else {
    // 屏幕比图片窄，以高度为基准
    imgW = height * imgRatio;
    imgX = (width - imgW) / 2;
  }
  
  // 绘制背景图片
  image(backgroundImg, imgX, imgY, imgW, imgH);
  
  // 添加半透明遮罩使按钮更容易看见
  fill(0, 0, 0, 100);  // 黑色半透明遮罩
  rect(0, 0, width, height);

  // 按钮尺寸计算
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
  
  // 绘制按钮
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

  fill(200, 230);
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
  fill(0, 0, 0, 100);
  noStroke();
  
  // 响应式文本大小
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
    text("Welcome to my interactive artwork!", x, y);
    text("Press H to toggle help text.", x, y + lineHeight);
    text("Click buttons or use keyboard shortcuts to switch scenes:", x, y + lineHeight * 2);
    text("Use LEFT/RIGHT ARROW KEYS to switch between scenes.", x, y + lineHeight * 3);
    text("Press W or UP ARROW to return to main menu.", x, y + lineHeight * 4);
    text("Press R to reset everything to initial state.", x, y + lineHeight * 5);
    text("Press SPACEBAR to take a screenshot.", x, y + lineHeight * 6);
  }
  else if (sceneCounter === 1) {
    text("Welcome to the rainforest scene!", x, y);
    text("Hold A/D to create wind.", x, y + lineHeight);
    text("Press S to start or stop the rain.", x, y + lineHeight * 2);
    text("Press Q/E to adjust the size of the raindrops.", x, y + lineHeight * 3);
    text("The screen features many interactive objects such as coconuts, rocks, and puddles.", x, y + lineHeight * 4);
    text("Try throwing stones into puddles to make a splash, or experience a storm!", x, y + lineHeight * 5);
  }
  else if (sceneCounter === 2) {
    text("Welcome to the bustling city intersection!", x, y)
    text("Hold S to reset the traffic lights.", x, y + lineHeight);
    text("The screen features many mouse-interactive objects:", x, y + lineHeight * 2);
    text("Click on cars/doors to honk the horn.", x, y + lineHeight * 3);
    text("Click on streetlights/traffic lights to turn them on or off.", x, y + lineHeight * 4);
    text("Try using the fire hydrant to water the grass or act as a traffic cop to direct traffic.", x, y + lineHeight * 5);
  }
  pop();
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