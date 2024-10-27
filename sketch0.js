// 存储π的数字
let piDigits = "3.14159265358979323846";
let particles = [];
let currentIndex = 0;
let rotationAngle = 0;
let lastInteractionTime = 0;
let soundWaves = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  // 初始化粒子
  for(let i = 0; i < piDigits.length; i++) {
    if(piDigits[i] !== '.') {
      particles.push(createParticle(piDigits[i], i));
    }
  }
}

function createParticle(digit, index) {
  return {
    digit: parseInt(digit),
    angle: index * TWO_PI / 10,
    radius: 50 + index * 15,
    color: color(index * 20 % 360, 80, 90),
    speed: 0.02,
    phase: random(TWO_PI)
  };
}

function draw() {
  // 渐变背景
  background(240, 20, 15, 0.1);
  
  // 检查是否需要添加交互提示
  if(millis() - lastInteractionTime > 5000) {
    showInteractionHint();
  }
  
  translate(width/2, height/2);
  rotate(rotationAngle);
  
  // 绘制连接线
  stroke(200, 30, 90, 0.1);
  for(let i = 0; i < particles.length - 1; i++) {
    let p1 = particles[i];
    let p2 = particles[i + 1];
    let x1 = cos(p1.angle) * p1.radius;
    let y1 = sin(p1.angle) * p1.radius;
    let x2 = cos(p2.angle) * p2.radius;
    let y2 = sin(p2.angle) * p2.radius;
    line(x1, y1, x2, y2);
  }
  
  // 更新和绘制粒子
  for(let particle of particles) {
    // 更新位置
    particle.angle += particle.speed;
    
    // 计算位置
    let x = cos(particle.angle) * particle.radius;
    let y = sin(particle.angle) * particle.radius;
    
    // 添加呼吸效果
    let breathingRadius = particle.radius + sin(frameCount * 0.05 + particle.phase) * 10;
    
    // 绘制粒子
    noStroke();
    fill(particle.color);
    circle(x, y, 20);
    
    // 绘制数字
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(particle.digit, x, y);
  }
  
  // 绘制声波效果
  updateSoundWaves();
  
  // 缓慢旋转
  rotationAngle += 0.001;
}

function updateSoundWaves() {
  // 更新并绘制声波
  for(let i = soundWaves.length - 1; i >= 0; i--) {
    let wave = soundWaves[i];
    wave.radius += 2;
    wave.alpha -= 0.02;
    
    if(wave.alpha <= 0) {
      soundWaves.splice(i, 1);
      continue;
    }
    
    noFill();
    stroke(wave.color);
    strokeWeight(2);
    circle(0, 0, wave.radius * 2);
  }
}

function mousePressed() {
  // 添加新的声波
  soundWaves.push({
    radius: 10,
    alpha: 1,
    color: color(random(360), 80, 90, 0.5)
  });
  lastInteractionTime = millis();
}

function mouseDragged() {
  // 通过拖动改变粒子速度
  let dx = mouseX - pmouseX;
  let dy = mouseY - pmouseY;
  let speed = map(sqrt(dx*dx + dy*dy), 0, 50, 0, 0.1);
  
  for(let particle of particles) {
    particle.speed = speed;
  }
  lastInteractionTime = millis();
}

function showInteractionHint() {
  // 显示交互提示
  push();
  noStroke();
  fill(0, 0, 100, 0.7);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Click or drag to interact", 0, height/4);
  pop();
}

function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}