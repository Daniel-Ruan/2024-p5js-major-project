// rainforest.js
class CoconutTree {
  constructor(xRatio, yRatio, numCoconuts = 4) {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.curve = random(-0.2, 0.2);
    this.numLeaves = 8; // 增加初始叶子数量，因为会过滤掉一些
    
    // 生成叶子并过滤掉底部的叶子
    this.leaves = [];

    // 椰子数量
    this.coconuts = [];

    this.swayAngle = 0; // 添加摆动角度
    this.swaying = false; // 是否在摆动
    this.swayDirection = ''; // 摆动方向
    this.swaySpeed = 0.1;        // 摇摆速度

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

    // 绘制树干
    this.drawTrunk();
    
    // 移动到树冠位置
    let trunkHeight = height * 0.35;
    let treeTopX = this.curve * width * 0.1;
    let treeTopY = -trunkHeight;
    translate(treeTopX, treeTopY);
    
    // 先绘制椰子
    for (let coconut of this.coconuts) {
      if (!coconut.isFalling) {
        coconut.draw(0, 0); // 相对于树冠顶部的位置
      }
    }
    
    // 再绘制棕榈叶
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
    
    // 先绘制较粗的底部
    strokeWeight(baseWidth * 1.1); // 底部宽度是基础宽度的1.5倍
    line(-baseWidth * 0.15, 0, baseWidth * 0.15, 0);
    
    // 绘制主干
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
    
    // 计算并绘制纹理
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
    let numTextures = 15;
    
    for(let i = 1; i < points.length - 1; i++) {
      let p = points[i];
      let angle = atan2(points[i+1].y - points[i-1].y, 
                       points[i+1].x - points[i-1].x);
      
      let t = i / (points.length - 1);
      // 调整纹理线长度，使底部更宽
      let lineLength = baseWidth * (1.2 - t * 0.4); // 增大底部纹理线长度
      
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
    
    // 叶片
    noStroke();
    fill(34, 139, 34, 200);
    
    beginShape();
    vertex(0, 0);
    
    // 使用更平滑的曲线创建叶片形状
    let points = [];
    for (let t = 0; t <= 1; t += 0.05) {
      let x = leafLength * t;
      // 使用改进的叶片轮廓函数
      let width = sin(t * PI) * leafWidth * (1 - t * 0.3);
      points.push({x: x, y: -width}); // 上半部分
    }
    
    // 绘制上半部分
    for (let p of points) {
      vertex(p.x, p.y);
    }
    
    // 绘制下半部分
    for (let p of points.reverse()) {
      vertex(p.x, -p.y);
    }
    
    endShape(CLOSE);
    
    // 主脉
    stroke(22, 109, 22, 200);
    strokeWeight(width * 0.003);
    line(0, 0, leafLength, 0);
    
    // 改进的叶脉纹理
    strokeWeight(width * 0.001);
    let numVeins = 20; // 增加脉络数量
    
    for(let i = 1; i < numVeins; i++) {
      let t = i / numVeins;
      let x = leafLength * t;
      let maxWidth = sin(t * PI) * leafWidth * (1 - t * 0.3);
      
      // 计算每条叶脉的长度，确保不会超出叶片边界
      let veinLength = maxWidth * 0.9; // 稍微短于叶片宽度
      let baseAngle = map(t, 0, 1, PI/3, PI/6); // 角度随着位置变化
      
      // 上部叶脉
      push();
      translate(x, 0);
      rotate(-baseAngle);
      // 使用二次曲线绘制叶脉
      beginShape();
      for(let v = 0; v <= 1; v += 0.1) {
        let vx = sin(v * PI/2) * veinLength * 0.2;
        let vy = -v * veinLength;
        vertex(vx, vy);
      }
      endShape();
      pop();
      
      // 下部叶脉
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
      
      // 添加次生叶脉
      if (i % 2 == 0) {
        let secondaryVeinLength = veinLength * 0.4;
        for (let j = 1; j < 3; j++) {
          // 上部次生叶脉
          push();
          translate(x, -veinLength * j/3);
          rotate(-baseAngle * 0.7);
          line(0, 0, secondaryVeinLength * 0.7, 0);
          pop();
          
          // 下部次生叶脉
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
      // 根据方向调整摇摆幅度
      if (this.swayDirection === 'right') {
        // 向右吹风时，向右摆动幅度更大
        this.swayAngle = PI/12 * sin(frameCount * this.swaySpeed) * 
          (sin(frameCount * this.swaySpeed) > 0 ? 1.5 : 0.5);
      } else {
        // 向左吹风时，向左摆动幅度更大
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
      if (!coconut.isFalling) {  // 只检查未掉落的椰子
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
    
    // 添加掉落相关属性
    this.isFalling = false;
    this.fallVelocity = 0;
    this.isHovered = false;
    this.gravity = 0.4;  // 减小重力加速度
    this.bounceVelocity = -8;  // 添加弹跳效果
    this.bounceCount = 0;  // 添加弹跳计数器
    this.maxBounces = Math.floor(Math.random() * 3) + 1;
  }

  checkHover(mx, my, treeTopX, treeTopY) {
    if (this.isFalling) return false;
    
    // 计算椰子在画布上的实际位置
    let coconutX = treeTopX + cos(this.angle) * (width * this.distanceRatio);
    let coconutY = treeTopY + sin(this.angle) * (width * this.distanceRatio);
    let size = width * this.sizeRatio;
  
    // 存储初始掉落位置
    if (!this.isFalling) {
      this.fallX = coconutX;
      this.fallY = coconutY;
    }
  
    // 检查鼠标是否在椰子范围内
    let d = dist(mx, my, coconutX, coconutY);
    this.isHovered = d < size *1.1; // 增大检测范围
  
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
      
      // 碰到地面时弹跳
      if (this.fallY > height * 0.9) {
        this.fallY = height * 0.9;  // 确保椰子不会穿过地面
        if (Math.abs(this.fallVelocity) > 1 && this.bounceCount < this.maxBounces) {
          this.fallVelocity = this.bounceVelocity * 0.6;  // 减少弹跳高度
          this.bounceCount++;  // 增加弹跳计数
        } else {
          this.fallVelocity = 0;
        }
      }
    }
  }

  draw(treeTopX, treeTopY) {
    push();
    if (!this.isFalling) {
      // 正常绘制在树上的椰子
      translate(treeTopX, treeTopY);
      rotate(this.angle);
      translate(width * this.distanceRatio, 0);
    } else {
      // 绘制掉落中的椰子
      translate(treeTopX, this.fallY);
      rotate(this.angle);
      translate(width * this.distanceRatio, 0);
    }
    
    let size = width * this.sizeRatio;
    
    // 椰子阴影
    noStroke();
    fill(81, 47, 13, 50);
    ellipse(size * 0.1, size * 0.1, size, size);
    
    // 椰子本体
    fill(this.isHovered ? color(121, 87, 53) : color(101, 67, 33));
    ellipse(0, 0, size, size);
    
    // 椰子纹理
    stroke(81, 47, 13, 100);
    strokeWeight(size * 0.05);
    noFill();
    arc(0, 0, size * 0.7, size * 0.7, PI/6, PI/2);
    arc(0, 0, size * 0.6, size * 0.6, -PI/2, -PI/6);
    
    // 椰子高光
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
    this.currentRainLevel = 'medium';  // 跟踪雨量等级
    
    // 定义晴天和雨天的颜色
    this.colors = {
      sunny: {
        top: color('#46B5BB'),
        bottom: color('#70C1A4')
      },
      rain: {
        light: {
          top: color('#3A95A0'),    // 较浅的阴天颜色
          bottom: color('#5DA088')
        },
        medium: {
          top: color('#2D7A85'),    // 中等的阴天颜色
          bottom: color('#4A806D')
        },
        heavy: {
          top: color('#1F5F6A'),    // 最深的阴天颜色
          bottom: color('#375F52')
        }
      }
    };
  }

  // 设置下雨状态
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

      // 根据是否下雨选择颜色
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
    this.lastXRatio = this.xRatio; // 记录最后一次拖拽位置
    this.lastYRatio = this.yRatio;
    this.sizeRatio = sizeRatio;
    this.dragging = false;
    this.x = width * this.xRatio;
    this.y = height * this.yRatio;
    this.offsetX = 0;
    this.offsetY = 0;
    this.opacity = 255;  // 添加透明度属性
    this.fadeSpeed = 10; // 淡出速度
    this.active = true; // 添加状态标记
  }

  reset() {
    if (!this.active) {
      // 重置所有状态到初始值
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

    if (!this.active) return; // 如果不活跃就不绘制

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
      this.active = false; // 完全透明时标记为不活跃
      return;
    }

    push();
    noStroke();
    
    // 如果不在拖拽状态，根据窗口大小更新位置
    if (!this.dragging) {
      this.x = width * this.xRatio;
      this.y = height * this.yRatio;
    }
    
    // 大小始终根据窗口宽度计算
    let size = width * this.sizeRatio;
    let depth = size * 0.3;
    
    // 根据拖拽状态设置基础颜色
    let baseColor = this.dragging ? color(180) : color(120);
    
    // 绘制顶面 (最亮)
    fill(red(baseColor) + 40, green(baseColor) + 40, blue(baseColor) + 40, this.opacity);
    quad(
      this.x, this.y,
      this.x + size, this.y,
      this.x + size - depth, this.y - depth,
      this.x - depth, this.y - depth
    );
    
    
    // 绘制右侧面 (较暗)
    fill(red(baseColor) - 20, green(baseColor) - 20, blue(baseColor) - 20, this.opacity);
    quad(
      this.x + size, this.y,
      this.x + size - depth, this.y - depth,
      this.x + size - depth, this.y + size - depth,
      this.x + size, this.y + size
    );

    // 绘制左侧面 (中等暗度)
    fill(red(baseColor) - 10, green(baseColor) - 10, blue(baseColor) - 10, this.opacity);
    quad(
      this.x, this.y,
      this.x - depth, this.y - depth,
      this.x - depth, this.y + size - depth,
      this.x, this.y + size
    );
    
    // 绘制正面 (使用基础颜色)
    fill(red(baseColor), green(baseColor), blue(baseColor), this.opacity);  // 修复这里
    rect(this.x, this.y, size, size);  // 删除了错误的opacity参数
    
    pop();
  }

  fadeOut() {
    this.opacity = max(0, this.opacity - this.fadeSpeed);
    this.dragging = false; // 确保石头不能再被拖动
  }

  checkPuddleCollision(puddle) {
    if (this.opacity <= 0 || puddle.opacity <= 0) return false;

    let size = width * this.sizeRatio;
    let puddleX = width * puddle.xRatio;
    let puddleY = height * puddle.yRatio;
    let maxSizeX = width * puddle.currentSizeRatio;
    let maxSizeY = maxSizeX * 0.6;

    // 检查石头的四个角是否在水潭内
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
    // 更新比例以反映新位置
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
    this.maxLines = 5;  // 同时显示的风线条数量
    this.isBlowing = false;
    this.direction = 'right';
  }

  startWind(direction) {
    this.isBlowing = true;
    this.direction = direction;
    this.lines = [];  // 清除现有的风线，避免方向突变
  }

  stopWind() {
    this.isBlowing = false;
    this.lines = [];  // 清除所有风线
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
      // 添加倾斜角度 (-3到+3度)
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
        // 添加斜率影响
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
  constructor() {
    this.sounds = [];
    this.currentSound = null;
    this.isPlaying = false;
    this.fadeTime = 0.5; // 淡入淡出时间（秒）
    
    // 在setup中加载音频文件
    this.loadSounds();
  }

  loadSounds() {
    // 加载两个音频文件
    this.sounds.push(loadSound('assets/wind1.mp3'));
    this.sounds.push(loadSound('assets/wind2.mp3'));

    // 为每个音频设置结束时的回调
    this.sounds.forEach(sound => {
      sound.onended(() => {
        if (this.isPlaying) {
          this.playRandomSound();
        }
      });
    });
  }

  playRandomSound() {
    // 随机选择一个音频文件
    this.currentSound = random(this.sounds);
    // 设置音量并播放
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

    this.groundYMin = height * 0.8;  // 最低落点
    this.groundYMax = height * 0.85; // 最高落点

    this.windAngle = 0;          // 当前风向角度
    this.targetWindAngle = 0;    // 目标风向角度
    this.windTransitionSpeed = 0.1; // 风向变化的平滑过渡速度
    
    // 定义三个雨量等级的参数
    this.rainLevels = {
      light: {
        intensity: 50,
        length: [8, 15],
        speed: [8, 12],
        thickness: [0.8, 1.5],
        splashParticles: [2, 4],
        // 小雨：更透明、更浅的颜色
        color: {
          r: 220,
          g: 220,
          b: 255,
          alphaRange: [100, 150]  // 更透明
        }
      },
      medium: {
        intensity: 100,
        length: [10, 20],
        speed: [10, 15],
        thickness: [1, 2],
        splashParticles: [3, 6],
        // 中雨：标准的雨水颜色
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
        // 大雨：较深、较浑浊的颜色
        color: {
          r: 180,
          g: 180,
          b: 255,
          alphaRange: [200, 255]  // 更不透明
        }
      }
    };
    
    // 默认为中雨
    this.currentLevel = 'medium';
    this.currentParams = this.rainLevels.medium;
  }

  setWindDirection(direction) {
    if (direction === 'left') {
      // 随机生成向左的角度 (-10 到 0 度)
      this.targetWindAngle = random(-20, 0);
    } else if (direction === 'right') {
      // 随机生成向右的角度 (0 到 10 度)
      this.targetWindAngle = random(0, 20);
    } else {
      // 无风时回到垂直状态
      this.targetWindAngle = 0;
    }
  }

  // 切换雨量等级
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
    
    // 如果正在下雨，更新雨滴
    if (this.isRaining) {
      this.updateRaindrops();
    }
  }

  // 更新现有雨滴以匹配新的强度
  updateRaindrops() {
    // 调整雨滴数量
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

    // 平滑过渡到目标角度
    this.windAngle = lerp(this.windAngle, this.targetWindAngle, this.windTransitionSpeed);

    // 随窗口大小更新落点范围
    this.groundYMin = height * 0.85;
    this.groundYMax = height * 0.95;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      let drop = this.drops[i];
      
      // 根据风向角度计算x方向的位移
      let angleInRadians = radians(this.windAngle);
      drop.x += drop.speed * sin(angleInRadians);
      drop.y += drop.speed * cos(angleInRadians);

      // 当雨滴到达随机的地面高度时
      let groundY = random(this.groundYMin, this.groundYMax);
      if (drop.y > groundY) {
        this.createSplash(drop.x, groundY);
        this.drops.splice(i, 1);
        if (this.isRaining) {
          this.createDrop();
        }
      }
    }

    // 更新飞溅效果
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      let splash = this.splashes[i];
      // 给飞溅效果也添加风向影响
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
    
    // 绘制雨滴
    for (let drop of this.drops) {
      push();
      // 移动到雨滴顶部位置
      translate(drop.x, drop.y);
      
      stroke(color.r, color.g, color.b, drop.opacity);
      strokeWeight(drop.thickness);
      
      // 计算底部偏移量
      let bottomOffsetX = drop.length * sin(radians(this.windAngle));
      // 从顶部(0,0)画到偏移后的底部位置
      line(0, 0, bottomOffsetX, drop.length);
      
      pop();
    }

    // 绘制飞溅效果
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
    
    // 定义不同雨量级别的音频参数
    this.rainLevels = {
      light: {
        volume: 0.3,     // 小雨音量较小
        speed: 0.8       // 播放速度较慢
      },
      medium: {
        volume: 0.5,     // 中雨正常音量
        speed: 1.0       // 正常播放速度
      },
      heavy: {
        volume: 0.8,     // 大雨音量较大
        speed: 1.2       // 播放速度较快
      }
    };
    
    // 默认为中雨状态
    this.currentLevel = 'medium';
    this.sound.setLoop(true);
    this.updateSoundParameters();
  }

  updateSoundParameters() {
    const params = this.rainLevels[this.currentLevel];
    this.sound.setVolume(params.volume);
    this.sound.rate(params.speed);
  }

  // 改变雨量等级
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
    this.baseAngle = baseAngle;  // 存储基础旋转角度
    this.angle = this.baseAngle + random(-PI/12, PI/6);  // 将基础角度与随机角度相加
    this.curveVariation = random(0.8, 1.2);
    
    this.swayAngle = 0;          // 当前摇摆角度
    this.swaySpeed = 0.1;        // 摇摆速度
    this.swaying = false;        // 是否正在摇摆
    this.startAngle = this.angle; // 记录开始摇摆时的角度
    this.swayDirection = 'right';  // 添加摇摆方向属性
  }

    // 添加开始摇摆的方法
    startSwaying(direction) {
      this.swaying = true;
      this.swayDirection = direction;
      this.startAngle = this.angle;
    }
  
    // 添加停止摇摆的方法
    stopSwaying() {
      this.swaying = false;
      this.swayAngle = 0;
      this.angle = this.startAngle;
    }
  
    // 更新摇摆状态
    update() {
      if (this.swaying) {
        // 根据方向调整摇摆幅度
        if (this.swayDirection === 'right') {
          // 向右吹风时，向右摆动幅度更大
          this.swayAngle = PI/12 * sin(frameCount * this.swaySpeed) * 
            (sin(frameCount * this.swaySpeed) > 0 ? 1.5 : 0.5);
        } else {
          // 向左吹风时，向左摆动幅度更大
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
      let mainVeinLength = size * 0.95;  // 提前计算主脉长度
      
      translate(x, y);
      translate(0, -mainVeinLength);  // 先将原点移到主脉的顶端
      rotate(this.angle);  // 然后再旋转
      translate(0, mainVeinLength);  // 将原点移回来
      
      // 设置叶子颜色
      let leafColor = color(34, 139, 34);
      fill(leafColor);
      noStroke();
      
      // 绘制叶片主体
      beginShape();
      vertex(0, 0);
      
      // 左半边叶片
      for (let t = 0; t <= 1; t += 0.1) {
        let px = -size * 0.33 * sin(t * PI);
        let py = -size * t * this.curveVariation;
        curveVertex(px, py);
      }
      
      // 叶尖
      vertex(0, -size);
      
      // 右半边叶片
      for (let t = 1; t >= 0; t -= 0.1) {
        let px = size * 0.33 * sin(t * PI);
        let py = -size * t * this.curveVariation;
        curveVertex(px, py);
      }
      
      endShape(CLOSE);
      
      // 绘制叶脉
      stroke(leafColor.levels[0] - 20, leafColor.levels[1] - 20, leafColor.levels[2] - 20);
      strokeWeight(size * 0.02);
      
      // 主脉
      line(0, 0, 0, -mainVeinLength);
      
      // 侧脉
      let numVeins = 8;
      for (let i = 1; i < numVeins; i++) {
        let t = i / numVeins;
        let y = -mainVeinLength * t;
        let leftX = -size * 0.3 * sin(t * PI);
        let rightX = size * 0.3 * sin(t * PI);
        
        // 左侧脉
        push();
        translate(0, y);
        rotate(-PI/4 * t);
        line(0, 0, leftX * 0.7, 0);
        pop();
        
        // 右侧脉
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
    this.baseSizeRatio = sizeRatio;  // 基础尺寸（中雨时的尺寸）
    this.currentSizeRatio = 0;      // 当前尺寸
    this.targetSizeRatio = 0;       // 目标尺寸
    this.ripples = [];
    this.maxRipples = 3;  // 同时存在的最大波纹数

    this.pathPoints = [];
    
    // 存储基础颜色
    this.outerBaseColor = color('#A7D9F7');
    this.innerBaseColor = color('#B7E3F7');
    this.highlightBaseColor = color('#DDEBEE');
    this.shadowBaseColor = color('#77C1F7');
    
    this.points = this.initPoints();
    
    // 透明度相关属性
    this.opacity = 0;
    this.targetOpacity = 0;
    
    // 不同雨量等级对应的属性
    this.rainLevels = {
      light: {
        speed: 0.00001,              // 小雨时增长速度慢
        sizeMultiplier: 0.8        // 小雨时最大尺寸为基础尺寸的80%
      },
      medium: {
        speed: 0.00002,              // 中雨时增长速度中等
        sizeMultiplier: 1.0        // 中雨时为基础尺寸
      },
      heavy: {
        speed: 0.00004,              // 大雨时增长速度快
        sizeMultiplier: 1.2        // 大雨时最大尺寸为基础尺寸的120%
      }
    };
    
    this.currentLevel = 'medium';   // 当前雨量等级
    this.currentSpeed = this.rainLevels.medium.speed;  // 当前生长速度
    this.shrinkSpeed = 0.00002;      // 消失速度统一
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
    // 设置目标尺寸为当前雨量等级对应的尺寸
    this.targetSizeRatio = this.baseSizeRatio * this.rainLevels[this.currentLevel].sizeMultiplier;
  }

  hide() {
    this.visible = false;
    this.targetOpacity = 0;
    this.targetSizeRatio = 0;
  }

  // 设置雨量等级，同时更新生长速度和目标尺寸
  setRainLevel(level) {
    this.currentLevel = level;
    this.currentSpeed = this.rainLevels[level].speed;
    if (this.visible) {
      this.targetSizeRatio = this.baseSizeRatio * this.rainLevels[level].sizeMultiplier;
    }
  }

  update() {
    // 更新透明度
    if (this.opacity < this.targetOpacity) {
      this.opacity = min(this.opacity + 5, this.targetOpacity);
    } else if (this.opacity > this.targetOpacity) {
      this.opacity = max(this.opacity - 5, this.targetOpacity);
    }

    // 更新尺寸
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
    
    // 生成实际的路径点
    this.points.forEach(p => {
      let pointX = x + cos(p.angle) * p.radiusX * maxSizeX;
      let pointY = y + sin(p.angle) * p.radiusY * maxSizeY;
      points.push({x: pointX, y: pointY});
    });

    // 射线法检测点是否在多边形内
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
      // 将点击坐标转换为相对于水潭中心的坐标
      this.addRipple(mx - x, my - y);
      return true;
    }
    return false;
  }

  addRipple(rx, ry) {
    const newRipple = {
      x: rx,                     // 波纹中心点x（相对于水潭中心）
      y: ry,                     // 波纹中心点y（相对于水潭中心）
      size: 0,                   // 初始大小
      maxSize: width * this.currentSizeRatio * 1.2,  // 最大扩散尺寸
      opacity: 255,              // 初始透明度
      thickness: 2,              // 波纹线条粗细
      points: this.points.map(p => ({...p}))  // 复制形状点
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
      
      // 扩大尺寸
      ripple.size += 3;
      // 减小透明度
      ripple.opacity -= 4;
      // 减小线条粗细
      ripple.thickness = max(0.5, ripple.thickness - 0.04);

      // 当波纹完全消失或达到最大尺寸时移除
      if (ripple.opacity <= 0 || ripple.size >= ripple.maxSize) {
        this.ripples.splice(i, 1);
      }
    }
  }

  draw() {
    this.update();
    
    // 如果完全透明或尺寸为0则不绘制
    if (this.opacity <= 0 || this.currentSizeRatio <= 0) return;

    push();
    let x = width * this.xRatio;
    let y = height * this.yRatio;
    let maxSizeX = width * this.currentSizeRatio;
    let maxSizeY = maxSizeX * 0.6;

    noStroke();

    // 使用当前透明度创建颜色
    let shadowColor = this.setColorAlpha(this.shadowBaseColor, this.opacity);
    let highlightColor = this.setColorAlpha(this.highlightBaseColor, this.opacity);
    let outerColor = this.setColorAlpha(this.outerBaseColor, this.opacity);
    let innerColor = this.setColorAlpha(this.innerBaseColor, this.opacity);

    // 阴影层
    fill(shadowColor);
    this.drawPuddle(x, y + maxSizeY * 0.05, maxSizeX, maxSizeY);

    // 高光层
    fill(highlightColor);
    this.drawPuddle(x, y + maxSizeY * 0.03, maxSizeX, maxSizeY);

    // 外层
    fill(outerColor);
    this.drawPuddle(x, y, maxSizeX, maxSizeY);

    // 内层
    fill(innerColor);
    this.drawPuddle(x, y, maxSizeX * 0.7, maxSizeY * 0.5);

    // 绘制波纹
    noFill();
    for (let ripple of this.ripples) {
      push();
      translate(x + ripple.x, y + ripple.y);  // 移动到波纹中心点
      
      // 绘制扭曲的波纹
      stroke(255, ripple.opacity);
      strokeWeight(ripple.thickness);
      
      beginShape();
      for (let i = 0; i <= this.points.length; i++) {
        let p = this.points[i % this.points.length];
        // 根据到中心点的距离计算波纹效果
        let angle = p.angle;
        let radiusX = p.radiusX * ripple.size;
        let radiusY = p.radiusY * ripple.size;
        
        // 添加一些波动效果
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
    // 如果当前有声音在播放，先停止
    if (this.currentSound && this.currentSound.isPlaying()) {
      this.currentSound.stop();
    }

    // 随机选择一个声音
    this.currentSound = random(this.sounds);
    
    // 设置音量
    this.currentSound.setVolume(0.5);
    
    // 播放声音
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
    this.minInterval = 3000;  // 两次闪电最小间隔(毫秒)
    this.probability = 0.05; // 每帧触发概率 (0.5%)
  }

  // 检查是否应该触发闪电
  checkTrigger() {
    if (!this.isActive && 
        millis() - this.lastLightningTime > this.minInterval && 
        random() < this.probability) {
      this.trigger();
    }
  }

  // 触发闪电
  trigger() {
    this.isActive = true;
    this.opacity = 255;
    this.lastLightningTime = millis();
    
    // 随机起点(在天空上部)
    let startX = random(width);
    let startY = random(height * 0.1, height * 0.3);
    
    // 生成闪电段
    this.generateSegments(startX, startY);

    forestScene.lightningSound.play();
  }

  // 生成闪电段
  generateSegments(startX, startY) {
    this.segments = [];
    let currentX = startX;
    let currentY = startY;
    let targetY = height * 0.7; // 闪电结束的大致高度
    
    while (currentY < targetY) {
      // 下一个点的位置
      let nextY = currentY + random(30, 50);
      let nextX = currentX + random(-50, 50);
      
      // 主干
      this.segments.push({
        x1: currentX,
        y1: currentY,
        x2: nextX,
        y2: nextY
      });
      
      // 30%概率生成分支
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
      // 逐渐降低不透明度
      this.opacity -= this.fadeSpeed;
      if (this.opacity <= 0) {
        this.isActive = false;
      }
    }
  }

  draw() {
    if (!this.isActive) return;
    
    push();
    // 闪电的主体
    strokeWeight(3);
    stroke(255, 255, 255, this.opacity);
    for (let segment of this.segments) {
      line(segment.x1, segment.y1, segment.x2, segment.y2);
    }
    
    // 发光效果
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
    this.activeSounds = new Set(); // 使用 Set 来跟踪当前正在播放的声音
  }

  play() {
    // 随机选择一个声音
    let sound = random(this.sounds);
    
    // 设置音量和播放速度
    sound.setVolume(0.7);
    sound.rate(1 + random(-0.1, 0.1)); // 添加一些随机变化
    
    // 添加到活动声音集合中
    this.activeSounds.add(sound);
    
    // 播放声音
    sound.play();
    
    // 设置播放完成的回调
    sound.onended(() => {
      this.activeSounds.delete(sound);
    });
  }

  stop() {
    // 停止所有正在播放的声音
    this.activeSounds.forEach(sound => {
      if (sound.isPlaying()) {
        sound.stop();
      }
    });
    this.activeSounds.clear();
  }
}

class ForestScene {
  constructor() {
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
      new BananaLeaf(0.9, 1.2, 0.13, PI),  // 添加PI（180度）作为基础旋转角度
      new BananaLeaf(0.95, 1.25, 0.15, PI),
      new BananaLeaf(0.15, 1.3, 0.18, PI),
    ];
    this.lightningSound = new LightningSound(lightingSounds);
    this.lightning = new Lightning();
    this.rainSound = new RainSound(rainSound);
    this.rain = new Rain();
    this.windSound = new WindSound();
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
  

    // 处理鼠标按下事件
    handleMousePressed() {
      for (let stone of this.stones) {
        stone.pressed(mouseX, mouseY);
      }

      for (let puddle of this.puddles) {
        puddle.checkClick(mouseX, mouseY);
      }
    }
  
    // 处理鼠标拖动事件
    handleMouseDragged() {
      for (let stone of this.stones) {
        stone.dragged(mouseX, mouseY);
      }
    }
  
    // 处理鼠标释放事件
    handleMouseReleased() {
      for (let stone of this.stones) {
        stone.released();
      }
    }

      // 添加处理按键的方法
  handleKeyPressed(key) {
    if (key === 'd' || key === 'D') {
      this.Winding = true;
      this.windDirection = 'right';
      for (let leaf of this.bananaLeaves) {
        leaf.startSwaying('right');
      }
      for (let tree of this.coconutTrees) {
        tree.startSwaying('right');
      }
      this.wind.startWind('right');
      this.windSound.play();
      if (this.rain.isRaining) {
        this.rain.setWindDirection('right');
      }
    } else if (key === 'a' || key === 'A') {
      this.Winding = true;
      this.windDirection = 'left';
      for (let leaf of this.bananaLeaves) {
        leaf.startSwaying('left');
      }
      for (let tree of this.coconutTrees) {
        tree.startSwaying('left');
      }
      this.wind.startWind('left');
      this.windSound.play();
      if (this.rain.isRaining) {
        this.rain.setWindDirection('left');
      }
    } else if (key === 's' || key === 'S') {
      if (!this.rain.isRaining) {
        this.rain.start();
        this.rainSound.play();
        this.sky.setRainState(true, this.rain.currentLevel);
        this.puddles.forEach(puddle => {
          puddle.show();
          puddle.setRainLevel(this.rain.currentLevel);
        });
      } else {
        this.rain.stop();
        this.rainSound.stop();
        this.sky.setRainState(false);
        this.puddles.forEach(puddle => puddle.hide());
        this.stones.forEach(stone => stone.reset());
      }
    } else if (key === 'q' || key === 'Q') {
      if (this.rain.isRaining) {
        this.rain.changeIntensity('decrease');
        this.rainSound.changeIntensity('decrease');
        this.sky.setRainState(true, this.rain.currentLevel);
        this.puddles.forEach(puddle => puddle.setRainLevel(this.rain.currentLevel));
      }
    } else if (key === 'e' || key === 'E') {
      if (this.rain.isRaining) {
        this.rain.changeIntensity('increase');
        this.rainSound.changeIntensity('increase');
        this.sky.setRainState(true, this.rain.currentLevel);
        this.puddles.forEach(puddle => puddle.setRainLevel(this.rain.currentLevel));
      }
    }
  }

  handleKeyReleased(key) {
    if ((key === 'a' || key === 'A' || key === 'd' || key === 'D') && this.Winding) {
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
  }
  handleMouseMove(mx, my) {
    this.coconutTrees.forEach(tree => tree.handleMouseMove(mx, my));
  }
}