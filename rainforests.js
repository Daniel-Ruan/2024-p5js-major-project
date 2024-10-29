// rainforest.js
class CoconutTree {
  constructor(xRatio, yRatio, numCoconuts = 4) {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.curve = random(-0.2, 0.2);
    this.numLeaves = 8;
    
    this.leaves = [];

    this.coconuts = [];

    this.swayAngle = 0;
    this.swaying = false;
    this.swayDirection = '';
    this.swaySpeed = 0.1;

    this.initLeaves();
    this.initCoconuts(numCoconuts);
  }

  initLeaves() {
    for (let i = 0; i < this.numLeaves; i++) {
      let baseAngle = (i * TWO_PI / this.numLeaves);
      let randomOffset = random(-PI / 12, PI / 12);
      let finalAngle = baseAngle + randomOffset;
      if (!(finalAngle > PI / 2 - PI / 6 && finalAngle < PI / 2 + PI / 6)) {
        this.leaves.push({
          baseAngle: baseAngle,
          randomOffset: randomOffset,
          currentAngle: finalAngle
        });
      }
    }
  }

  initCoconuts(numCoconuts) {
    for (let i = 0; i < numCoconuts; i++) {
      this.coconuts.push(new Coconut(
        random(0, PI),
        random(0.02, 0.04),
        random(0.02, 0.025)
      ));
    }
  }

  draw() {

    this.update();
    push();
    let x = width * this.xRatio;
    let y = height * this.yRatio;
    translate(x, y);

    this.drawTrunk();
    
    let trunkHeight = height * 0.35;
    let treeTopX = this.curve * width * 0.1;
    let treeTopY = -trunkHeight;
    translate(treeTopX, treeTopY);
    
    for (let coconut of this.coconuts) {
      if (!coconut.isFalling) {
        coconut.draw(0, 0);
      }
    }
    
    this.drawLeaves();
    
    pop();

    for (let coconut of this.coconuts) {
      if (coconut.isFalling) {
        coconut.updateFall();
        coconut.draw(x + treeTopX, y + treeTopY);
      }
    }
  }

  drawTrunk() {
    let trunkHeight = height * 0.35;
    let baseWidth = width * 0.035;
    
    push();
    noFill();
    stroke(139, 69, 19);
    
    strokeWeight(baseWidth * 1.1);
    line(-baseWidth * 0.15, 0, baseWidth * 0.15, 0);
    
    strokeWeight(baseWidth);
    beginShape();
    vertex(0, 0);
    let cp1x = this.curve * width * 0.05;
    let cp1y = -trunkHeight * 0.3;
    let cp2x = this.curve * width * 0.1;
    let cp2y = -trunkHeight * 0.7;
    let endx = this.curve * width * 0.1;
    let endy = -trunkHeight;
    bezierVertex(cp1x, cp1y, cp2x, cp2y, endx, endy);
    endShape();
    
    let points = [];
    let steps = 20;
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let px = bezierPoint(0, cp1x, cp2x, endx, t);
      let py = bezierPoint(0, cp1y, cp2y, endy, t);
      points.push({x: px, y: py});
    }
    
    stroke(101, 67, 33, 200);
    strokeWeight(width * 0.002);
    
    for(let i = 1; i < points.length - 1; i++) {
      let p = points[i];
      let angle = atan2(points[i+1].y - points[i-1].y, 
                       points[i+1].x - points[i-1].x);
      
      let t = i / (points.length - 1);
      let lineLength = baseWidth * (1.2 - t * 0.4);
      
      push();
      translate(p.x, p.y);
      rotate(angle + PI/2);
      line(-lineLength/2, 0, lineLength/2, 0);
      pop();
    }
    
    pop();
}
  drawLeaves() {
    for(let leaf of this.leaves) {
      this.drawLeaf(leaf);
    }
  }

  drawLeaf(leaf) {
    let leafLength = width * 0.2;
    let leafWidth = width * 0.03;
    
    push();
    rotate(leaf.currentAngle + this.swayAngle);
    
    noStroke();
    fill(34, 139, 34, 200);
    
    beginShape();
    vertex(0, 0);
    
    let points = [];
    for (let t = 0; t <= 1; t += 0.05) {
      let x = leafLength * t;
      let width = sin(t * PI) * leafWidth * (1 - t * 0.3);
      points.push({x: x, y: -width});
    }
    
    for (let p of points) {
      vertex(p.x, p.y);
    }
    
    for (let p of points.reverse()) {
      vertex(p.x, -p.y);
    }
    
    endShape(CLOSE);
    
    stroke(22, 109, 22, 200);
    strokeWeight(width * 0.003);
    line(0, 0, leafLength, 0);
    
    strokeWeight(width * 0.001);
    let numVeins = 20;
    
    for(let i = 1; i < numVeins; i++) {
      let t = i / numVeins;
      let x = leafLength * t;
      let maxWidth = sin(t * PI) * leafWidth * (1 - t * 0.3);
      
      let veinLength = maxWidth * 0.9;
      let baseAngle = map(t, 0, 1, PI/3, PI/6);
      
      push();
      translate(x, 0);
      rotate(-baseAngle);

      beginShape();
      for(let v = 0; v <= 1; v += 0.1) {
        let vx = sin(v * PI/2) * veinLength * 0.2;
        let vy = -v * veinLength;
        vertex(vx, vy);
      }
      endShape();
      pop();
      
      push();
      translate(x, 0);
      rotate(baseAngle);
      beginShape();
      for(let v = 0; v <= 1; v += 0.1) {
        let vx = sin(v * PI/2) * veinLength * 0.2;
        let vy = v * veinLength;
        vertex(vx, vy);
      }
      endShape();
      pop();
      
      if (i % 2 == 0) {
        let secondaryVeinLength = veinLength * 0.4;
        for (let j = 1; j < 3; j++) {
          push();
          translate(x, -veinLength * j/3);
          rotate(-baseAngle * 0.7);
          line(0, 0, secondaryVeinLength * 0.7, 0);
          pop();
          
          push();
          translate(x, veinLength * j/3);
          rotate(baseAngle * 0.7);
          line(0, 0, secondaryVeinLength * 0.7, 0);
          pop();
        }
      }
    }
    
    pop();
  }

  drawCoconuts() {
    for (let coconut of this.coconuts) {
      if (!coconut.isFalling) {
        coconut.draw(0, 0);
      }
    }
  }

  startSwaying(direction) {
    this.swaying = true;
    this.swayDirection = direction;
  }

  stopSwaying() {
    this.swaying = false;
    this.swayAngle = 0;
  }

  update() {
    if (this.swaying) {
      if (this.swayDirection === 'right') {
        this.swayAngle = PI/12 * sin(frameCount * this.swaySpeed) * 
          (sin(frameCount * this.swaySpeed) > 0 ? 1.5 : 0.5);
      } else {
        this.swayAngle = PI/12 * sin(frameCount * this.swaySpeed) * 
          (sin(frameCount * this.swaySpeed) < 0 ? 1.5 : 0.5);
      }
      this.angle = this.startAngle + this.swayAngle;
    }
  }

  handleMouseMove(mx, my) {
    let treeTopX = width * this.xRatio + this.curve * width * 0.1;
    let treeTopY = height * this.yRatio - height * 0.35;
  
    for (let coconut of this.coconuts) {
      if (!coconut.isFalling) {
        if (coconut.checkHover(mx, my, treeTopX, treeTopY)) {
          coconut.startFalling();
        }
      }
    }
  }
}

class Coconut {
  constructor(angle, distanceRatio, sizeRatio) {
    this.angle = angle;
    this.distanceRatio = distanceRatio;
    this.sizeRatio = sizeRatio;
    
    this.isFalling = false;
    this.fallVelocity = 0;
    this.isHovered = false;
    this.gravity = 0.4;
    this.bounceVelocity = -8;
    this.bounceCount = 0;
    this.maxBounces = Math.floor(Math.random() * 3) + 1;
  }

  checkHover(mx, my, treeTopX, treeTopY) {
    if (this.isFalling) return false;
    
    let coconutX = treeTopX + cos(this.angle) * (width * this.distanceRatio);
    let coconutY = treeTopY + sin(this.angle) * (width * this.distanceRatio);
    let size = width * this.sizeRatio;
  
    if (!this.isFalling) {
      this.fallX = coconutX;
      this.fallY = coconutY;
    }
  
    let d = dist(mx, my, coconutX, coconutY);
    this.isHovered = d < size *1.1;
  
    return this.isHovered;
  }

  startFalling() {
    if (!this.isFalling) {
      this.isFalling = true;
      this.fallVelocity = 0;
    }
  }

  updateFall() {
    if (this.isFalling) {
      this.fallVelocity += this.gravity;
      this.fallY += this.fallVelocity;
      
      if (this.fallY > height * 0.9) {
        this.fallY = height * 0.9;
        if (Math.abs(this.fallVelocity) > 1 && this.bounceCount < this.maxBounces) {
          this.fallVelocity = this.bounceVelocity * 0.6;
          this.bounceCount++;
        } else {
          this.fallVelocity = 0;
        }
      }
    }
  }

  draw(treeTopX, treeTopY) {
    push();
    if (!this.isFalling) {

      translate(treeTopX, treeTopY);
      rotate(this.angle);
      translate(width * this.distanceRatio, 0);
    } else {

      translate(treeTopX, this.fallY);
      rotate(this.angle);
      translate(width * this.distanceRatio, 0);
    }
    
    let size = width * this.sizeRatio;
    
    noStroke();
    fill(81, 47, 13, 50);
    ellipse(size * 0.1, size * 0.1, size, size);
    
    fill(this.isHovered ? color(121, 87, 53) : color(101, 67, 33));
    ellipse(0, 0, size, size);
    
    stroke(81, 47, 13, 100);
    strokeWeight(size * 0.05);
    noFill();
    arc(0, 0, size * 0.7, size * 0.7, PI/6, PI/2);
    arc(0, 0, size * 0.6, size * 0.6, -PI/2, -PI/6);
    
    noStroke();
    fill(139, 99, 47, 100);
    ellipse(-size * 0.2, -size * 0.2, size * 0.4, size * 0.4);
    pop();
  }
}

class Sky {
  constructor() {
    this.gradientOffset = 0;
    this.isRaining = false;
    this.currentRainLevel = 'medium'; 
    
    this.colors = {
      sunny: {
        top: color('#46B5BB'),
        bottom: color('#70C1A4')
      },
      rain: {
        light: {
          top: color('#3A95A0'),    
          bottom: color('#5DA088')
        },
        medium: {
          top: color('#2D7A85'),    
          bottom: color('#4A806D')
        },
        heavy: {
          top: color('#1F5F6A'),    
          bottom: color('#375F52')
        }
      }
    };
  }

  setRainState(isRaining, level = 'medium') {
    this.isRaining = isRaining;
    this.currentRainLevel = level;
  }

  draw() {
    push();
    noStroke();
    for (let y = 0; y <= height; y++) {
      let wave = sin((y * 0.01) + (this.gradientOffset * 0.02)) * (height * 0.02);
      let newY = y + wave;

      newY = constrain(newY, 0, height);
      let inter = map(newY, 0, height, 0, 1);
      inter = constrain(inter, 0, 1);

      let c;
      if (this.isRaining) {
        let rainColors = this.colors.rain[this.currentRainLevel];
        c = lerpColor(rainColors.top, rainColors.bottom, inter);
      } else {
        c = lerpColor(this.colors.sunny.top, this.colors.sunny.bottom, inter);
      }

      stroke(c);
      line(0, y, width, y);
    }
    this.gradientOffset += 1;
    pop();
  }
}
class Ground {
  constructor(mainArcColor, additionalArcsColor, arcWidth, groundColor, noiseIncrement) {
    this.yoff = 0;
    this.mainArcColor = mainArcColor;           // Hexadecimal color for the main arc
    this.additionalArcsColor = additionalArcsColor; // Hexadecimal color for the additional arcs
    this.arcWidth = arcWidth;                   // Width of the arcs
    this.groundColor = groundColor;             // Hexadecimal color for the ground
    this.noiseIncrement = noiseIncrement;       // Increment value for the noise function

    // Generate random x-coordinates for the three transparent arcs upon initialization
    this.arcPositions = [
      random(width * 0.1, width * 0.9),
      random(width * 0.1, width * 0.9),
      random(width * 0.1, width * 0.9)
    ];
  }

  draw() {
    push();
    fill(this.groundColor); // Use the specified hexadecimal ground color
    noStroke();
    beginShape();
    vertex(0, height);

    let xoff = 0;
    for (let x = 0; x <= width; x += width * 0.005) {
      let y = map(noise(xoff, this.yoff), 0, 1, height * 0.7, height * 0.8);
      vertex(x, y);
      xoff += this.noiseIncrement;
    }

    vertex(width, height);
    endShape(CLOSE);

    // Draw the main arc with the specified main arc color
    fill(this.mainArcColor);
    arc(width / 2, height, this.arcWidth, height * 0.3, PI, TWO_PI, OPEN);

    // Draw additional arcs with the specified additional arcs color at random positions
    this.arcPositions.forEach(xPos => {
      fill(this.additionalArcsColor);
      arc(xPos, height, this.arcWidth, height * 0.3, PI, TWO_PI, OPEN);
    });

    pop();
    this.yoff += 0.001; // Increment y-offset for dynamic ground movement
  }
}

class ForegroundGrass {
  constructor(position, scale, color, opacity) {
    this.position = position;
    this.scale = scale;
    this.color = color;
    this.opacity = opacity;
    this.noiseOffset = random(100); // Random noise offset for unique grass shapes
  }

  draw() {
    let grassWidth = width * 0.2 * this.scale;
    let xStartPixel = this.position === 'left' ? 0 : width - grassWidth;
    let maxGrassHeight = height * 0.5 * this.scale;
    let noiseScale = 0.1;

    push();
    fill(red(this.color), green(this.color), blue(this.color), this.opacity);
    noStroke();
    beginShape();
    vertex(xStartPixel, height);
    vertex(xStartPixel + grassWidth, height);

    for (let currentX = xStartPixel + grassWidth; currentX >= xStartPixel; currentX -= width * 0.003) {
      let t = (currentX - xStartPixel) / grassWidth;
      let heightFunction = this.position === 'left' ? (1 - t * t) : (t * t);
      let quadraticHeight = maxGrassHeight * heightFunction;
      let noiseValue = noise(currentX * noiseScale + this.noiseOffset);
      let heightVariation = map(noiseValue, 0, 1, 0, quadraticHeight);
      let y = height - heightVariation;
      vertex(currentX, y);
    }

    endShape(CLOSE);
    pop();
  }
}

class Stone {
  constructor(xRatio, yRatio, sizeRatio) {
    let xOffset = random(-0.02, 0.02);  
    let yOffset = random(-0.02, 0.02);
    
    this.xRatio = xRatio + xOffset;
    this.yRatio = yRatio + yOffset;
    this.lastXRatio = this.xRatio; 
    this.lastYRatio = this.yRatio;
    this.sizeRatio = sizeRatio;
    this.dragging = false;
    this.x = width * this.xRatio;
    this.y = height * this.yRatio;
    this.offsetX = 0;
    this.offsetY = 0;
    this.opacity = 255;  
    this.fadeSpeed = 10; 
    this.active = true; 
  }

  reset() {
    if (!this.active) {

      this.xRatio = this.lastXRatio;
      this.yRatio = this.lastYRatio;
      this.x = width * this.xRatio;
      this.y = height * this.yRatio;
      this.opacity = 255;
      this.dragging = false;
      this.active = true;
    }
  }


  draw() {

    if (!this.active) return; 

    if (!this.dragging && forestScene.rain.isRaining) {
      for (let puddle of forestScene.puddles) {
        if (this.checkPuddleCollision(puddle)) {
          puddle.addRipple(
            (this.x - width * puddle.xRatio), 
            (this.y - height * puddle.yRatio)
          );
          this.fadeOut();
          break;
        }
      }
    }

    if (this.opacity <= 0) {
      this.active = false; 
      return;
    }

    push();
    noStroke();
    
    if (!this.dragging) {
      this.x = width * this.xRatio;
      this.y = height * this.yRatio;
    }
    
    let size = width * this.sizeRatio;
    let depth = size * 0.3;
    
    let baseColor = this.dragging ? color(180) : color(120);
    
    fill(red(baseColor) + 40, green(baseColor) + 40, blue(baseColor) + 40, this.opacity);
    quad(
      this.x, this.y,
      this.x + size, this.y,
      this.x + size - depth, this.y - depth,
      this.x - depth, this.y - depth
    );
    
    fill(red(baseColor) - 20, green(baseColor) - 20, blue(baseColor) - 20, this.opacity);
    quad(
      this.x + size, this.y,
      this.x + size - depth, this.y - depth,
      this.x + size - depth, this.y + size - depth,
      this.x + size, this.y + size
    );

    fill(red(baseColor) - 10, green(baseColor) - 10, blue(baseColor) - 10, this.opacity);
    quad(
      this.x, this.y,
      this.x - depth, this.y - depth,
      this.x - depth, this.y + size - depth,
      this.x, this.y + size
    );
    
    fill(red(baseColor), green(baseColor), blue(baseColor), this.opacity); 
    rect(this.x, this.y, size, size);  
    
    pop();
  }

  fadeOut() {
    this.opacity = max(0, this.opacity - this.fadeSpeed);
    this.dragging = false; 
  }

  checkPuddleCollision(puddle) {
    if (this.opacity <= 0 || puddle.opacity <= 0) return false;

    let size = width * this.sizeRatio;
    let puddleX = width * puddle.xRatio;
    let puddleY = height * puddle.yRatio;
    let maxSizeX = width * puddle.currentSizeRatio;
    let maxSizeY = maxSizeX * 0.6;

    let points = [
      {x: this.x, y: this.y},
      {x: this.x + size, y: this.y},
      {x: this.x + size, y: this.y + size},
      {x: this.x, y: this.y + size}
    ];

    for (let point of points) {
      if (puddle.isPointInShape(point.x, point.y, puddleX, puddleY, maxSizeX, maxSizeY)) {
        return true;
      }
    }
    return false;
  }

  pressed(mx, my) {
    let size = width * this.sizeRatio;
    
    if (mx > this.x && mx < this.x + size && 
        my > this.y && my < this.y + size) {
      this.dragging = true;
      this.offsetX = this.x - mx;
      this.offsetY = this.y - my;
    }
  }

  dragged(mx, my) {
    if (this.dragging) {
      this.x = mx + this.offsetX;
      this.y = my + this.offsetY;
    }
  }

  released() {

    this.lastXRatio = this.x / width;
    this.lastYRatio = this.y / height;
    this.xRatio = this.lastXRatio;
    this.yRatio = this.lastYRatio;
    this.dragging = false;
  }
}

class Wind {
  constructor() {
    this.lines = [];
    this.maxLines = 5;  
    this.isBlowing = false;
    this.direction = 'right';
  }

  startWind(direction) {
    this.isBlowing = true;
    this.direction = direction;
    this.lines = []; 
  }

  stopWind() {
    this.isBlowing = false;
    this.lines = []; 
  }

  addNewLine() {
    const line = {
      x: this.direction === 'right' ? 
         random(-width * 0.1, 0) : 
         random(width * 0.8, width * 0.9),
      y: random(height * 0.2, height * 0.8),
      length: this.direction === 'right' ? 
              random(width * 0.2, width * 0.4) :
              random(width * 0.3, width * 0.5),
      speed: (this.direction === 'right' ? 1 : -1) * random(10, 15),
      curve: random(20, 50),
      opacity: 255,
      phase: random(TWO_PI),

      slope: random(-3, 3)
    };
    this.lines.push(line);
    
    if (this.lines.length > this.maxLines) {
      this.lines.shift();
    }
  }

  update() {
    if (this.isBlowing && frameCount % 10 === 0) {
      this.addNewLine();
    }

    for (let i = this.lines.length - 1; i >= 0; i--) {
      let line = this.lines[i];
      line.x += line.speed;
      line.opacity -= this.direction === 'left' ? 1.5 : 2;

      if (line.opacity <= 0 || 
          (this.direction === 'right' && line.x > width + line.length) ||
          (this.direction === 'left' && line.x < -line.length * 2)) {
        this.lines.splice(i, 1);
      }
    }
  }

  draw() {
    push();
    noFill();
    
    for (let line of this.lines) {
      stroke(255, line.opacity);
      strokeWeight(2);
      
      beginShape();
      for (let i = 0; i <= line.length; i += 8) {
        let x = line.x + i;

        let slopeOffset = (i / line.length) * line.slope * 20; // 乘以20来放大效果
        let y = line.y + sin((x * 0.01) + line.phase) * line.curve + slopeOffset;
        curveVertex(x, y);
      }
      endShape();
    }
    
    pop();
  }
}

class WindSound {
  constructor(windSounds) {
    this.sounds = windSounds;
    this.currentSound = null;
    this.isPlaying = false;
    this.fadeTime = 0.5;

    // 为每个声音添加结束事件监听器
    this.sounds.forEach(sound => {
      sound.onended(() => {
        if (this.isPlaying) {
          this.playRandomSound();
        }
      });
    });
  }

  playRandomSound() {
    this.currentSound = random(this.sounds);
    this.currentSound.setVolume(1);
    this.currentSound.play();
  }

  play() {
    this.isPlaying = true;
    this.playRandomSound();
  }

  stop() {
    this.isPlaying = false;
    if (this.currentSound && this.currentSound.isPlaying()) {
      this.currentSound.stop();
    }
  }
}

class Rain {
  constructor() {
    this.drops = [];
    this.splashes = [];
    this.isRaining = false;

    this.groundYMin = height * 0.8;
    this.groundYMax = height * 0.85;

    this.windAngle = 0;
    this.targetWindAngle = 0;
    this.windTransitionSpeed = 0.1;
    
    this.rainLevels = {
      light: {
        intensity: 50,
        length: [8, 15],
        speed: [8, 12],
        thickness: [0.8, 1.5],
        splashParticles: [2, 4],

        color: {
          r: 220,
          g: 220,
          b: 255,
          alphaRange: [100, 150] 
        }
      },
      medium: {
        intensity: 100,
        length: [10, 20],
        speed: [10, 15],
        thickness: [1, 2],
        splashParticles: [3, 6],

        color: {
          r: 200,
          g: 200,
          b: 255,
          alphaRange: [150, 200]
        }
      },
      heavy: {
        intensity: 200,
        length: [15, 25],
        speed: [12, 18],
        thickness: [1.5, 2.5],
        splashParticles: [4, 7],

        color: {
          r: 180,
          g: 180,
          b: 255,
          alphaRange: [200, 255] 
        }
      }
    };
    
    this.currentLevel = 'medium';
    this.currentParams = this.rainLevels.medium;
  }

  setWindDirection(direction) {
    if (direction === 'left') {

      this.targetWindAngle = random(-20, 0);
    } else if (direction === 'right') {

      this.targetWindAngle = random(0, 20);
    } else {

      this.targetWindAngle = 0;
    }
  }

  changeIntensity(direction) {
    const levels = ['light', 'medium', 'heavy'];
    let currentIndex = levels.indexOf(this.currentLevel);
    
    if (direction === 'increase' && currentIndex < levels.length - 1) {
      currentIndex++;
    } else if (direction === 'decrease' && currentIndex > 0) {
      currentIndex--;
    }
    
    this.currentLevel = levels[currentIndex];
    this.currentParams = this.rainLevels[this.currentLevel];
    
    if (this.isRaining) {
      this.updateRaindrops();
    }
  }

  updateRaindrops() {

    while (this.drops.length > this.currentParams.intensity) {
      this.drops.pop();
    }
    while (this.drops.length < this.currentParams.intensity) {
      this.createDrop();
    }
  }

  start() {
    this.isRaining = true;
    for (let i = 0; i < this.currentParams.intensity; i++) {
      this.createDrop();
    }
  }

  stop() {
    this.isRaining = false;
    this.drops = [];
    this.splashes = [];
  }

  createDrop() {
    let drop = {
      x: random(width),
      y: random(-100, 0),
      length: random(this.currentParams.length[0], this.currentParams.length[1]),
      speed: random(this.currentParams.speed[0], this.currentParams.speed[1]),
      thickness: random(this.currentParams.thickness[0], this.currentParams.thickness[1]),
      opacity: random(this.currentParams.color.alphaRange[0], 
                     this.currentParams.color.alphaRange[1])
    };
    this.drops.push(drop);
  }

  createSplash(x, y) {
    let numParticles = floor(random(
      this.currentParams.splashParticles[0],
      this.currentParams.splashParticles[1]
    ));
    
    for (let i = 0; i < numParticles; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 5);
      let splash = {
        x: x,
        y: y,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed - 2,
        opacity: this.currentParams.color.alphaRange[1], // 使用最大不透明度
        size: random(2, 4)
      };
      this.splashes.push(splash);
    }
  }


  update() {
    if (!this.isRaining) return;

    this.windAngle = lerp(this.windAngle, this.targetWindAngle, this.windTransitionSpeed);

    this.groundYMin = height * 0.85;
    this.groundYMax = height * 0.95;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      let drop = this.drops[i];
      
      let angleInRadians = radians(this.windAngle);
      drop.x += drop.speed * sin(angleInRadians);
      drop.y += drop.speed * cos(angleInRadians);

      let groundY = random(this.groundYMin, this.groundYMax);
      if (drop.y > groundY) {
        this.createSplash(drop.x, groundY);
        this.drops.splice(i, 1);
        if (this.isRaining) {
          this.createDrop();
        }
      }
    }

    for (let i = this.splashes.length - 1; i >= 0; i--) {
      let splash = this.splashes[i];
      splash.x += splash.vx + (this.windAngle * 0.1);
      splash.y += splash.vy;
      splash.vy += 0.2;
      splash.opacity -= 10;

      if (splash.opacity <= 0) {
        this.splashes.splice(i, 1);
      }
    }
  }

  draw() {
    if (!this.isRaining) return;

    push();
    let color = this.currentParams.color;
    
    for (let drop of this.drops) {
      push();

      translate(drop.x, drop.y);
      
      stroke(color.r, color.g, color.b, drop.opacity);
      strokeWeight(drop.thickness);
      
      let bottomOffsetX = drop.length * sin(radians(this.windAngle));

      line(0, 0, bottomOffsetX, drop.length);
      
      pop();
    }

    noStroke();
    for (let splash of this.splashes) {
      fill(color.r, color.g, color.b, splash.opacity);
      ellipse(splash.x, splash.y, splash.size, splash.size);
    }

    pop();
  }
}

class RainSound {
  constructor(sound) {
    this.sound = sound;
    this.isPlaying = false;
    
    this.rainLevels = {
      light: {
        volume: 0.3,     
        speed: 0.8       
      },
      medium: {
        volume: 0.5,     
        speed: 1.0       
      },
      heavy: {
        volume: 0.8,     
        speed: 1.2      
      }
    };
    
    this.currentLevel = 'medium';
    this.sound.setLoop(true);
    this.updateSoundParameters();
  }

  updateSoundParameters() {
    const params = this.rainLevels[this.currentLevel];
    this.sound.setVolume(params.volume);
    this.sound.rate(params.speed);
  }

  changeIntensity(direction) {
    const levels = ['light', 'medium', 'heavy'];
    let currentIndex = levels.indexOf(this.currentLevel);
    
    if (direction === 'increase' && currentIndex < levels.length - 1) {
      currentIndex++;
    } else if (direction === 'decrease' && currentIndex > 0) {
      currentIndex--;
    }
    
    this.currentLevel = levels[currentIndex];
    this.updateSoundParameters();
  }

  play() {
    if (!this.isPlaying) {
      this.sound.play();
      this.isPlaying = true;
    }
    this.updateSoundParameters();
  }

  stop() {
    if (this.isPlaying) {
      this.sound.stop();
      this.isPlaying = false;
    }
  }
}

class BananaLeaf {
  constructor(x, y, size, baseAngle = 0) {
    this.xRatio = x;      
    this.yRatio = y;      
    this.sizeRatio = size;  
    this.baseAngle = baseAngle;
    this.angle = this.baseAngle + random(-PI/12, PI/6);  
    this.curveVariation = random(0.8, 1.2);
    
    this.swayAngle = 0;       
    this.swaySpeed = 0.1;        
    this.swaying = false;      
    this.startAngle = this.angle; 
    this.swayDirection = 'right';  
  }

    startSwaying(direction) {
      this.swaying = true;
      this.swayDirection = direction;
      this.startAngle = this.angle;
    }
  
    stopSwaying() {
      this.swaying = false;
      this.swayAngle = 0;
      this.angle = this.startAngle;
    }
  
    update() {
      if (this.swaying) {

        if (this.swayDirection === 'right') {

          this.swayAngle = PI/12 * sin(frameCount * this.swaySpeed) * 
            (sin(frameCount * this.swaySpeed) > 0 ? 1.5 : 0.5);
        } else {

          this.swayAngle = PI/12 * sin(frameCount * this.swaySpeed) * 
            (sin(frameCount * this.swaySpeed) < 0 ? 1.5 : 0.5);
        }
        this.angle = this.startAngle + this.swayAngle;
      }
    }

    draw() {
      this.update();
  
      push();
      
      let x = width * this.xRatio;
      let y = height * this.yRatio;
      let size = width * this.sizeRatio;
      let mainVeinLength = size * 0.95;  
      
      translate(x, y);
      translate(0, -mainVeinLength);  
      rotate(this.angle);  
      translate(0, mainVeinLength);  
      
      let leafColor = color(34, 139, 34);
      fill(leafColor);
      noStroke();
      
      beginShape();
      vertex(0, 0);
      
      for (let t = 0; t <= 1; t += 0.1) {
        let px = -size * 0.33 * sin(t * PI);
        let py = -size * t * this.curveVariation;
        curveVertex(px, py);
      }
      
      vertex(0, -size);
      
      for (let t = 1; t >= 0; t -= 0.1) {
        let px = size * 0.33 * sin(t * PI);
        let py = -size * t * this.curveVariation;
        curveVertex(px, py);
      }
      
      endShape(CLOSE);
      
      stroke(leafColor.levels[0] - 20, leafColor.levels[1] - 20, leafColor.levels[2] - 20);
      strokeWeight(size * 0.02);
      
      line(0, 0, 0, -mainVeinLength);
      
      let numVeins = 8;
      for (let i = 1; i < numVeins; i++) {
        let t = i / numVeins;
        let y = -mainVeinLength * t;
        let leftX = -size * 0.3 * sin(t * PI);
        let rightX = size * 0.3 * sin(t * PI);
        
        push();
        translate(0, y);
        rotate(-PI/4 * t);
        line(0, 0, leftX * 0.7, 0);
        pop();

        push();
        translate(0, y);
        rotate(PI/4 * t);
        line(0, 0, rightX * 0.7, 0);
        pop();
      }
      
      pop();
    }
}


class Puddle {
  constructor(xRatio, yRatio, sizeRatio) {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.baseSizeRatio = sizeRatio;  
    this.currentSizeRatio = 0;      
    this.targetSizeRatio = 0;       
    this.ripples = [];
    this.maxRipples = 3;  

    this.pathPoints = [];
    
    this.outerBaseColor = color('#A7D9F7');
    this.innerBaseColor = color('#B7E3F7');
    this.highlightBaseColor = color('#DDEBEE');
    this.shadowBaseColor = color('#77C1F7');
    
    this.points = this.initPoints();
    
    this.opacity = 0;
    this.targetOpacity = 0;
    
    this.rainLevels = {
      light: {
        speed: 0.00001,              
        sizeMultiplier: 0.8        
      },
      medium: {
        speed: 0.00002,              
        sizeMultiplier: 1.0        
      },
      heavy: {
        speed: 0.00004,            
        sizeMultiplier: 1.2      
      }
    };
    
    this.currentLevel = 'medium';   
    this.currentSpeed = this.rainLevels.medium.speed;  
    this.shrinkSpeed = 0.00002;     
    this.visible = false;
  }

  initPoints() {
    let points = [];
    let numPoints = 8;

    for (let i = 0; i < numPoints; i++) {
      let angle = TWO_PI * i / numPoints;
      let radiusX = 0.5 + random(-0.1, 0.1);
      let radiusY = 0.3 + random(-0.06, 0.06);
      points.push({angle, radiusX, radiusY});
    }

    points.push(points[0]);
    return points;
  }

  show() {
    this.visible = true;
    this.targetOpacity = 255;

    this.targetSizeRatio = this.baseSizeRatio * this.rainLevels[this.currentLevel].sizeMultiplier;
  }

  hide() {
    this.visible = false;
    this.targetOpacity = 0;
    this.targetSizeRatio = 0;
  }

  setRainLevel(level) {
    this.currentLevel = level;
    this.currentSpeed = this.rainLevels[level].speed;
    if (this.visible) {
      this.targetSizeRatio = this.baseSizeRatio * this.rainLevels[level].sizeMultiplier;
    }
  }

  update() {
    
    if (this.opacity < this.targetOpacity) {
      this.opacity = min(this.opacity + 5, this.targetOpacity);
    } else if (this.opacity > this.targetOpacity) {
      this.opacity = max(this.opacity - 5, this.targetOpacity);
    }

 
    if (this.currentSizeRatio < this.targetSizeRatio) {
      this.currentSizeRatio = min(
        this.currentSizeRatio + this.currentSpeed * deltaTime,
        this.targetSizeRatio
      );
    } else if (this.currentSizeRatio > this.targetSizeRatio) {
      this.currentSizeRatio = max(
        this.currentSizeRatio - this.shrinkSpeed * deltaTime,
        this.targetSizeRatio
      );
    }

    if (this.opacity < this.targetOpacity) {
      this.opacity = min(this.opacity + 5, this.targetOpacity);
    } else if (this.opacity > this.targetOpacity) {
      this.opacity = max(this.opacity - 5, this.targetOpacity);
    }

    if (this.currentSizeRatio < this.targetSizeRatio) {
      this.currentSizeRatio = min(
        this.currentSizeRatio + this.currentSpeed * deltaTime,
        this.targetSizeRatio
      );
    } else if (this.currentSizeRatio > this.targetSizeRatio) {
      this.currentSizeRatio = max(
        this.currentSizeRatio - this.shrinkSpeed * deltaTime,
        this.targetSizeRatio
      );
    }

    this.updateRipples();
  }

  setColorAlpha(baseColor, alpha) {
    return color(
      red(baseColor),
      green(baseColor),
      blue(baseColor),
      alpha
    );
  }

  isPointInShape(px, py, x, y, maxSizeX, maxSizeY) {
    let inside = false;
    let points = [];
    
    this.points.forEach(p => {
      let pointX = x + cos(p.angle) * p.radiusX * maxSizeX;
      let pointY = y + sin(p.angle) * p.radiusY * maxSizeY;
      points.push({x: pointX, y: pointY});
    });

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      let xi = points[i].x, yi = points[i].y;
      let xj = points[j].x, yj = points[j].y;
      
      let intersect = ((yi > py) != (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  }

  checkClick(mx, my) {
    if (this.opacity <= 0 || this.currentSizeRatio <= 0) return;

    let x = width * this.xRatio;
    let y = height * this.yRatio;
    let maxSizeX = width * this.currentSizeRatio;
    let maxSizeY = maxSizeX * 0.6;

    if (this.isPointInShape(mx, my, x, y, maxSizeX, maxSizeY)) {

      this.addRipple(mx - x, my - y);
      return true;
    }
    return false;
  }

  addRipple(rx, ry) {
    const newRipple = {
      x: rx,                    
      y: ry,                     
      size: 0,                 
      maxSize: width * this.currentSizeRatio * 1.2, 
      opacity: 255,             
      thickness: 2,             
      points: this.points.map(p => ({...p}))  
    };
    
    this.ripples.push(newRipple);
    
    if (this.ripples.length > this.maxRipples) {
      this.ripples.shift();
    }
    forestScene.waterSound.play();
  }

  updateRipples() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      let ripple = this.ripples[i];
      
      ripple.size += 3;

      ripple.opacity -= 4;

      ripple.thickness = max(0.5, ripple.thickness - 0.04);

      if (ripple.opacity <= 0 || ripple.size >= ripple.maxSize) {
        this.ripples.splice(i, 1);
      }
    }
  }

  draw() {
    this.update();
    
    if (this.opacity <= 0 || this.currentSizeRatio <= 0) return;

    push();
    let x = width * this.xRatio;
    let y = height * this.yRatio;
    let maxSizeX = width * this.currentSizeRatio;
    let maxSizeY = maxSizeX * 0.6;

    noStroke();

    let shadowColor = this.setColorAlpha(this.shadowBaseColor, this.opacity);
    let highlightColor = this.setColorAlpha(this.highlightBaseColor, this.opacity);
    let outerColor = this.setColorAlpha(this.outerBaseColor, this.opacity);
    let innerColor = this.setColorAlpha(this.innerBaseColor, this.opacity);

    fill(shadowColor);
    this.drawPuddle(x, y + maxSizeY * 0.05, maxSizeX, maxSizeY);

    fill(highlightColor);
    this.drawPuddle(x, y + maxSizeY * 0.03, maxSizeX, maxSizeY);

    fill(outerColor);
    this.drawPuddle(x, y, maxSizeX, maxSizeY);

    fill(innerColor);
    this.drawPuddle(x, y, maxSizeX * 0.7, maxSizeY * 0.5);

    noFill();
    for (let ripple of this.ripples) {
      push();
      translate(x + ripple.x, y + ripple.y); 
      
      stroke(255, ripple.opacity);
      strokeWeight(ripple.thickness);
      
      beginShape();
      for (let i = 0; i <= this.points.length; i++) {
        let p = this.points[i % this.points.length];

        let angle = p.angle;
        let radiusX = p.radiusX * ripple.size;
        let radiusY = p.radiusY * ripple.size;
        
        let waveOffset = sin(frameCount * 0.1 + angle * 2) * 5;
        
        let px = cos(angle) * (radiusX + waveOffset);
        let py = sin(angle) * (radiusY + waveOffset);
        curveVertex(px, py);
      }
      endShape(CLOSE);
      pop();
    }

    pop();
  }

  drawPuddle(x, y, maxSizeX, maxSizeY) {
    beginShape();
    curveVertex(
      x + cos(this.points[this.points.length - 2].angle) * this.points[this.points.length - 2].radiusX * maxSizeX, 
      y + sin(this.points[this.points.length - 2].angle) * this.points[this.points.length - 2].radiusY * maxSizeY
    );
    this.points.forEach(p => {
      let px = x + cos(p.angle) * p.radiusX * maxSizeX;
      let py = y + sin(p.angle) * p.radiusY * maxSizeY;
      curveVertex(px, py);
    });
    curveVertex(
      x + cos(this.points[1].angle) * this.points[1].radiusX * maxSizeX, 
      y + sin(this.points[1].angle) * this.points[1].radiusY * maxSizeY
    );
    endShape(CLOSE);
  }
}

class WaterSound {
  constructor(sounds) {
    this.sounds = sounds;
    this.currentSound = null;
  }

  play() {

    if (this.currentSound && this.currentSound.isPlaying()) {
      this.currentSound.stop();
    }

    this.currentSound = random(this.sounds);
    
    this.currentSound.setVolume(0.5);
    
    this.currentSound.play();
  }

  stop() {
    if (this.currentSound && this.currentSound.isPlaying()) {
      this.currentSound.stop();
    }
  }
}

class Lightning {
  constructor() {
    this.segments = [];
    this.isActive = false;
    this.opacity = 255;
    this.fadeSpeed = 10;
    this.lastLightningTime = 0;
    this.minInterval = 3000; 
    this.probability = 0.05;
  }

  checkTrigger() {
    if (!this.isActive && 
        millis() - this.lastLightningTime > this.minInterval && 
        random() < this.probability) {
      this.trigger();
    }
  }

  trigger() {
    this.isActive = true;
    this.opacity = 255;
    this.lastLightningTime = millis();
    
    let startX = random(width);
    let startY = random(height * 0.1, height * 0.3);
    
    this.generateSegments(startX, startY);

    forestScene.lightningSound.play();
  }

  generateSegments(startX, startY) {
    this.segments = [];
    let currentX = startX;
    let currentY = startY;
    let targetY = height * 0.7;
    
    while (currentY < targetY) {

      let nextY = currentY + random(30, 50);
      let nextX = currentX + random(-50, 50);
      
      this.segments.push({
        x1: currentX,
        y1: currentY,
        x2: nextX,
        y2: nextY
      });
      
      if (random() < 0.3) {
        let branchX = nextX + random(-40, 40);
        let branchY = nextY + random(20, 40);
        this.segments.push({
          x1: nextX,
          y1: nextY,
          x2: branchX,
          y2: branchY
        });
      }
      
      currentX = nextX;
      currentY = nextY;
    }
  }

  update() {
    if (this.isActive) {
      this.opacity -= this.fadeSpeed;
      if (this.opacity <= 0) {
        this.isActive = false;
      }
    }
  }

  draw() {
    if (!this.isActive) return;
    
    push();
    strokeWeight(3);
    stroke(255, 255, 255, this.opacity);
    for (let segment of this.segments) {
      line(segment.x1, segment.y1, segment.x2, segment.y2);
    }
    
    strokeWeight(6);
    stroke(255, 255, 255, this.opacity * 0.5);
    for (let segment of this.segments) {
      line(segment.x1, segment.y1, segment.x2, segment.y2);
    }
    
    pop();
  }
}

class LightningSound {
  constructor(sounds) {
    this.sounds = sounds;
    this.activeSounds = new Set();
  }

  play() {

    let sound = random(this.sounds);
    
    sound.setVolume(0.7);
    sound.rate(1 + random(-0.1, 0.1));
    
    this.activeSounds.add(sound);
    
    sound.play();
    
    sound.onended(() => {
      this.activeSounds.delete(sound);
    });
  }

  stop() {

    this.activeSounds.forEach(sound => {
      if (sound.isPlaying()) {
        sound.stop();
      }
    });
    this.activeSounds.clear();
  }
}

class ForestScene {
  constructor(windSounds, rainSound, waterSounds, lightingSounds) {
    this.sky = new Sky();
    this.coconutTrees = [
      new CoconutTree(0.8, 0.85, 5),
      new CoconutTree(0.2, 0.85, 5),
      new CoconutTree(0.5, 0.85, 6),
    ];
    this.ground = new Ground(
      '#E0EF7A',      // Hexadecimal color for the main arc
      '#E0EF7A88',    // Hexadecimal color for the additional arcs with transparency (88 at the end for alpha)
      width,          // Width of the arcs
      '#ABD039',      // Hexadecimal color for the ground
      0.1             // Noise increment
    );
    this.leftGrass = new ForegroundGrass('left', 1, '#57A15A', 255);
    this.rightGrass = new ForegroundGrass('right', 1, '#57A15A', 255);
    this.additionalGrasses = [
      new ForegroundGrass('left', 0.8, '#3E7C42', 200),
      new ForegroundGrass('right', 0.8, '#3E7C42', 200),
      new ForegroundGrass('left', 0.6, '#25582E', 150),
      new ForegroundGrass('right', 0.6, '#25582E', 150)
    ];

    this.stones = [
      new Stone(0.25, 0.85, 0.03),
      new Stone(0.29, 0.88, 0.04),
      new Stone(0.25, 0.90, 0.035)
    ];

    this.waterSound = new WaterSound(waterSounds);
    this.puddles = [
      new Puddle(0.65, 0.9, 0.18),
      new Puddle(0.4, 0.95, 0.1)
    ];

    this.bananaLeaves = [
      new BananaLeaf(0.9, 1.2, 0.13, PI), 
      new BananaLeaf(0.95, 1.25, 0.15, PI),
      new BananaLeaf(0.15, 1.3, 0.18, PI),
    ];
    this.lightningSound = new LightningSound(lightingSounds);
    this.lightning = new Lightning();
    this.rainSound = new RainSound(rainSound);
    this.rain = new Rain();
    this.windSound = new WindSound(windSounds);
    this.wind = new Wind();
    this.Winding = false;
    this.windDirection = 'right';
  }

  draw() {
    this.sky.draw();
    this.ground.draw();

    for (let puddle of this.puddles) {
      puddle.draw();
    }

    this.rain.update();
    this.rain.draw();
    this.wind.update();
    this.wind.draw();

    if (this.rain.isRaining && this.rain.currentLevel === 'heavy') {
      this.lightning.checkTrigger();
    }
    
    this.lightning.update();
    this.lightning.draw();

    this.coconutTrees.forEach(tree => tree.draw());

    for (let stone of this.stones) {
      stone.draw();
    }
    this.leftGrass.draw();
    this.rightGrass.draw();

    for (let leaf of this.bananaLeaves) {
      leaf.draw();
    }
    this.additionalGrasses.forEach(grass => grass.draw());
  }
  
    handleMousePressed() {
      for (let stone of this.stones) {
        stone.pressed(mouseX, mouseY);
      }

      for (let puddle of this.puddles) {
        puddle.checkClick(mouseX, mouseY);
      }
    }
  
    handleMouseDragged() {
      for (let stone of this.stones) {
        stone.dragged(mouseX, mouseY);
      }
    }
  
    handleMouseReleased() {
      for (let stone of this.stones) {
        stone.released();
      }
    }

  handleKeyPressed(key) {
    if (key === 'd' || key === 'D') {
      this.startWindInDirection('right');
    } else if (key === 'a' || key === 'A') {
      this.startWindInDirection('left');
    } else if (key === 's' || key === 'S') {
      if (!this.rain.isRaining) {
        this.startRain();
      } else {
        this.stopRain();
      }
    } else if (key === 'q' || key === 'Q') {
      if (this.rain.isRaining) {
        this.decreaseRainIntensity();
      }
    } else if (key === 'e' || key === 'E') {
      if (this.rain.isRaining) {
        this.increaseRainIntensity();
      }
    }
  }

  handleKeyReleased(key) {
    if ((key === 'a' || key === 'A' || key === 'd' || key === 'D') && this.Winding) {
      this.stopWind();
    }
  }
  handleMouseMove(mx, my) {
    this.coconutTrees.forEach(tree => tree.handleMouseMove(mx, my));
  }

  startWindInDirection(direction) {
    this.Winding = true;
    this.windDirection = direction;
    
    for (let leaf of this.bananaLeaves) {
      leaf.startSwaying(direction);
    }
    for (let tree of this.coconutTrees) {
      tree.startSwaying(direction);
    }
    this.wind.startWind(direction);
    this.windSound.play();
    if (this.rain.isRaining) {
      this.rain.setWindDirection(direction);
    }
  }

  stopWind() {
    this.Winding = false;
    for (let leaf of this.bananaLeaves) {
      leaf.stopSwaying();
    }
    for (let tree of this.coconutTrees) {
      tree.stopSwaying();
    }
    this.wind.stopWind();
    this.windSound.stop();
    if (this.rain.isRaining) {
      this.rain.setWindDirection('none');
    }
  }

  startRain() {
    this.rain.start();
    this.rainSound.play();
    this.sky.setRainState(true, this.rain.currentLevel);
    this.puddles.forEach(puddle => {
      puddle.show();
      puddle.setRainLevel(this.rain.currentLevel);
    });
  }

  stopRain() {
    this.rain.stop();
    this.rainSound.stop();
    this.sky.setRainState(false);
    this.puddles.forEach(puddle => puddle.hide());
    this.stones.forEach(stone => stone.reset());
  }

  increaseRainIntensity() {
    this.rain.changeIntensity('increase');
    this.rainSound.changeIntensity('increase');
    this.sky.setRainState(true, this.rain.currentLevel);
    this.puddles.forEach(puddle => puddle.setRainLevel(this.rain.currentLevel));
  }

  decreaseRainIntensity() {
    this.rain.changeIntensity('decrease');
    this.rainSound.changeIntensity('decrease');
    this.sky.setRainState(true, this.rain.currentLevel);
    this.puddles.forEach(puddle => puddle.setRainLevel(this.rain.currentLevel));
  }

  handleArControlMoveDirection(direction) {
    if (direction === "Left") {
      this.startWindInDirection('left');
    } else if (direction === "Right") {
      this.startWindInDirection('right');
    } else {
      this.stopWind();
    }
  }

  handleArControlFingerPosition(x, y, circleRadius) {
    const screenX = x * width;
    const screenY = y * height;
    
    // 生成圆圈内的采样点
    const numPoints = 4; // 每个方向的采样点数
    const stepSize = circleRadius / numPoints;

    for (let dx = -circleRadius; dx <= circleRadius; dx += stepSize) {
      for (let dy = -circleRadius; dy <= circleRadius; dy += stepSize) {
        // 检查点是否在圆内
        if (dx * dx + dy * dy <= circleRadius * circleRadius) {
          const pointX = screenX + dx;
          const pointY = screenY + dy;
          
          // 将圆内的每个点传递给所有树木
          this.coconutTrees.forEach(tree => {
            tree.handleMouseMove(pointX, pointY);
          });
        }
      }
    }
    this.coconutTrees.forEach(tree => {
      tree.handleMouseMove(screenX, screenY);
    });
  }

  handleArControlLipsStateDetected(lipsState) {
    this.decreaseRainIntensity();
    this.decreaseRainIntensity();
    if (lipsState === 'Closed') {
      this.stopRain();
    } else if (lipsState === 'Small') {
      this.startRain();
    } else if (lipsState === 'Medium') {
      this.startRain();
      this.increaseRainIntensity();
    } else if (lipsState === 'Large') {
      this.startRain();
      this.increaseRainIntensity();
      this.increaseRainIntensity();
    } else {
      this.stopRain();
    }
  }

}