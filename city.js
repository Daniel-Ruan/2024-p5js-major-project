// city.js
const PEDESTRIAN_CONFIG = {
  // 不同路线的配置
  routes: {
    bottom: {
      left: {
        yRatio: 0.58,
        lightCheckPosition: 0.68
      },
      right: {
        yRatio: 0.66,
        lightCheckPosition: 0.32
      },
      // 该路线特定的尺寸配置
      size: {
        width: 0.030,
        height: 0.050
      },
      // 该路线特定的人群配置
      crowd: {
        maxPedestrians: 15
      }
    },
    
    // 另一条路线的示例（可以有不同的尺寸和人群配置）
    top: {
      left: {
        yRatio: 0.33,
        lightCheckPosition: 0.58
      },
      right: {
        yRatio: 0.35,
        lightCheckPosition: 0.40
      },
      // 较窄街道的行人可以设置得更小
      size: {
        width: 0.025,
        height: 0.040
      },
      // 较窄街道可以设置更少的行人
      crowd: {
        maxPedestrians: 10
      }
    },
  },
  
  // 全局默认值（当路线没有指定特定配置时使用）
  defaults: {
    route: 'mainStreet',
    size: {
      width: 0.030,
      height: 0.050
    },
    crowd: {
      maxPedestrians: 15
    }
  }
};

class CitySky {
  constructor() {
    this.timeProgress = 0;
    
    this.skyColors = {
      day: {
        top: color(100, 180, 255),    
        bottom: color(180, 220, 255)  
      },
      dusk: {
        top: color(255, 140, 100),   
        bottom: color(255, 200, 150)  
      },
      night: {
        top: color(20, 20, 50),       
        bottom: color(40, 40, 80)      
      }
    };
    
    this.currentColors = {
      top: this.skyColors.day.top,
      bottom: this.skyColors.day.bottom
    };
    
    this.targetColors = {
      top: this.skyColors.day.top,
      bottom: this.skyColors.day.bottom
    };
    
    this.settings = {
      dayDuration: 15,         
      transitionDuration: 4,   
      fps: 60                 
    };
    
    this.phaseDuration = this.settings.dayDuration * this.settings.fps;
    this.transitionDuration = this.settings.transitionDuration * this.settings.fps;
  }

  getCurrentPhase() {
    let phase = this.timeProgress % 3; // 0: 白天, 1: 黄昏, 2: 夜晚
    if (phase < 1) {
      return 'day';
    } else if (phase < 2) {
      return 'dusk';
    } else {
      return 'night';
    }
  }

  update() {

    let progressPerFrame = 1 / this.phaseDuration;
    this.timeProgress += progressPerFrame;
    
    let phase = this.timeProgress % 3; // 0: 白天, 1: 黄昏, 2: 夜晚

    if (phase < 1) {
      this.targetColors = this.skyColors.day;
    } else if (phase < 2) {
      this.targetColors = this.skyColors.dusk;
    } else {
      this.targetColors = this.skyColors.night;
    }

    let transitionSpeed = 1 / this.transitionDuration;
    
    this.currentColors.top = this.lerpColor(
      this.currentColors.top, 
      this.targetColors.top, 
      transitionSpeed
    );
    
    this.currentColors.bottom = this.lerpColor(
      this.currentColors.bottom, 
      this.targetColors.bottom, 
      transitionSpeed
    );
  }

  draw() {
    push();
    noStroke();
    
    for (let y = 0; y <= height; y++) {

      let inter = map(y, 0, height, 0, 1);
      let c = lerpColor(
        this.currentColors.top,
        this.currentColors.bottom,
        inter
      );
      
      stroke(c);
      line(0, y, width, y);
    }
    pop();
  }

  lerpColor(c1, c2, amount) {
    let r1 = red(c1);
    let g1 = green(c1);
    let b1 = blue(c1);
    
    let r2 = red(c2);
    let g2 = green(c2);
    let b2 = blue(c2);
    
    return color(
      r1 + (r2 - r1) * amount,
      g1 + (g2 - g1) * amount,
      b1 + (b2 - b1) * amount
    );
  }
}

class Road {
  constructor() {

    this.settings = {
      horizontalRoadRatio: 0.15,
      verticalRoadBaseRatio: 0.50,
      verticalRoadTopRatio: 0.10,
      horizonLineRatio: 0.25,
      stripeWidth: 0.01,
      stripeLength: 0.05,
      stripeGap: 0.05
    };

    this.dayColors = {
      road: color(50),
      stripe: color(255),
      edge: color(80),
      ground: color('#FDF9CC')
    };

    this.nightColors = {
      road: color(30),              
      stripe: color(200),          
      edge: color(40),              
      ground: color('#A3A088')      
    };

    this.currentColors = {
      road: this.dayColors.road,
      stripe: this.dayColors.stripe,
      edge: this.dayColors.edge,
      ground: this.dayColors.ground
    };

    this.targetColors = {
      road: this.dayColors.road,
      stripe: this.dayColors.stripe,
      edge: this.dayColors.edge,
      ground: this.dayColors.ground
    };

    this.transitionSpeed = 0.05;
  }

  update(phase) {

    if (phase === 'night') {
      this.targetColors = this.nightColors;
    } else {
      this.targetColors = this.dayColors;
    }

    for (let key in this.currentColors) {
      this.currentColors[key] = this.lerpColor(
        this.currentColors[key],
        this.targetColors[key],
        this.transitionSpeed
      );
    }
  }

  lerpColor(c1, c2, amount) {
    let r1 = red(c1);
    let g1 = green(c1);
    let b1 = blue(c1);
    let a1 = alpha(c1);
    
    let r2 = red(c2);
    let g2 = green(c2);
    let b2 = blue(c2);
    let a2 = alpha(c2);
    
    return color(
      r1 + (r2 - r1) * amount,
      g1 + (g2 - g1) * amount,
      b1 + (b2 - b1) * amount,
      a1 + (a2 - a1) * amount
    );
  }

  draw() {
    this.drawGround();
    this.drawRoad();
  }

  drawGround() {
    let horizonY = height * this.settings.horizonLineRatio;
    
    push();
    noStroke();
    fill(this.currentColors.ground);
    rect(0, horizonY, width, height - horizonY);
    pop();
  }

  drawRoad() {

    let horizonY = height * this.settings.horizonLineRatio;
    let roadHeight = height * this.settings.horizontalRoadRatio;
    let horizontalY = height / 2;
    let halfRoadHeight = roadHeight / 2;
    
    let bottomWidth = width * this.settings.verticalRoadBaseRatio;
    let topWidth = width * this.settings.verticalRoadTopRatio;
    let centerX = width / 2;

    let lowerLeftIntersectX = centerX - map(horizontalY + halfRoadHeight, height, horizonY, bottomWidth/2, topWidth/2);
    let lowerRightIntersectX = centerX + map(horizontalY + halfRoadHeight, height, horizonY, bottomWidth/2, topWidth/2);
    let upperLeftIntersectX = centerX - map(horizontalY - halfRoadHeight, height, horizonY, bottomWidth/2, topWidth/2);
    let upperRightIntersectX = centerX + map(horizontalY - halfRoadHeight, height, horizonY, bottomWidth/2, topWidth/2);

    push();
    noStroke();
    fill(this.currentColors.road);
    
    beginShape();
    vertex(centerX - bottomWidth/2, height);
    vertex(lowerLeftIntersectX, horizontalY + halfRoadHeight);
    vertex(0, horizontalY + halfRoadHeight);
    vertex(0, horizontalY - halfRoadHeight);
    vertex(upperLeftIntersectX, horizontalY - halfRoadHeight);
    vertex(centerX - topWidth/2, horizonY);
    vertex(centerX + topWidth/2, horizonY);
    vertex(upperRightIntersectX, horizontalY - halfRoadHeight);
    vertex(width, horizontalY - halfRoadHeight);
    vertex(width, horizontalY + halfRoadHeight);
    vertex(lowerRightIntersectX, horizontalY + halfRoadHeight);
    vertex(centerX + bottomWidth/2, height);
    endShape(CLOSE);
    pop();

    push();
    stroke(this.currentColors.edge);
    strokeWeight(2);
    
    line(centerX - bottomWidth/2, height, centerX - topWidth/2, horizonY);
    line(centerX + bottomWidth/2, height, centerX + topWidth/2, horizonY);
    
    line(0, horizontalY - halfRoadHeight, width, horizontalY - halfRoadHeight);
    line(0, horizontalY + halfRoadHeight, width, horizontalY + halfRoadHeight);
    pop();
  }

  getRoadBoundaries() {
    return {
      horizontal: {
        y: height / 2,
        height: height * this.settings.horizontalRoadRatio
      },
      vertical: {
        centerX: width / 2,
        bottomWidth: width * this.settings.verticalRoadBaseRatio,
        topWidth: width * this.settings.verticalRoadTopRatio,
        horizonY: height * this.settings.horizonLineRatio
      }
    };
  }
}

class DraggableQuad {
  constructor() {

    this.points = [
      { xRatio: 0.2, yRatio: 0.2 },  // 左上
      { xRatio: 0.8, yRatio: 0.2 },  // 右上
      { xRatio: 0.8, yRatio: 0.8 },  // 右下
      { xRatio: 0.2, yRatio: 0.8 }   // 左下
    ];
    
    this.selectedPoint = null;
    this.dragRadius = 10;
    this.isVisible = true;
    this.textColor = color(100);
  }

  draw() {
    if (!this.isVisible) return;

    push();

    stroke(255);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let point of this.points) {
      vertex(point.xRatio * width, point.yRatio * height);
    }
    endShape(CLOSE);

    for (let point of this.points) {
      fill(255, 0, 0);
      noStroke();
      circle(point.xRatio * width, point.yRatio * height, this.dragRadius * 2);
    }

    this.displayMeasurements();
    pop();
  }

  displayMeasurements() {
    textSize(14);
    fill(this.textColor);
    noStroke();

    let topWidth = dist(
      this.points[0].xRatio * width, this.points[0].yRatio * height,
      this.points[1].xRatio * width, this.points[1].yRatio * height
    ) / width;
    
    let bottomWidth = dist(
      this.points[3].xRatio * width, this.points[3].yRatio * height,
      this.points[2].xRatio * width, this.points[2].yRatio * height
    ) / width;
    
    let avgWidthRatio = (topWidth + bottomWidth) / 2;

    let leftHeight = dist(
      this.points[0].xRatio * width, this.points[0].yRatio * height,
      this.points[3].xRatio * width, this.points[3].yRatio * height
    ) / height;
    
    let rightHeight = dist(
      this.points[1].xRatio * width, this.points[1].yRatio * height,
      this.points[2].xRatio * width, this.points[2].yRatio * height
    ) / height;
    
    let avgHeightRatio = (leftHeight + rightHeight) / 2;

    let ratio = avgWidthRatio / avgHeightRatio;

    let lineHeight = 20; 
    let startY = height - 140; 
    let x = 10;

    for (let i = 0; i < this.points.length; i++) {
      let point = this.points[i];
      text(`P${i}: (${(point.xRatio * 100).toFixed(1)}%, ${(point.yRatio * 100).toFixed(1)}%)`, 
           x, startY + i * lineHeight);
    }

    text(`Width Ratio: ${(avgWidthRatio * 100).toFixed(1)}%`, x, startY + 4 * lineHeight);
    text(`Height Ratio: ${(avgHeightRatio * 100).toFixed(1)}%`, x, startY + 5 * lineHeight);
    text(`Aspect Ratio: ${ratio.toFixed(2)}`, x, startY + 6 * lineHeight);

    for (let i = 0; i < this.points.length; i++) {
      let point = this.points[i];
      let label = `P${i}: (${(point.xRatio * 100).toFixed(1)}%, ${(point.yRatio * 100).toFixed(1)}%)`;
      text(label, point.xRatio * width + 15, point.yRatio * height);
    }
  }

  handleMousePressed() {

    for (let i = 0; i < this.points.length; i++) {
      let d = dist(
        mouseX, mouseY,
        this.points[i].xRatio * width,
        this.points[i].yRatio * height
      );
      if (d < this.dragRadius) {
        this.selectedPoint = i;
        break;
      }
    }
  }

  handleMouseDragged() {

    if (this.selectedPoint !== null) {

      this.points[this.selectedPoint].xRatio = constrain(mouseX / width, 0, 1);
      this.points[this.selectedPoint].yRatio = constrain(mouseY / height, 0, 1);
    }
  }

  handleMouseReleased() {
    this.selectedPoint = null;
  }

  toggle() {
    this.isVisible = !this.isVisible;
  }
}

class Signpost {
  constructor() {

    this.leftPoints = [
      { xRatio: 0.296, yRatio: 0.438 }, // P0
      { xRatio: 0.383, yRatio: 0.438 }, // P1
      { xRatio: 0.347, yRatio: 0.564 }, // P2
      { xRatio: 0.260, yRatio: 0.564 }  // P3
    ];
    
    this.rightPoints = this.calculateSymmetricPoints(this.leftPoints);

    this.topPoints = [
      { xRatio: 0.433, yRatio: 0.363 }, // P0
      { xRatio: 0.569, yRatio: 0.363 }, // P1
      { xRatio: 0.581, yRatio: 0.405 }, // P2
      { xRatio: 0.421, yRatio: 0.405 }  // P3
    ];

    this.botPoints = [
      { xRatio: 0.380, yRatio: 0.606 }, // P0
      { xRatio: 0.624, yRatio: 0.606 }, // P1
      { xRatio: 0.655, yRatio: 0.730 }, // P2
      { xRatio: 0.350, yRatio: 0.730 }  // P3
    ];
    
    this.stripeCount = 5;

    this.botCenterLinePoints = [
      { xRatio: 0.495, yRatio: 0.744 }, // P0
      { xRatio: 0.505, yRatio: 0.744 }, // P1
      { xRatio: 0.510, yRatio: 1.000 }, // P2
      { xRatio: 0.490, yRatio: 1.000 }  // P3
    ];

    this.topCenterLinePoints = [
      { xRatio: 0.498, yRatio: 0.250 }, // P0
      { xRatio: 0.502, yRatio: 0.250 }, // P1
      { xRatio: 0.504, yRatio: 0.355 }, // P2
      { xRatio: 0.496, yRatio: 0.355 }  // P3
    ];

    this.rightCenterLinePoints = [
      { xRatio: 0.736, yRatio: 0.495 }, // P0
      { xRatio: 1.000, yRatio: 0.495 }, // P1
      { xRatio: 1.000, yRatio: 0.505 }, // P2
      { xRatio: 0.739, yRatio: 0.505 }  // P3
    ];

    this.leftCenterLinePoints = [
      { xRatio: 0.000, yRatio: 0.495 }, // P0
      { xRatio: 0.264, yRatio: 0.495 }, // P1
      { xRatio: 0.261, yRatio: 0.505 }, // P2
      { xRatio: 0.000, yRatio: 0.505 }  // P3
    ];

    this.keepClearLineBotPoints = [
      { xRatio: 0.348, yRatio: 0.744 }, // P0
      { xRatio: 0.500, yRatio: 0.744 }, // P1
      { xRatio: 0.500, yRatio: 0.760 }, // P2
      { xRatio: 0.343, yRatio: 0.760 }  // P3
    ];

    this.keepClearLineTopPoints = [
      { xRatio: 0.500, yRatio: 0.348 }, // P0
      { xRatio: 0.566, yRatio: 0.348 }, // P1
      { xRatio: 0.568, yRatio: 0.355 }, // P2
      { xRatio: 0.500, yRatio: 0.355 }  // P3
    ];

    this.centerLines = {
      top: this.topCenterLinePoints,
      right: this.rightCenterLinePoints,
      bottom: this.botCenterLinePoints,
      left: this.leftCenterLinePoints,
      keepBot: this.keepClearLineBotPoints,
      keepTop: this.keepClearLineTopPoints
    };
  }

  calculateSymmetricPoints(points) {
    const centerXRatio = 0.5;
    return points.map(point => ({
      xRatio: centerXRatio + (centerXRatio - point.xRatio),
      yRatio: point.yRatio
    }));
  }

  drawCenterLine(points) {
    push();
    fill(255);
    noStroke();
    beginShape();
    points.forEach(point => {
      vertex(point.xRatio * width, point.yRatio * height);
    });
    endShape(CLOSE);
    pop();
  }

  drawHorizontalCrosswalk(points) {
    let p0 = createVector(points[0].xRatio * width, points[0].yRatio * height);
    let p1 = createVector(points[1].xRatio * width, points[1].yRatio * height);
    let p2 = createVector(points[2].xRatio * width, points[2].yRatio * height);
    let p3 = createVector(points[3].xRatio * width, points[3].yRatio * height);

    let leftSide = p5.Vector.sub(p3, p0);
    let rightSide = p5.Vector.sub(p2, p1);

    for (let i = 0; i <= this.stripeCount; i++) {
      let t = i / this.stripeCount;
      
      if (i % 2 === 0) {
        fill(255);
        let leftTop = p5.Vector.add(p0, p5.Vector.mult(leftSide, t));
        let rightTop = p5.Vector.add(p1, p5.Vector.mult(rightSide, t));
        let rightBottom = p5.Vector.add(p1, p5.Vector.mult(rightSide, Math.min(1, t + 1/this.stripeCount)));
        let leftBottom = p5.Vector.add(p0, p5.Vector.mult(leftSide, Math.min(1, t + 1/this.stripeCount)));

        beginShape();
        vertex(leftTop.x, leftTop.y);
        vertex(rightTop.x, rightTop.y);
        vertex(rightBottom.x, rightBottom.y);
        vertex(leftBottom.x, leftBottom.y);
        endShape(CLOSE);
      }
    }
  }

  drawVerticalCrosswalk(points) {
    let p0 = createVector(points[0].xRatio * width, points[0].yRatio * height);
    let p1 = createVector(points[1].xRatio * width, points[1].yRatio * height);
    let p2 = createVector(points[2].xRatio * width, points[2].yRatio * height);
    let p3 = createVector(points[3].xRatio * width, points[3].yRatio * height);

    let topSide = p5.Vector.sub(p1, p0);
    let bottomSide = p5.Vector.sub(p2, p3);

    for (let i = 0; i <= this.stripeCount; i++) {
      let t = i / this.stripeCount;
      
      if (i % 2 === 0) {
        fill(255);
        let topLeft = p5.Vector.add(p0, p5.Vector.mult(topSide, t));
        let topRight = p5.Vector.add(p0, p5.Vector.mult(topSide, Math.min(1, t + 1/this.stripeCount)));
        let bottomRight = p5.Vector.add(p3, p5.Vector.mult(bottomSide, Math.min(1, t + 1/this.stripeCount)));
        let bottomLeft = p5.Vector.add(p3, p5.Vector.mult(bottomSide, t));

        beginShape();
        vertex(topLeft.x, topLeft.y);
        vertex(topRight.x, topRight.y);
        vertex(bottomRight.x, bottomRight.y);
        vertex(bottomLeft.x, bottomLeft.y);
        endShape(CLOSE);
      }
    }
  }

  draw() {
    push();
    noStroke();
    
    this.drawHorizontalCrosswalk(this.leftPoints);   
    this.drawHorizontalCrosswalk(this.rightPoints);  
    this.drawVerticalCrosswalk(this.topPoints);       
    this.drawVerticalCrosswalk(this.botPoints);     

    Object.values(this.centerLines).forEach(points => {
      this.drawCenterLine(points);
    });
    
    pop();
  }
  
  // Debug method to show points
  drawDebugPoints() {
    push();
    textSize(12);
    
    // Draw left points
    fill(255, 0, 0);
    this.leftPoints.forEach((p, i) => {
      circle(p.xRatio * width, p.yRatio * height, 5);
      fill(100);
      text(`L${i}: (${(p.xRatio * 100).toFixed(1)}%, ${(p.yRatio * 100).toFixed(1)}%)`, 
           p.xRatio * width + 10, p.yRatio * height);
    });
    
    // Draw right points
    fill(0, 255, 0);
    this.rightPoints.forEach((p, i) => {
      circle(p.xRatio * width, p.yRatio * height, 5);
      fill(100);
      text(`R${i}: (${(p.xRatio * 100).toFixed(1)}%, ${(p.yRatio * 100).toFixed(1)}%)`, 
           p.xRatio * width + 10, p.yRatio * height);
    });

    // Draw top points
    fill(0, 0, 255);
    this.topPoints.forEach((p, i) => {
      circle(p.xRatio * width, p.yRatio * height, 5);
      fill(100);
      text(`T${i}: (${(p.xRatio * 100).toFixed(1)}%, ${(p.yRatio * 100).toFixed(1)}%)`, 
           p.xRatio * width + 10, p.yRatio * height);
    });

    // Draw bottom points
    fill(255, 165, 0); 
    this.botPoints.forEach((p, i) => {
      circle(p.xRatio * width, p.yRatio * height, 5);
      fill(100);
      text(`B${i}: (${(p.xRatio * 100).toFixed(1)}%, ${(p.yRatio * 100).toFixed(1)}%)`, 
           p.xRatio * width + 10, p.yRatio * height);
    });

    fill(255, 0, 255); 

    Object.entries(this.centerLines).forEach(([name, points]) => {
      points.forEach((p, i) => {
        circle(p.xRatio * width, p.yRatio * height, 5);
        fill(100);

        text(`${name.charAt(0).toUpperCase()}C${i}: (${(p.xRatio * 100).toFixed(1)}%, ${(p.yRatio * 100).toFixed(1)}%)`,
             p.xRatio * width + 10, p.yRatio * height);
      });
    });
    
    pop();
  }
}

class Window {
  constructor(xRatio, yRatio, widthRatio, heightRatio) {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.widthRatio = widthRatio;
    this.heightRatio = heightRatio;
  }

  draw() {
    push();

    fill(139, 69, 19);
    noStroke();
    rect(
      this.xRatio * width,
      this.yRatio * height,
      this.widthRatio * width,
      this.heightRatio * height
    );

    fill(200, 230, 255);
    rect(
      (this.xRatio + 0.005) * width,
      (this.yRatio + 0.005) * height,
      (this.widthRatio - 0.01) * width,
      (this.heightRatio - 0.01) * height
    );

    fill(139, 69, 19);
    rect(
      this.xRatio * width,
      (this.yRatio + this.heightRatio/2 - 0.003) * height,
      this.widthRatio * width,
      0.006 * height
    );

    rect(
      (this.xRatio + this.widthRatio/2 - 0.002) * width,
      this.yRatio * height,
      0.004 * width,
      this.heightRatio * height
    );
    pop();
  }
}

class Door {
  constructor(xRatio, yRatio, widthRatio, heightRatio) {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.widthRatio = widthRatio;
    this.heightRatio = heightRatio;
  }

  checkClick(mouseXRatio, mouseYRatio) {
    let x = this.xRatio * width;
    let y = this.yRatio * height;
    let w = this.widthRatio * width;
    let h = this.heightRatio * height;
    
    return (mouseXRatio * width >= x && 
            mouseXRatio * width <= x + w && 
            mouseYRatio * height >= y && 
            mouseYRatio * height <= y + h);
  }

  draw() {
    push();
    fill(139, 69, 19);
    noStroke();
    rect(
      this.xRatio * width,
      this.yRatio * height,
      this.widthRatio * width,
      this.heightRatio * height
    );

    fill(101, 67, 33);
    rect(
      (this.xRatio + 0.005) * width,
      (this.yRatio + 0.005) * height,
      (this.widthRatio - 0.01) * width,
      (this.heightRatio - 0.005) * height
    );

    fill(255, 215, 0);
    circle(
      (this.xRatio + this.widthRatio * 0.8) * width,
      (this.yRatio + this.heightRatio * 0.5) * height,
      0.01 * width
    );
    pop();
  }
}

class PerspectiveWindow {
  constructor(topLeft, topRight, bottomRight, bottomLeft) {
    this.points = {
      topLeft: topLeft,
      topRight: topRight,
      bottomRight: bottomRight,
      bottomLeft: bottomLeft
    };
  }

  draw() {
    push();

    fill(139, 69, 19);
    noStroke();
    beginShape();
    vertex(this.points.topLeft.xRatio * width, this.points.topLeft.yRatio * height);
    vertex(this.points.topRight.xRatio * width, this.points.topRight.yRatio * height);
    vertex(this.points.bottomRight.xRatio * width, this.points.bottomRight.yRatio * height);
    vertex(this.points.bottomLeft.xRatio * width, this.points.bottomLeft.yRatio * height);
    endShape(CLOSE);

    let inset = 0.002;
    let glassPoints = this.calculateInsetPoints(inset);
    fill(200, 230, 255); 
    beginShape();
    vertex(glassPoints.topLeft.xRatio * width, glassPoints.topLeft.yRatio * height);
    vertex(glassPoints.topRight.xRatio * width, glassPoints.topRight.yRatio * height);
    vertex(glassPoints.bottomRight.xRatio * width, glassPoints.bottomRight.yRatio * height);
    vertex(glassPoints.bottomLeft.xRatio * width, glassPoints.bottomLeft.yRatio * height);
    endShape(CLOSE);

    this.drawWindowFrame();
    pop();
  }

  calculateInsetPoints(inset) {
    return {
      topLeft: this.lerpPoint(this.points.topLeft, this.points.bottomRight, inset),
      topRight: this.lerpPoint(this.points.topRight, this.points.bottomLeft, inset),
      bottomRight: this.lerpPoint(this.points.bottomRight, this.points.topLeft, inset),
      bottomLeft: this.lerpPoint(this.points.bottomLeft, this.points.topRight, inset)
    };
  }

  lerpPoint(p1, p2, t) {
    return {
      xRatio: p1.xRatio + (p2.xRatio - p1.xRatio) * t,
      yRatio: p1.yRatio + (p2.yRatio - p1.yRatio) * t
    };
  }

  drawWindowFrame() {
    fill(139, 69, 19);
    
    let midLeftPoint = this.lerpPoint(this.points.topLeft, this.points.bottomLeft, 0.5);
    let midRightPoint = this.lerpPoint(this.points.topRight, this.points.bottomRight, 0.5);
    
    beginShape();
    vertex(midLeftPoint.xRatio * width, (midLeftPoint.yRatio - 0.003) * height);
    vertex(midRightPoint.xRatio * width, (midRightPoint.yRatio - 0.003) * height);
    vertex(midRightPoint.xRatio * width, (midRightPoint.yRatio + 0.003) * height);
    vertex(midLeftPoint.xRatio * width, (midLeftPoint.yRatio + 0.003) * height);
    endShape(CLOSE);

    let midTopPoint = this.lerpPoint(this.points.topLeft, this.points.topRight, 0.5);
    let midBottomPoint = this.lerpPoint(this.points.bottomLeft, this.points.bottomRight, 0.5);
    
    beginShape();
    vertex((midTopPoint.xRatio - 0.002) * width, midTopPoint.yRatio * height);
    vertex((midTopPoint.xRatio + 0.002) * width, midTopPoint.yRatio * height);
    vertex((midBottomPoint.xRatio + 0.002) * width, midBottomPoint.yRatio * height);
    vertex((midBottomPoint.xRatio - 0.002) * width, midBottomPoint.yRatio * height);
    endShape(CLOSE);
  }
}

class Building{
  constructor() {

    this.points = [
      { xRatio: 0.000, yRatio: 0.000 }, // P0
      { xRatio: 0.31, yRatio: 0.000 }, // P1
      { xRatio: 0.30, yRatio: 0.353 }, // P2
      { xRatio: 0.000, yRatio: 0.353 }  // P3
    ];

    this.sidePoints = [
      { xRatio: 0.31, yRatio: 0.000 },  // P0
      { xRatio: 0.346, yRatio: 0.000 }, // P1
      { xRatio: 0.337, yRatio: 0.247 }, // P2
      { xRatio: 0.30, yRatio: 0.353 }   // P3
    ];
    
    this.secondFloorHeightRatio = 0.45;

    this.dividerPoints = {
      left: {
        xRatio: this.points[3].xRatio,
        yRatio: this.points[3].yRatio * this.secondFloorHeightRatio
      },
      right: {
        xRatio: this.lerp(this.points[1].xRatio, this.points[2].xRatio, this.secondFloorHeightRatio),
        yRatio: this.points[3].yRatio * this.secondFloorHeightRatio
      }
    };

    this.sideDividerPoints = {
      left: {
        xRatio: this.dividerPoints.right.xRatio,
        yRatio: this.dividerPoints.right.yRatio
      },
      right: {
        xRatio: this.lerp(this.sidePoints[1].xRatio, this.sidePoints[2].xRatio, 0.5),
        yRatio: this.lerp(this.sidePoints[1].yRatio, this.sidePoints[2].yRatio, 0.5)
      }
    };

    let windowWidth = 0.04;   
    let windowHeight = 0.08; 

    this.firstFloorWindows = [
      new Window(0.02, 0.2, windowWidth, windowHeight),
      new Window(0.07, 0.2, windowWidth, windowHeight),
      new Window(0.18, 0.2, windowWidth, windowHeight),
      new Window(0.23, 0.2, windowWidth, windowHeight)
    ];

    this.secondFloorWindows = [];
    for(let i = 0; i < 5; i++) {
      this.secondFloorWindows.push(
        new Window(0.02 + i * 0.055, 0.05, windowWidth, windowHeight)
      );
    }

    this.sideSecondFloorWindows = [

      new PerspectiveWindow(
        { xRatio: 0.312, yRatio: 0.05 }, 
        { xRatio: 0.325, yRatio: 0.04 },  
        { xRatio: 0.324, yRatio: 0.11 },  
        { xRatio: 0.311, yRatio: 0.12 }   
      ),

      new PerspectiveWindow(
        { xRatio: 0.328, yRatio: 0.038 }, 
        { xRatio: 0.341, yRatio: 0.03 }, 
        { xRatio: 0.340, yRatio: 0.095 }, 
        { xRatio: 0.327, yRatio: 0.105 }  
      )
    ];

    this.sideFirstFloorWindows = [
  
      new PerspectiveWindow(
        { xRatio: 0.31, yRatio: 0.20 },  
        { xRatio: 0.323, yRatio: 0.185 },
        { xRatio: 0.322, yRatio: 0.25 }, 
        { xRatio: 0.309, yRatio: 0.27 } 
      ),

      new PerspectiveWindow(
        { xRatio: 0.328, yRatio: 0.18 },  
        { xRatio: 0.338, yRatio: 0.17 },  
        { xRatio: 0.336, yRatio: 0.24 },  
        { xRatio: 0.327, yRatio: 0.25 } 
      )
    ];

    this.door = new Door(0.115, 0.18, 0.05, 0.17);

    this.transitionSpeed = 0.05;

    this.targetColors = {
      frontSecondFloor: {
        day: color(255, 127, 80),    
        night: color(180, 89, 56)    
      },
      sideSecondFloor: {
        day: color(230, 115, 73),   
        night: color(161, 80, 51)  
      },
      frontFirstFloor: {
        day: color(255, 255, 153),   
        night: color(179, 179, 107)  
      },
      sideFirstFloor: {
        day: color(230, 230, 138), 
        night: color(161, 161, 97) 
      }
    };

    this.currentColors = {
      frontSecondFloor: this.targetColors.frontSecondFloor.day,
      sideSecondFloor: this.targetColors.sideSecondFloor.day,
      frontFirstFloor: this.targetColors.frontFirstFloor.day,
      sideFirstFloor: this.targetColors.sideFirstFloor.day
    };

  }

  lerpColor(c1, c2, amount) {
    let r1 = red(c1);
    let g1 = green(c1);
    let b1 = blue(c1);
    
    let r2 = red(c2);
    let g2 = green(c2);
    let b2 = blue(c2);
    
    return color(
      r1 + (r2 - r1) * amount,
      g1 + (g2 - g1) * amount,
      b1 + (b2 - b1) * amount
    );
  }


  update(phase) {
    // 更新所有颜色
    for (let key in this.currentColors) {
      const targetColor = phase === 'night' ? 
        this.targetColors[key].night : 
        this.targetColors[key].day;
      
      this.currentColors[key] = this.lerpColor(
        this.currentColors[key],
        targetColor,
        this.transitionSpeed
      );
    }
  }

  lerp(start, end, t) {
    return start + (end - start) * t;
  }

  checkDoorClick(mouseXRatio, mouseYRatio) {
    return this.door.checkClick(mouseXRatio, mouseYRatio);
  }

  draw() {
    push();
    noStroke();

    fill(this.currentColors.frontSecondFloor);
    beginShape();
    vertex(this.points[0].xRatio * width, this.points[0].yRatio * height);
    vertex(this.points[1].xRatio * width, this.points[1].yRatio * height);
    vertex(this.dividerPoints.right.xRatio * width, this.dividerPoints.right.yRatio * height);
    vertex(this.dividerPoints.left.xRatio * width, this.dividerPoints.left.yRatio * height);
    endShape(CLOSE);

    fill(this.currentColors.sideSecondFloor); 
    beginShape();
    vertex(this.points[1].xRatio * width, this.points[1].yRatio * height);
    vertex(this.sidePoints[1].xRatio * width, this.sidePoints[1].yRatio * height);
    vertex(this.sideDividerPoints.right.xRatio * width, this.sideDividerPoints.right.yRatio * height);
    vertex(this.dividerPoints.right.xRatio * width, this.dividerPoints.right.yRatio * height);
    endShape(CLOSE);

    fill(this.currentColors.frontFirstFloor);
    beginShape();
    vertex(this.dividerPoints.left.xRatio * width, this.dividerPoints.left.yRatio * height);
    vertex(this.dividerPoints.right.xRatio * width, this.dividerPoints.right.yRatio * height);
    vertex(this.points[2].xRatio * width, this.points[2].yRatio * height);
    vertex(this.points[3].xRatio * width, this.points[3].yRatio * height);
    endShape(CLOSE);

    fill(this.currentColors.sideFirstFloor); 
    beginShape();
    vertex(this.dividerPoints.right.xRatio * width, this.dividerPoints.right.yRatio * height);
    vertex(this.sideDividerPoints.right.xRatio * width, this.sideDividerPoints.right.yRatio * height);
    vertex(this.sidePoints[2].xRatio * width, this.sidePoints[2].yRatio * height);
    vertex(this.points[2].xRatio * width, this.points[2].yRatio * height);
    endShape(CLOSE);

    this.door.draw();

    this.firstFloorWindows.forEach(window => window.draw());
    this.secondFloorWindows.forEach(window => window.draw());

    this.sideFirstFloorWindows.forEach(window => window.draw());
    this.sideSecondFloorWindows.forEach(window => window.draw());

    pop();
  }
}

class BuildingRight {
  constructor() {

    this.points = [
      { xRatio: 0.69, yRatio: 0.000 },   
      { xRatio: 1.00, yRatio: 0.000 },   
      { xRatio: 1.00, yRatio: 0.353 },   
      { xRatio: 0.70, yRatio: 0.353 }    
    ];

    this.sidePoints = [
      { xRatio: 0.654, yRatio: 0.000 },  
      { xRatio: 0.69, yRatio: 0.000 },   
      { xRatio: 0.70, yRatio: 0.353 },   
      { xRatio: 0.663, yRatio: 0.247 }  
    ];
    
    this.secondFloorHeightRatio = 0.45;

    this.dividerPoints = {
      left: {
        xRatio: 0.69,  
        yRatio: this.points[3].yRatio * this.secondFloorHeightRatio
      },
      right: {
        xRatio: 1.00,  
        yRatio: this.points[3].yRatio * this.secondFloorHeightRatio
      }
    };

    this.sideDividerPoints = {
      left: {
        xRatio: this.lerp(this.sidePoints[0].xRatio, this.sidePoints[3].xRatio, this.secondFloorHeightRatio),
        yRatio: this.lerp(this.sidePoints[0].yRatio, this.sidePoints[3].yRatio, this.secondFloorHeightRatio)
      },
      right: {
        xRatio: this.dividerPoints.left.xRatio, 
        yRatio: this.dividerPoints.left.yRatio
      }
    };

    let windowWidth = 0.04;   
    let windowHeight = 0.08; 

    this.firstFloorWindows = [
      new Window(0.73, 0.2, windowWidth, windowHeight),
      new Window(0.78, 0.2, windowWidth, windowHeight),
      new Window(0.89, 0.2, windowWidth, windowHeight),
      new Window(0.94, 0.2, windowWidth, windowHeight)
    ];

    this.secondFloorWindows = [];
    for(let i = 0; i < 5; i++) {
      this.secondFloorWindows.push(
        new Window(0.71 + i * 0.055, 0.05, windowWidth, windowHeight)
      );
    }

    this.sideSecondFloorWindows = [
      new PerspectiveWindow(
        { xRatio: 0.675, yRatio: 0.04 }, 
        { xRatio: 0.688, yRatio: 0.05 }, 
        { xRatio: 0.689, yRatio: 0.12 },  
        { xRatio: 0.676, yRatio: 0.11 }  
      ),
      new PerspectiveWindow(
        { xRatio: 0.659, yRatio: 0.03 },  
        { xRatio: 0.672, yRatio: 0.038 }, 
        { xRatio: 0.673, yRatio: 0.105 }, 
        { xRatio: 0.660, yRatio: 0.095 }
      )
    ];

    // 一楼窗户
    this.sideFirstFloorWindows = [
      new PerspectiveWindow(
        { xRatio: 0.677, yRatio: 0.185 },
        { xRatio: 0.690, yRatio: 0.20 }, 
        { xRatio: 0.691, yRatio: 0.27 }, 
        { xRatio: 0.678, yRatio: 0.25 }  
      ),
      new PerspectiveWindow(
        { xRatio: 0.662, yRatio: 0.17 },  
        { xRatio: 0.672, yRatio: 0.18 }, 
        { xRatio: 0.673, yRatio: 0.25 },  
        { xRatio: 0.664, yRatio: 0.24 }  
      )
    ];

    this.door = new Door(0.835, 0.18, 0.05, 0.17);

    this.transitionSpeed = 0.05;

    this.targetColors = {
      frontSecondFloor: {
        day: color(255, 200, 80),    
        night: color(179, 140, 56)   
      },
      sideSecondFloor: {
        day: color(230, 180, 70),   
        night: color(161, 126, 49) 
      },
      frontFirstFloor: {
        day: color(173, 255, 47),    
        night: color(121, 179, 33)   
      },
      sideFirstFloor: {
        day: color(150, 230, 40),   
        night: color(105, 161, 28)  
      }
    };

    this.currentColors = {
      frontSecondFloor: this.targetColors.frontSecondFloor.day,
      sideSecondFloor: this.targetColors.sideSecondFloor.day,
      frontFirstFloor: this.targetColors.frontFirstFloor.day,
      sideFirstFloor: this.targetColors.sideFirstFloor.day
    };

  }

  lerpColor(c1, c2, amount) {
    let r1 = red(c1);
    let g1 = green(c1);
    let b1 = blue(c1);
    
    let r2 = red(c2);
    let g2 = green(c2);
    let b2 = blue(c2);
    
    return color(
      r1 + (r2 - r1) * amount,
      g1 + (g2 - g1) * amount,
      b1 + (b2 - b1) * amount
    );
  }

  update(phase) {

    for (let key in this.currentColors) {
      const targetColor = phase === 'night' ? 
        this.targetColors[key].night : 
        this.targetColors[key].day;
      
      this.currentColors[key] = this.lerpColor(
        this.currentColors[key],
        targetColor,
        this.transitionSpeed
      );
    }
  }

  lerp(start, end, t) {
    return start + (end - start) * t;
  }

  checkDoorClick(mouseXRatio, mouseYRatio) {
    return this.door.checkClick(mouseXRatio, mouseYRatio);
  }

  draw() {
    push();
    noStroke();

    fill(this.currentColors.frontSecondFloor); 
    beginShape();
    vertex(this.points[0].xRatio * width, this.points[0].yRatio * height);
    vertex(this.points[1].xRatio * width, this.points[1].yRatio * height);
    vertex(this.dividerPoints.right.xRatio * width, this.dividerPoints.right.yRatio * height);
    vertex(this.dividerPoints.left.xRatio * width, this.dividerPoints.left.yRatio * height);
    endShape(CLOSE);

    fill(this.currentColors.sideSecondFloor); 
    beginShape();
    vertex(this.sidePoints[0].xRatio * width, this.sidePoints[0].yRatio * height);
    vertex(this.sidePoints[1].xRatio * width, this.sidePoints[1].yRatio * height);
    vertex(this.sideDividerPoints.right.xRatio * width, this.sideDividerPoints.right.yRatio * height);
    vertex(this.sideDividerPoints.left.xRatio * width, this.sideDividerPoints.left.yRatio * height);
    endShape(CLOSE);

    fill(this.currentColors.frontFirstFloor); 
    beginShape();
    vertex(this.dividerPoints.left.xRatio * width, this.dividerPoints.left.yRatio * height);
    vertex(this.dividerPoints.right.xRatio * width, this.dividerPoints.right.yRatio * height);
    vertex(this.points[2].xRatio * width, this.points[2].yRatio * height);
    vertex(this.points[3].xRatio * width, this.points[3].yRatio * height);
    endShape(CLOSE);

    fill(this.currentColors.sideFirstFloor); 
    beginShape();
    vertex(this.sideDividerPoints.left.xRatio * width, this.sideDividerPoints.left.yRatio * height);
    vertex(this.sideDividerPoints.right.xRatio * width, this.sideDividerPoints.right.yRatio * height);
    vertex(this.sidePoints[2].xRatio * width, this.sidePoints[2].yRatio * height);
    vertex(this.sidePoints[3].xRatio * width, this.sidePoints[3].yRatio * height);
    endShape(CLOSE);

    this.door.draw();
    this.firstFloorWindows.forEach(window => window.draw());
    this.secondFloorWindows.forEach(window => window.draw());
    this.sideFirstFloorWindows.forEach(window => window.draw());
    this.sideSecondFloorWindows.forEach(window => window.draw());

    pop();
  }
}

class CelestialObject {
  constructor(centerX, centerY, size) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.size = size;
    this.currentRotation = 0;
    this.glowIntensity = 0;
    this.glowDirection = 1;
  }

  update() {
    this.currentRotation += 0.01;
    this.glowIntensity += 0.05 * this.glowDirection;
    if (this.glowIntensity > 1) {
      this.glowDirection = -1;
    } else if (this.glowIntensity < 0) {
      this.glowDirection = 1;
    }
  }

  isClicked(mouseXRatio, mouseYRatio) {
    let distance = dist(
      mouseXRatio,
      mouseYRatio,
      this.centerX,
      this.centerY
    );
    return distance < this.size;
  }
}

class Sun extends CelestialObject {
  constructor(centerX, groundY, size) {
    super(centerX, groundY, size);

    this.startPoint = { x: 0.346, y: 0.247 };   
    this.peakPoint = { x: 0.5, y: 0.05 };        
    this.endPoint = { x: 0.654, y: 0.247 };     
    
    this.currentX = this.startPoint.x;
    this.currentY = this.startPoint.y;
  }

  update(phase, progress) {
    this.currentRotation += 0.01;
    this.glowIntensity += 0.05 * this.glowDirection;
    if (this.glowIntensity > 1) {
      this.glowDirection = -1;
    } else if (this.glowIntensity < 0) {
      this.glowDirection = 1;
    }

    if (phase === 'day') {

      this.currentX = this.lerp(this.startPoint.x, this.peakPoint.x, progress);
      
      const t = progress;
      this.currentY = this.startPoint.y + (this.peakPoint.y - this.startPoint.y) * progress 
                     - 4 * (this.startPoint.y - this.peakPoint.y) * t * (1 - t);
    } 
    else if (phase === 'dusk') {

      this.currentX = this.lerp(this.peakPoint.x, this.endPoint.x, progress);
      
      const t = progress;
      this.currentY = this.peakPoint.y + (this.endPoint.y - this.peakPoint.y) * t * t;
    }
  }

  lerp(start, end, t) {
    return start + (end - start) * t;
  }

  draw() {
    push();
    translate(this.currentX * width, this.currentY * height);
    
    let glowSize = this.size * (1 + this.glowIntensity * 0.2);
    for (let i = 3; i > 0; i--) {
      fill(255, 200, 0, 50 / i);
      noStroke();
      circle(0, 0, width * glowSize * i);
    }
    
    fill(255, 200, 0);
    circle(0, 0, width * this.size);
    
    stroke(255, 200, 0);
    strokeWeight(2);
    for (let i = 0; i < 12; i++) {
      let angle = this.currentRotation + i * TWO_PI / 12;
      let rayLength = this.size * 0.8 * (1 + this.glowIntensity * 0.2);
      line(
        cos(angle) * this.size * width * 0.6,
        sin(angle) * this.size * width * 0.6,
        cos(angle) * rayLength * width,
        sin(angle) * rayLength * width
      );
    }
    pop();
  }
}

class Moon extends CelestialObject {
  constructor(centerX, centerY, size) {
    super(centerX, centerY, size);
    
    this.phases = [
      'new-moon',        
      'waxing-crescent', 
      'first-quarter',   
      'full-moon',       
      'last-quarter',   
      'waning-crescent'  
    ];
    this.currentPhaseIndex = 3; 
    this.currentPhase = this.phases[this.currentPhaseIndex];
  }

  updatePhase() {
    this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
    this.currentPhase = this.phases[this.currentPhaseIndex];
  }

  calculateGlowIntensity(phase) {
    switch(phase) {
      case 'new-moon':
        return 0;
      case 'waxing-crescent':
      case 'waning-crescent':
        return 0.4;
      case 'first-quarter':
      case 'last-quarter':
        return 0.7;
      case 'full-moon':
        return 1;
      default:
        return 0;
    }
  }

  drawConcaveCrescent(moonSize, isWaxing) {

    fill(220, 220, 255);
    circle(0, 0, moonSize);
    
    fill(0, 20, 50, 150); 
    const maskOffset = isWaxing ? moonSize * 0.2 : -moonSize * 0.2;
    const maskSize = moonSize * 1.2;
    
    circle(maskOffset, 0, maskSize);
  }

  calculateVisibleRange(moonSize, phase) {
    const halfSize = moonSize/2;
    switch(phase) {
      case 'waxing-crescent':
        return [-halfSize, 0];
      case 'first-quarter':
        return [-halfSize, 0];
      case 'waning-crescent':
        return [0, halfSize];
      default:
        return [-halfSize, halfSize];
    }
  }

  drawMoonGlow(size, phase) {
    const glowIntensity = this.calculateGlowIntensity(phase);
    if (glowIntensity === 0) return;

    let glowSize = size * (1 + this.glowIntensity * 0.1);
    for (let i = 2; i > 0; i--) {
      fill(200, 200, 255, 30 * glowIntensity / i);
      noStroke();
      circle(0, 0, width * glowSize * i);
    }
  }

  drawPhase(moonSize) {
    fill(220, 220, 255);
    noStroke();

    switch(this.currentPhase) {
      case 'new-moon':
        fill(220, 220, 255, 0);
        circle(0, 0, moonSize);
        break;

      case 'waxing-crescent':
        this.drawConcaveCrescent(moonSize, true);
        break;

      case 'first-quarter':
        arc(0, 0, moonSize, moonSize, HALF_PI, -HALF_PI, CHORD);

        break;

      case 'full-moon':
        circle(0, 0, moonSize);
        break;

      case 'last-quarter':
        arc(0, 0, moonSize, moonSize, -HALF_PI, HALF_PI, CHORD);
        break;

      case 'waning-crescent':
        this.drawConcaveCrescent(moonSize, false);
        break;
    }
  }

  draw() {
    push();
    translate(this.centerX * width, this.centerY * height);
    
    const moonSize = width * this.size;
    
    this.drawMoonGlow(this.size, this.currentPhase);
    
    this.drawPhase(moonSize);
    
    pop();
  }
}

class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.brightness = random(0.3, 1);
    this.twinkleSpeed = random(0.02, 0.05);
    this.twinkleOffset = random(TWO_PI);
  }

  update() {

    this.brightness = map(
      sin(frameCount * this.twinkleSpeed + this.twinkleOffset), 
      -1, 
      1, 
      0.3, 
      1
    );
  }

  draw() {
    push();
    noStroke();

    for (let i = 2; i > 0; i--) {
      fill(255, 255, 255, 100 * this.brightness / i);
      circle(this.x * width, this.y * height, this.size * width * i * 0.8);
    }

    fill(255, 255, 255, 255 * this.brightness);
    circle(this.x * width, this.y * height, this.size * width * 0.5);
    pop();
  }
}

class StarField {
  constructor(count, bounds) {
    this.stars = [];
    this.bounds = bounds;
    
    for (let i = 0; i < count; i++) {
      const x = random(bounds.topLeft.xRatio, bounds.topRight.xRatio);
      const y = random(bounds.topLeft.yRatio, bounds.bottomLeft.yRatio);
      const size = random(0.002, 0.005); 
      this.stars.push(new Star(x, y, size));
    }
  }

  update() {
    this.stars.forEach(star => star.update());
  }

  draw() {
    this.stars.forEach(star => star.draw());
  }
}

class SkyObject {
  constructor(citySky) {
    this.citySky = citySky;

    this.bounds = {
      topLeft: { xRatio: 0.346, yRatio: 0.000 },
      topRight: { xRatio: 0.654, yRatio: 0.000 },
      bottomRight: { xRatio: 0.663, yRatio: 0.247 },
      bottomLeft: { xRatio: 0.337, yRatio: 0.247 }
    };
    
    let centerX = (this.bounds.topLeft.xRatio + this.bounds.topRight.xRatio) / 2;
    let centerY = (this.bounds.topLeft.yRatio + this.bounds.bottomLeft.yRatio) / 2;
    
    this.sun = new Sun(
      centerX,   
      0.247,    
      0.05       
    );
    this.moon = new Moon(centerX, centerY, 0.05);
    this.starField = new StarField(50, this.bounds); 
    this.wasNight = false; 
  }

  update() {
    let phase = this.citySky.getCurrentPhase();
    this.isSun = (phase === 'day' || phase === 'dusk');

    if (!this.wasNight && phase === 'night') {

      if (this.moon && typeof this.moon.updatePhase === 'function') {
        this.moon.updatePhase();
      } else {
        console.warn('Moon updatePhase method is not available');
      }
    }
    this.wasNight = (phase === 'night');

    let progress = this.citySky.timeProgress % 1;

    if (this.isSun) {
      this.sun.update(phase, progress);
    } else {
      this.moon.update();
    }
  }

  draw() {
    if (this.isSun) {
      this.sun.draw();
    } else {
      this.starField.draw();
      this.moon.draw();
    }
  }
}

class TrafficLight {
  constructor(xRatio, yRatio, size = 1.0, startDelay = 0) {

    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.size = size;
    
    this.startDelay = startDelay; 
    this.isActive = true;         
    
    this.boxWidth = 0.03 * this.size;
    this.boxHeight = 0.08 * this.size;
    
    this.postWidth = 0.008 * this.size;
    this.postHeight = 0.12 * this.size;
    
    this.lightRadius = this.boxWidth * 0.4;
    this.lightSpacing = this.boxHeight * 0.27;
    
    this.durations = {
      red: 240,
      yellow: 60,
      green: 300
    };
    
    this.currentState = 'red';
    this.stateTimer = -startDelay;  // 使用负值来实现延迟启动
    
    this.colors = {
      red: {
        on: color(255, 0, 0),
        off: color(100, 0, 0)
      },
      yellow: {
        on: color(255, 200, 0),
        off: color(100, 80, 0)
      },
      green: {
        on: color(0, 255, 0),
        off: color(0, 100, 0)
      },
      post: color(70),
    };
  }

  handleClick(mouseXRatio, mouseYRatio) {

    let boxX = this.xRatio * width;
    let boxY = this.yRatio * height;
    let boxW = this.boxWidth * width;
    let boxH = this.boxHeight * height;
    
    if (mouseXRatio * width >= boxX && 
        mouseXRatio * width <= boxX + boxW && 
        mouseYRatio * height >= boxY && 
        mouseYRatio * height <= boxY + boxH) {
      this.isActive = !this.isActive;  
      return true;  
    }
    return false;  
  }

  update() {
    if (!this.isActive) return; 
    
    if (this.stateTimer < 0) {
      this.stateTimer++;
      return;
    }
    
    this.stateTimer++;
    
    if (this.stateTimer >= this.durations[this.currentState]) {
      this.stateTimer = 0;
      
      switch(this.currentState) {
        case 'red':
          this.currentState = 'green';
          break;
        case 'green':
          this.currentState = 'yellow';
          break;
        case 'yellow':
          this.currentState = 'red';
          break;
      }
    }
  }

  drawPost() {
    push();
    fill(this.colors.post);
    noStroke();
    
    rect(
      this.xRatio * width + (this.boxWidth * width) / 2 - (this.postWidth * width) / 2,
      this.yRatio * height + this.boxHeight * height,
      this.postWidth * width,
      this.postHeight * height
    );
    
    pop();
  }

  drawLight(x, y, originalColor) {
    let displayColor;
    
    if (!this.isActive) {

      if (red(originalColor) > green(originalColor) && green(originalColor) === 0) {
        displayColor = this.colors.red.off;  
      } else if (green(originalColor) > red(originalColor) && green(originalColor) > blue(originalColor)) {
        displayColor = this.colors.green.off;  
      } else {
        displayColor = this.colors.yellow.off;  
      }
    } else {
      displayColor = originalColor;  
    }
    
    if (this.isActive && (red(originalColor) > 100 || green(originalColor) > 100 || blue(originalColor) > 100)) {
      for (let i = 3; i > 0; i--) {
        fill(red(displayColor), green(displayColor), blue(displayColor), 50/i);
        noStroke();
        circle(x, y, this.lightRadius * width * (1 + 0.2 * i));
      }
    }
    
    fill(displayColor);
    noStroke();
    circle(x, y, this.lightRadius * width);
  }


  draw() {
    push();
    
    this.drawPost();
    
    fill(40);
    noStroke();
    rect(
      this.xRatio * width,
      this.yRatio * height,
      this.boxWidth * width,
      this.boxHeight * height,
      5
    );
    
    const centerX = this.xRatio * width + (this.boxWidth * width) / 2;
    const startY = this.yRatio * height + (this.boxHeight * height) * 0.15;
    
    this.drawLight(
      centerX,
      startY,
      this.currentState === 'red' ? this.colors.red.on : this.colors.red.off
    );
    
    this.drawLight(
      centerX,
      startY + this.lightSpacing * height,
      this.currentState === 'yellow' ? this.colors.yellow.on : this.colors.yellow.off
    );
    
    this.drawLight(
      centerX,
      startY + 2 * this.lightSpacing * height,
      this.currentState === 'green' ? this.colors.green.on : this.colors.green.off
    );
    
    pop();
  }
}

class StreetLamp {
  constructor(xRatio, yRatio, size = 1.0, type = 'right') {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.size = size;
    this.type = type; 
    
    this.postWidth = 0.008 * this.size; 
    this.postHeight = 0.25 * this.size; 
    
    this.armLength = 0.12 * this.size;    
    this.armHeight = 0.06 * this.size;   
    
    this.lampWidth = 0.04 * this.size;   
    this.lampHeight = 0.025 * this.size;  

    this.isOn = false;           
    this.manualOverride = false; 
    this.manualState = false;    
    
    this.colors = {
      post: color(70),
      lamp: color(40),
      lightOn: color(255, 255, 200, 150),   
      lightOff: color(200, 200, 200, 50),  
      glowOn: color(255, 255, 200, 30),     
      glowOff: color(200, 200, 200, 10)   
    };

    this.glowIntensity = 0;
    this.glowDirection = 1;
  }
  handleClick(mouseXRatio, mouseYRatio) {
    const lampX = this.xRatio * width + (this.type === 'right' ? this.armLength * width : -this.armLength * width);
    const lampY = this.yRatio * height;
    const hitboxSize = this.lampWidth * width;
    
    const distance = dist(mouseXRatio * width, mouseYRatio * height, lampX, lampY);
    if (distance < hitboxSize) {

      if (!this.manualOverride) {
        this.manualOverride = true;
        this.manualState = !this.isOn;
      } else {
        this.manualState = !this.manualState;
      }
      this.isOn = this.manualState;
      return true;
    }
    return false;
  }

  resetToAutomatic(currentPhase) {
    this.manualOverride = false;

    if (currentPhase === 'night') {
      this.isOn = true;
    } else {
      this.isOn = false;
    }

    this.glowIntensity = 0;
    this.glowDirection = 1;
  }
  
  update(currentPhase) {

    if (currentPhase === 'night' && !this.manualOverride) {
      this.isOn = true;
    } 

    else if (currentPhase !== 'night' && !this.manualOverride) {
      this.isOn = false;
    }

    else if (this.manualOverride) {
      this.isOn = this.manualState;
    }
    
    if (this.isOn) {
      this.glowIntensity += 0.02 * this.glowDirection;
      if (this.glowIntensity > 1) {
        this.glowDirection = -1;
      } else if (this.glowIntensity < 0) {
        this.glowDirection = 1;
      }
    } else {
      this.glowIntensity = 0;
    }
  }


  drawPost() {
    push();
    noStroke();
    fill(this.colors.post);
    
    rect(
      this.xRatio * width - (this.postWidth * width) / 2,
      this.yRatio * height,
      this.postWidth * width,
      this.postHeight * height
    );
    
    const armDirection = this.type === 'right' ? 1 : -1;
    const armStartX = this.xRatio * width;

    const armStartY = this.yRatio * height + this.postWidth * height; 

    push();
    translate(armStartX, armStartY);
    beginShape();
    for (let i = 0; i <= 10; i++) {
      let t = i / 10;
      let x = armDirection * this.armLength * width * t;
      let y = -this.armHeight * height * Math.sin(Math.PI * t);
      vertex(x, y);
    }

    for (let i = 10; i >= 0; i--) {
      let t = i / 10;
      let x = armDirection * this.armLength * width * t;
      let y = -this.armHeight * height * Math.sin(Math.PI * t) + this.postWidth * width;
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
    
    pop();
  }
  
  drawLamp() {
    push();
    const lampX = this.xRatio * width + (this.type === 'right' ? this.armLength * width : -this.armLength * width);
    const lampY = this.yRatio * height;

    const currentLightColor = this.isOn ? this.colors.lightOn : this.colors.lightOff;
    const currentGlowColor = this.isOn ? this.colors.glowOn : this.colors.glowOff;
    
    if (this.isOn) {
      let glowSize = 1 + this.glowIntensity * 0.2;
      fill(currentGlowColor);
      noStroke();
      for (let i = 3; i > 0; i--) {
        ellipse(
          lampX,
          lampY,
          this.lampWidth * width * glowSize * i,
          this.lampHeight * width * glowSize * i
        );
      }
    }
    
    fill(this.colors.lamp);
    ellipse(
      lampX,
      lampY,
      this.lampWidth * width,
      this.lampHeight * width
    );

    if (this.isOn && this.glowIntensity > 0.5) {
      push();
      fill(currentLightColor);
      noStroke();
      beginShape();
      let beamWidth = this.lampWidth * 2;
      let beamHeight = this.lampHeight * 8;
      
      vertex(lampX - this.lampWidth * width / 2, lampY);
      vertex(lampX + this.lampWidth * width / 2, lampY);
      vertex(lampX + beamWidth * width / 2, lampY + beamHeight * height);
      vertex(lampX - beamWidth * width / 2, lampY + beamHeight * height);
      endShape(CLOSE);
      pop();
    }
    
    pop();
  }
  
  draw() {
    this.drawPost();
    this.drawLamp();
  }
}

class FireHydrant {
  constructor(xRatio, yRatio, size = 1.0) {

    this.xRatio = xRatio;
    this.yRatio = yRatio;
    this.size = size;
    
    this.bodyWidth = 0.025 * this.size;  
    this.bodyHeight = 0.05 * this.size;  
    this.capWidth = 0.035 * this.size;   
    this.capHeight = 0.015 * this.size;  
    this.valveWidth = 0.015 * this.size; 
    this.domeHeight = 0.02 * this.size;   
    this.valveWidth = 0.015 * this.size;  
    
    this.isActive = false;              
    this.particles = [];                
    this.maxParticles = 100;            
    this.rotationAngle = 0;           
    this.rotationSpeed = 0.1;         
    
    this.colors = {
      body: color(230, 0, 0),     
      dome: color(200, 0, 0),       
      cap: color(200),            
      valve: color(180),           
      water: color(100, 150, 255) 
    };
  }
  
  checkClick(mouseXRatio, mouseYRatio) {
    let centerX = this.xRatio * width;
    let centerY = this.yRatio * height;
    let hitboxWidth = this.bodyWidth * width;
    let hitboxHeight = (this.bodyHeight + this.capHeight) * height;
    
    return (
      mouseXRatio * width >= centerX - hitboxWidth / 2 &&
      mouseXRatio * width <= centerX + hitboxWidth / 2 &&
      mouseYRatio * height >= centerY &&
      mouseYRatio * height <= centerY + hitboxHeight
    );
  }
  
  handleClick(mouseXRatio, mouseYRatio) {
    if (this.checkClick(mouseXRatio, mouseYRatio)) {
      this.isActive = !this.isActive;
      return true;
    }
    return false;
  }
  
  update() {

    this.rotationAngle += this.isActive ? this.rotationSpeed : 0;
    
    if (!this.isActive) {
      this.particles = [];
      return;
    }
    
    if (this.particles.length < this.maxParticles) {
      let valveX = this.xRatio * width + (this.bodyWidth * width / 2);
      let valveY = this.yRatio * height + (this.bodyHeight * height / 2);
      
      let angle = this.rotationAngle + random(-0.2, 0.2);
      let speed = random(4, 6) * this.size;
      
      this.particles.push({
        x: valveX,
        y: valveY,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        alpha: 255,
        size: random(2, 4) * this.size
      });
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.vy += 0.2;  
      p.y += p.vy;
      p.alpha -= 3;
      
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  draw() {
    push();
    noStroke();
    
    let centerX = this.xRatio * width;
    let centerY = this.yRatio * height;
    
    fill(this.colors.body);
    rect(
      centerX - (this.bodyWidth * width) / 2,
      centerY,
      this.bodyWidth * width,
      this.bodyHeight * height,
      2
    );
    
    fill(this.colors.cap);
    rect(
      centerX - (this.capWidth * width) / 2,
      centerY,
      this.capWidth * width,
      this.capHeight * height,
      2
    );
    
    fill(this.colors.dome);
    arc(
      centerX,
      centerY,
      this.capWidth * width,
      this.domeHeight * height * 2,
      PI, TWO_PI,
      CHORD
    );
    
    push();
    fill(this.colors.valve);
    translate(
      centerX + (this.bodyWidth * width) / 4 + (this.valveWidth * width) / 2,
      centerY + (this.bodyHeight * height / 2)
    );
    rotate(this.rotationAngle);
    rect(
      -this.valveWidth * width / 2,
      -this.valveWidth * height / 2,
      this.valveWidth * width,
      this.valveWidth * height,
      2
    );
    pop();
    
    this.particles.forEach(p => {
      push();
      fill(red(this.colors.water), 
           green(this.colors.water), 
           blue(this.colors.water), 
           p.alpha);
      
      let angle = atan2(p.vy, p.vx);
      translate(p.x, p.y);
      rotate(angle);
      
      beginShape();
      vertex(0, -p.size/2);
      bezierVertex(
        p.size/2, -p.size/2,
        p.size/2, p.size/2,
        0, p.size
      );
      bezierVertex(
        -p.size/2, p.size/2,
        -p.size/2, -p.size/2,
        0, -p.size/2
      );
      endShape(CLOSE);
      pop();
    });
    
    pop();
  }
}

class Grass {
  constructor() {

    this.leftPoints = [
      { xRatio: 0.000, yRatio: 0.664 }, // P0
      { xRatio: 0.188, yRatio: 0.664 }, // P1
      { xRatio: 0.095, yRatio: 1.000 }, // P2
      { xRatio: 0.000, yRatio: 1.000 }  // P3
    ];

    this.rightPoints = [
      { xRatio: 0.812, yRatio: 0.664 }, // P0 (1 - 0.188)
      { xRatio: 1.000, yRatio: 0.664 }, // P1 (1 - 0.000)
      { xRatio: 1.000, yRatio: 1.000 }, // P2 (1 - 0.000)
      { xRatio: 0.905, yRatio: 1.000 }  // P3 (1 - 0.095)
    ];

    this.leftConfig = {
      grassDensity: 0.1,
      bladeMaxHeight: 0.04,
      bladeMinHeight: 0.02,
      growthFactor: 1.0 
    };

    this.rightConfig = {
      grassDensity: 0.1,
      bladeMaxHeight: 0.04,
      bladeMinHeight: 0.02,
      growthFactor: 1.0
    };
    
    this.commonConfig = {
      windSpeed: 0.02,
      windStrength: 0.3,
      noiseScale: 0.1,
      minGrassDensity: 0.02, 
      maxGrowthFactor: 2.0    
    };
    
    this.leftBounds = this.calculateBounds(this.leftPoints);
    this.rightBounds = this.calculateBounds(this.rightPoints);
    
    this.leftBlades = this.initializeBlades(this.leftPoints, this.leftBounds, this.leftConfig);
    this.rightBlades = this.initializeBlades(this.rightPoints, this.rightBounds, this.rightConfig);
    
    this.colors = {
      ground: color(34, 139, 34),
      blade: color(50, 205, 50),
      bladeDark: color(0, 100, 0)
    };
  }

  updateGrassState(side, isWatering) {
    let config = side === 'left' ? this.leftConfig : this.rightConfig;
    
    if (isWatering) {
      config.grassDensity = max(
        this.commonConfig.minGrassDensity,
        config.grassDensity * 0.999  
      );
      config.growthFactor = min(
        this.commonConfig.maxGrowthFactor,
        config.growthFactor * 1.001  
      );
      
      if (side === 'left') {
        this.leftBlades = this.initializeBlades(this.leftPoints, this.leftBounds, this.leftConfig);
      } else {
        this.rightBlades = this.initializeBlades(this.rightPoints, this.rightBounds, this.rightConfig);
      }
    }
  }

  initializeBlades(points, bounds, config) {
    let blades = [];
    let noiseOffset = random(1000);
    
    for (let x = bounds.minX; x <= bounds.maxX; x += config.grassDensity) {
      for (let y = bounds.minY; y <= bounds.maxY; y += config.grassDensity) {
        let noiseVal = noise(x * 10, y * 10 + noiseOffset);
        
        if (noiseVal > 0.3) {
          let xRatio = x;
          let yRatio = y;
          let actualX = xRatio * width;
          let actualY = yRatio * height;
          
          if (this.isPointInGrassArea(actualX, actualY, points)) {
            let adjustedMaxHeight = config.bladeMaxHeight * config.growthFactor;
            let adjustedMinHeight = config.bladeMinHeight * config.growthFactor;
            
            blades.push({
              x: xRatio,
              y: yRatio,
              height: map(noiseVal, 0.3, 1, adjustedMinHeight, adjustedMaxHeight),
              phase: random(TWO_PI),
              bend: random(0.1, 0.3)
            });
          }
        }
      }
    }
    
    return blades;
  }
  
  calculateBounds(points) {
    let minX = Math.min(...points.map(p => p.xRatio));
    let maxX = Math.max(...points.map(p => p.xRatio));
    let minY = Math.min(...points.map(p => p.yRatio));
    let maxY = Math.max(...points.map(p => p.yRatio));
    
    return {
      minX, maxX, minY, maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
initializeBlades(points, bounds, config) {
  let blades = [];
  let noiseOffset = random(1000);
  
  for (let x = bounds.minX; x <= bounds.maxX; x += config.grassDensity) {
      for (let y = bounds.minY; y <= bounds.maxY; y += config.grassDensity) {
          let noiseVal = noise(x * 10, y * 10 + noiseOffset);
          
          if (noiseVal > 0.3) {
              let xRatio = x;
              let yRatio = y;
              let actualX = xRatio * width;
              let actualY = yRatio * height;
              
              if (this.isPointInGrassArea(actualX, actualY, points)) {
                  blades.push({
                      x: xRatio,
                      y: yRatio,
                      height: map(noiseVal, 0.3, 1, 
                                config.bladeMinHeight * config.growthFactor,
                                config.bladeMaxHeight * config.growthFactor),
                      phase: random(TWO_PI),
                      bend: random(0.1, 0.3)
                  });
              }
          }
      }
  }
  
  return blades;
}
  
  isPointInGrassArea(x, y, points) {
    let totalPoints = points.length;
    let inside = false;
    
    for (let i = 0, j = totalPoints - 1; i < totalPoints; j = i++) {
      let xi = points[i].xRatio * width;
      let yi = points[i].yRatio * height;
      let xj = points[j].xRatio * width;
      let yj = points[j].yRatio * height;
      
      let intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  }
  
  drawBlade(blade, time) {
    let baseX = blade.x * width;
    let baseY = blade.y * height;
    
    push();
    translate(baseX, baseY);
    
    let wind = sin(time * this.commonConfig.windSpeed + blade.phase) * this.commonConfig.windStrength;
    let angle = wind * blade.bend;
    
    let noiseVal = noise(blade.x * 10, blade.y * 10, time * 0.5);
    angle += map(noiseVal, 0, 1, -0.2, 0.2);
    
    beginShape();
    noStroke();
    
    for (let i = 0; i <= 1; i += 0.1) {
        let t = i;
        let w = (1 - t) * 0.004 * width; 
        let h = -t * blade.height * height;
        let bendX = sin(t * PI/2) * angle * blade.height * width;
        
        let bladeColor = lerpColor(this.colors.blade, this.colors.bladeDark, t);
        fill(bladeColor);
        
        vertex(bendX - w/2, h);

        vertex(bendX + w/2, h);
    }
    
    endShape();
    pop();
  }
  
  draw() {
    push();
    
    fill(this.colors.ground);
    noStroke();
    beginShape();
    for (let point of this.leftPoints) {
      vertex(point.xRatio * width, point.yRatio * height);
    }
    endShape(CLOSE);
    
    beginShape();
    for (let point of this.rightPoints) {
      vertex(point.xRatio * width, point.yRatio * height);
    }
    endShape(CLOSE);
    
    let time = millis() / 1000;
    
    for (let blade of this.leftBlades) {
      this.drawBlade(blade, time);
    }
    
    for (let blade of this.rightBlades) {
      this.drawBlade(blade, time);
    }
    
    pop();
  }
}

class Flower {
  constructor(xRatio, yRatio) {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
    
    this.bloomSize = 0; 
    this.maxBloomSize = random(0.01, 0.03); 
    this.petals = floor(random(4, 7)); 
    this.petalColor = color(random(180, 255), random(100, 200), random(100, 200));
    this.stemLength = random(0.05, 0.08); 
    this.stemColor = color(35, 200, 100);
    this.blooming = true;
    this.rotationOffset = random(TWO_PI); 
    this.swayPhase = random(TWO_PI);   
  }

  update() {

    if (this.blooming && this.bloomSize < this.maxBloomSize) {
      this.bloomSize += 0.0005; 
    } else {
      this.blooming = false;
    }
  }

  display() {
    push();
    
    let x = this.xRatio * width;
    let y = this.yRatio * height;
    
    let time = millis() / 1000;
    let sway = sin(time + this.swayPhase) * 0.01;
    
    stroke(this.stemColor);
    strokeWeight(width * 0.002);
    let stemX = x + sway * width;
    let stemY = y + this.stemLength * height;
    line(stemX, y, stemX, stemY);
    
    noStroke();
    fill(30, 200, 50);
    push();
    translate(stemX, stemY - this.stemLength * height * 0.5);
    rotate(PI / 4 + sway);
    ellipse(0, 0, width * 0.01, width * 0.02);
    pop();
    
    push();
    translate(stemX, stemY - this.stemLength * height * 0.3);
    rotate(-PI / 4 + sway);
    ellipse(0, 0, width * 0.01, width * 0.02);
    pop();
    
    fill(this.petalColor);
    push();
    translate(stemX, y);
    rotate(this.rotationOffset + sway);
    
    let currentBloomSizeW = this.bloomSize * width;
    for (let i = 0; i < this.petals; i++) {
      rotate(TWO_PI / this.petals);
      ellipse(0, currentBloomSizeW * 0.25, 
              currentBloomSizeW * 0.5, 
              currentBloomSizeW);
    }
    
    fill(255, 204, 0);
    ellipse(0, 0, currentBloomSizeW * 0.3, currentBloomSizeW * 0.3);
    
    pop();
    pop();
  }

  static isValidLocation(xRatio, yRatio, leftPoints, rightPoints) {

    if (Flower.isPointInArea(xRatio, yRatio, leftPoints)) {
      return true;
    }

    if (Flower.isPointInArea(xRatio, yRatio, rightPoints)) {
      return true;
    }
    return false;
  }

  static isPointInArea(xRatio, yRatio, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      let xi = points[i].xRatio;
      let yi = points[i].yRatio;
      let xj = points[j].xRatio;
      let yj = points[j].yRatio;
      
      let intersect = ((yi > yRatio) !== (yj > yRatio))
          && (xRatio < (xj - xi) * (yRatio - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    return inside;
  }
}

class FlowerManager {
  constructor() {

    this.leftPoints = [
      { xRatio: 0.000, yRatio: 0.664 },
      { xRatio: 0.188, yRatio: 0.664 },
      { xRatio: 0.095, yRatio: 1.000 },
      { xRatio: 0.000, yRatio: 1.000 }
    ];

    this.rightPoints = [
      { xRatio: 0.812, yRatio: 0.664 },
      { xRatio: 1.000, yRatio: 0.664 },
      { xRatio: 1.000, yRatio: 1.000 },
      { xRatio: 0.905, yRatio: 1.000 }
    ];

    this.flowers = [];
  }

  handleClick(xRatio, yRatio) {

    if (Flower.isValidLocation(xRatio, yRatio, this.leftPoints, this.rightPoints)) {
      this.flowers.push(new Flower(xRatio, yRatio));
    }
  }

  update() {
    for (let flower of this.flowers) {
      flower.update();
    }
  }

  draw() {
    for (let flower of this.flowers) {
      flower.display();
    }
  }
}

class Car {
  constructor(baseSpeed) {

    this.isMovingRight = true;
    
    this.xRatio = 0;
    this.yRatio = 0.44;
    this.targetXRatio = 1;

    this.originalSpeed = baseSpeed * random(0.8, 1.2);
    this.currentSpeed = this.originalSpeed;
    
    this.width = 0.06;   
    this.height = 0.03;  

    this.isWaitingForLight = false;
    this.isWaitingForCar = false; 
    this.lightCheckPosition = 0.24;
    this.hasPassedLight = false;

    this.carColors = [
      color(220, 20, 60),   
      color(25, 25, 112),   
      color(0, 100, 0),      
      color(128, 128, 128),  
      color(25, 25, 25),    
      color(255, 140, 0),   
      color(139, 69, 19),    
      color(70, 130, 180),   
      color(255, 255, 255),  
      color(221, 160, 221)  
    ];
    
    this.color = this.carColors[floor(random(this.carColors.length))];
    
    this.wheelRotation = 0;  
    this.wheelSize = this.height * 0.5;  
    this.hubSize = this.wheelSize * 0.3; 
    this.spokeCount = 6; 
    
    this.useTwoTone = random() < 0.3; 
    if (this.useTwoTone) {
      this.secondaryColor = this.carColors[floor(random(this.carColors.length))];
      while (this.secondaryColor === this.color) { 
        this.secondaryColor = this.carColors[floor(random(this.carColors.length))];
      }
    }
    this.isWaitingForLight = false; 
    this.lightCheckPosition = 0.24; 
  }

  checkClick(mouseXRatio, mouseYRatio) {
    let x = this.xRatio * width;
    let y = this.yRatio * height;
    let w = this.width * width;
    let h = this.height * height;
    
    return (mouseXRatio * width >= x && 
            mouseXRatio * width <= x + w && 
            mouseYRatio * height >= y && 
            mouseYRatio * height <= y + h + h * 0.3);
  }

  shouldStop(trafficLight, carAhead, minGap) {

    if (this.hasPassedLight) {
      if (carAhead && this.getDistanceToCarAhead(carAhead) <= minGap) {
        this.isWaitingForCar = true;
        return true;
      }
      return false;
    }

    if (Math.abs(this.xRatio - this.lightCheckPosition) < 0.001) {

      if (!trafficLight || !trafficLight.isActive || trafficLight.currentState === 'green') {
        this.hasPassedLight = true;  
        return false;
      }
      this.isWaitingForLight = true;
      return true;
    }

    if (carAhead) {
    
      if (carAhead.isWaitingForLight || carAhead.isWaitingForCar) {
        const distance = this.getDistanceToCarAhead(carAhead);
        if (distance <= minGap) {
          this.isWaitingForCar = true;
          return true;
        }
      }
    }

    return this.isWaitingForLight || this.isWaitingForCar;
  }

  getDistanceToCarAhead(carAhead) {
    return carAhead.xRatio - this.xRatio
  }

  isFinished() {
    return this.xRatio >= this.targetXRatio;
  }

  update(trafficLight, carAhead, minGap) {
    if (this.xRatio < this.targetXRatio) {
      if (trafficLight && trafficLight.isActive && trafficLight.currentState === 'green') {
        this.isWaitingForLight = false;
   
        if (!carAhead || this.getDistanceToCarAhead(carAhead) > minGap) {
          this.isWaitingForCar = false;
        }
      }

      if (!this.shouldStop(trafficLight, carAhead, minGap)) {

        this.xRatio += this.currentSpeed;
        this.wheelRotation += (this.currentSpeed * width) / (this.wheelSize * width * PI) * TWO_PI;
        this.wheelRotation %= TWO_PI;
      }
    }
  }

  drawWheel(x, y) {
    push();
    translate(x, y);
    rotate(this.wheelRotation);
    
    fill(40);
    circle(0, 0, this.wheelSize * width);
    
    stroke(60);
    strokeWeight(2);
    let treadCount = 12;
    for (let i = 0; i < treadCount; i++) {
      let angle = i * TWO_PI / treadCount;
      let x1 = cos(angle) * this.wheelSize * width * 0.45;
      let y1 = sin(angle) * this.wheelSize * width * 0.45;
      let x2 = cos(angle) * this.wheelSize * width * 0.5;
      let y2 = sin(angle) * this.wheelSize * width * 0.5;
      line(x1, y1, x2, y2);
    }
    
    fill(180);
    noStroke();
    circle(0, 0, this.hubSize * width);
    
    stroke(120);
    strokeWeight(3);
    for (let i = 0; i < this.spokeCount; i++) {
      let angle = i * TWO_PI / this.spokeCount;
      let x = cos(angle) * this.hubSize * width * 0.45;
      let y = sin(angle) * this.hubSize * width * 0.45;
      line(0, 0, x, y);
    }
    
    fill(100);
    noStroke();
    circle(0, 0, this.hubSize * width * 0.2);
    
    pop();
  }

  draw() {
    push();
    
    let x = this.xRatio * width;
    let y = this.yRatio * height;
    let w = this.width * width;
    let h = this.height * height;
    
    fill(0, 0, 0, 30);
    noStroke();
    ellipse(x + w/2, y + h * 1.1, w * 0.9, h * 0.3);
    
    fill(this.color);
    noStroke();
    rect(x, y, w, h * 0.8, 5);
    
    fill(this.useTwoTone ? this.secondaryColor : this.color);
    beginShape();
    vertex(x + w * 0.2, y);
    vertex(x + w * 0.8, y);
    vertex(x + w * 0.7, y - h * 0.3);
    vertex(x + w * 0.3, y - h * 0.3);
    endShape(CLOSE);
    
    fill(200, 220, 255, 220);  // 略微透明的玻璃效果

    beginShape();
    vertex(x + w * 0.65, y);
    vertex(x + w * 0.75, y);
    vertex(x + w * 0.67, y - h * 0.25);
    vertex(x + w * 0.6, y - h * 0.25);
    endShape(CLOSE);

    beginShape();
    vertex(x + w * 0.25, y);
    vertex(x + w * 0.35, y);
    vertex(x + w * 0.4, y - h * 0.25);
    vertex(x + w * 0.33, y - h * 0.25);
    endShape(CLOSE);
    
    fill(255, 255, 200);
    rect(x + w * 0.9, y + h * 0.2, w * 0.08, h * 0.2, 2);

    fill(255, 0, 0);
    rect(x + w * 0.02, y + h * 0.2, w * 0.08, h * 0.2, 2);
    
    let wheelY = y + h * 0.7;
    this.drawWheel(x + w * 0.8, wheelY);
    this.drawWheel(x + w * 0.2, wheelY);
    
    pop();
  }
}

class CarReverse {
  constructor(baseSpeed) {
    this.xRatio = 1;
    this.yRatio = 0.52;
    this.targetXRatio = 0;
    
    this.originalSpeed = baseSpeed * random(0.8, 1.2);
    this.currentSpeed = this.originalSpeed;
    
    this.width = 0.06;   
    this.height = 0.03; 

    this.isWaitingForLight = false;
    this.isWaitingForCar = false;
    this.lightCheckPosition = 0.76; 
    this.hasPassedLight = false;

    this.carColors = [
      color(220, 20, 60),    
      color(25, 25, 112),   
      color(0, 100, 0),      
      color(128, 128, 128), 
      color(25, 25, 25),     
      color(255, 140, 0),    
      color(139, 69, 19),    
      color(70, 130, 180),  
      color(255, 255, 255), 
      color(221, 160, 221)
    ];
    
    this.color = this.carColors[floor(random(this.carColors.length))];
    
    this.wheelRotation = 0;
    this.wheelSize = this.height * 0.5;
    this.hubSize = this.wheelSize * 0.3;
    this.spokeCount = 6;
    
    this.useTwoTone = random() < 0.3;
    if (this.useTwoTone) {
      this.secondaryColor = this.carColors[floor(random(this.carColors.length))];
      while (this.secondaryColor === this.color) {
        this.secondaryColor = this.carColors[floor(random(this.carColors.length))];
      }
    }
  }

  checkClick(mouseXRatio, mouseYRatio) {
    let x = this.xRatio * width;
    let y = this.yRatio * height;
    let w = this.width * width;
    let h = this.height * height;
    
    return (mouseXRatio * width >= x && 
            mouseXRatio * width <= x + w && 
            mouseYRatio * height >= y && 
            mouseYRatio * height <= y + h + h * 0.3);
  }

  shouldStop(trafficLight, carAhead, minGap) {
    if (this.hasPassedLight) {
      if (carAhead && this.getDistanceToCarAhead(carAhead) <= minGap) {
        this.isWaitingForCar = true;
        return true;
      }
      return false;
    }

    if (Math.abs(this.xRatio - this.lightCheckPosition) < 0.001) {
      if (!trafficLight || !trafficLight.isActive || trafficLight.currentState === 'green') {
        this.hasPassedLight = true;
        return false;
      }
      this.isWaitingForLight = true;
      return true;
    }

    if (carAhead) {
      if (carAhead.isWaitingForLight || carAhead.isWaitingForCar) {
        const distance = this.getDistanceToCarAhead(carAhead);
        if (distance <= minGap) {
          this.isWaitingForCar = true;
          return true;
        }
      }
    }

    return this.isWaitingForLight || this.isWaitingForCar;
  }

  getDistanceToCarAhead(carAhead) {
    return this.xRatio - carAhead.xRatio;
  }

  isFinished() {
    return this.xRatio <= this.targetXRatio;
  }

  update(trafficLight, carAhead, minGap) {
    if (this.xRatio > this.targetXRatio) {
      if (trafficLight && trafficLight.isActive && trafficLight.currentState === 'green') {
        this.isWaitingForLight = false;
        if (!carAhead || this.getDistanceToCarAhead(carAhead) > minGap) {
          this.isWaitingForCar = false;
        }
      }

      if (!this.shouldStop(trafficLight, carAhead, minGap)) {
        this.xRatio -= this.currentSpeed;
        this.wheelRotation -= (this.currentSpeed * width) / (this.wheelSize * width * PI) * TWO_PI;
        this.wheelRotation %= TWO_PI;
      }
    }
  }

  drawWheel(x, y) {
    push();
    translate(x, y);
    rotate(this.wheelRotation);
    
    fill(40);
    circle(0, 0, this.wheelSize * width);
    
    stroke(60);
    strokeWeight(2);
    let treadCount = 12;
    for (let i = 0; i < treadCount; i++) {
      let angle = i * TWO_PI / treadCount;
      let x1 = cos(angle) * this.wheelSize * width * 0.45;
      let y1 = sin(angle) * this.wheelSize * width * 0.45;
      let x2 = cos(angle) * this.wheelSize * width * 0.5;
      let y2 = sin(angle) * this.wheelSize * width * 0.5;
      line(x1, y1, x2, y2);
    }
    
    fill(180);
    noStroke();
    circle(0, 0, this.hubSize * width);
    
    stroke(120);
    strokeWeight(3);
    for (let i = 0; i < this.spokeCount; i++) {
      let angle = i * TWO_PI / this.spokeCount;
      let x = cos(angle) * this.hubSize * width * 0.45;
      let y = sin(angle) * this.hubSize * width * 0.45;
      line(0, 0, x, y);
    }
    
    fill(100);
    noStroke();
    circle(0, 0, this.hubSize * width * 0.2);
    
    pop();
  }

  draw() {
    push();
    let x = this.xRatio * width;
    let y = this.yRatio * height;
    let w = this.width * width;
    let h = this.height * height;
    
    translate(x + w/2, y);
    scale(-1, 1);
    translate(-w/2, 0);
    
    fill(0, 0, 0, 30);
    noStroke();
    ellipse(w/2, h * 1.1, w * 0.9, h * 0.3);
    
    fill(this.color);
    noStroke();
    rect(0, 0, w, h * 0.8, 5);
    
    fill(this.useTwoTone ? this.secondaryColor : this.color);
    beginShape();
    vertex(w * 0.2, 0);
    vertex(w * 0.8, 0);
    vertex(w * 0.7, -h * 0.3);
    vertex(w * 0.3, -h * 0.3);
    endShape(CLOSE);
    
    fill(200, 220, 255, 220);
    beginShape();
    vertex(w * 0.65, 0);
    vertex(w * 0.75, 0);
    vertex(w * 0.67, -h * 0.25);
    vertex(w * 0.6, -h * 0.25);
    endShape(CLOSE);
    beginShape();
    vertex(w * 0.25, 0);
    vertex(w * 0.35, 0);
    vertex(w * 0.4, -h * 0.25);
    vertex(w * 0.33, -h * 0.25);
    endShape(CLOSE);
    
    fill(255, 255, 200);
    rect(w * 0.9, h * 0.2, w * 0.08, h * 0.2, 2);
    fill(255, 0, 0);
    rect(w * 0.02, h * 0.2, w * 0.08, h * 0.2, 2);
    
    let wheelY = h * 0.7;
    this.drawWheel(w * 0.8, wheelY);
    this.drawWheel(w * 0.2, wheelY);
    
    pop();
  }
}

class CarFleetManager {
  constructor(trafficLight) {
    this.cars = [];
    this.minGap = 0.08;       
    this.maxCars = 7;       
    this.spawnTimer = 0;
    this.spawnInterval = random(60, 120);
    this.baseSpeed = 0.002;  
    this.trafficLight = trafficLight;
  }

  checkClick(mouseXRatio, mouseYRatio) {
    for (let car of this.cars) {
      if (car.checkClick(mouseXRatio, mouseYRatio)) {
        return true;
      }
    }
    return false;
  }

  update() {

    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      const carAhead = i > 0 ? this.cars[i - 1] : null; 
      
      car.update(this.trafficLight, carAhead, this.minGap);

      if (carAhead && !car.isWaitingForLight && !car.isWaitingForCar) {
        const distance = carAhead.xRatio - car.xRatio;
        
        if (distance < this.minGap * 1.5) {
 
          car.currentSpeed = Math.min(
            car.currentSpeed,
            carAhead.currentSpeed * (distance / this.minGap)
          );
        } else {
     
          car.currentSpeed = Math.min(
            car.currentSpeed + 0.0001,
            car.originalSpeed
          );
        }
      }
      
      if (car.isFinished()) {
        this.cars.splice(i, 1);
      }
    }

    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval && this.cars.length < this.maxCars) {
      if (this.canSpawnNewCar()) {
        this.addNewCar();
        this.spawnTimer = 0;
        this.spawnInterval = random(60, 120);
      }
    }
  }

  canSpawnNewCar() {

    if (this.cars.length === 0) return true;
    
    const lastCar = this.cars[this.cars.length - 1];
    return lastCar.xRatio > this.minGap; 
  }

  addNewCar() {
    let car = new Car(this.baseSpeed);
    this.cars.push(car);
  }

  draw() {
    for (let car of this.cars) {
      car.draw();
    }
  }
}

class ReverseCarFleetManager {
  constructor(trafficLight) {
    this.cars = [];
    this.minGap = 0.08;
    this.maxCars = 7;
    this.spawnTimer = 0;
    this.spawnInterval = random(60, 120);
    this.baseSpeed = 0.002;
    this.trafficLight = trafficLight;
  }

  checkClick(mouseXRatio, mouseYRatio) {
    for (let car of this.cars) {
      if (car.checkClick(mouseXRatio, mouseYRatio)) {
        return true;
      }
    }
    return false;
  }

  update() {

    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      const carAhead = i > 0 ? this.cars[i - 1] : null;
      
      car.update(this.trafficLight, carAhead, this.minGap);

      if (carAhead && !car.isWaitingForLight && !car.isWaitingForCar) {
        const distance = car.getDistanceToCarAhead(carAhead);
        
        if (distance < this.minGap * 1.5) {
          car.currentSpeed = Math.min(
            car.currentSpeed,
            carAhead.currentSpeed * (distance / this.minGap)
          );
        } else {
          car.currentSpeed = Math.min(
            car.currentSpeed + 0.0001,
            car.originalSpeed
          );
        }
      }
      
      if (car.isFinished()) {
        this.cars.splice(i, 1);
      }
    }

    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval && this.cars.length < this.maxCars) {
      if (this.canSpawnNewCar()) {
        this.addNewCar();
        this.spawnTimer = 0;
        this.spawnInterval = random(60, 120);
      }
    }
  }

  canSpawnNewCar() {
    if (this.cars.length === 0) return true;
    const lastCar = this.cars[this.cars.length - 1];
    return lastCar.xRatio < (1 - this.minGap);
  }

  addNewCar() {
    let car = new CarReverse(this.baseSpeed);
    this.cars.push(car);
  }

  draw() {
    for (let car of this.cars) {
      car.draw();
    }
  }
}

class Pedestrian {
  constructor(baseSpeed, direction = 'left', routeName = PEDESTRIAN_CONFIG.defaults.route) {
    this.direction = direction;

    this.sizeScale = random(0.8, 1.2);

    const routeConfig = PEDESTRIAN_CONFIG.routes[routeName];
    const directionConfig = routeConfig[direction];
    const sizeConfig = routeConfig.size || PEDESTRIAN_CONFIG.defaults.size;
    this.yRatio = directionConfig.yRatio;
    this.lightCheckPosition = directionConfig.lightCheckPosition;
    
    if (direction === 'left') {
      this.xRatio = 1;
      this.targetXRatio = 0;
    } else {
      this.xRatio = 0;
      this.targetXRatio = 1;
    }
    
    this.originalSpeed = baseSpeed * random(0.8, 1.2) * (1.2 - this.sizeScale * 0.2);
    this.currentSpeed = this.originalSpeed;
    
    this.width = sizeConfig.width * this.sizeScale;
    this.height = sizeConfig.height * this.sizeScale;

    this.yRatio += (1 - this.sizeScale) * 0.1; 

    this.isWaitingForLight = false;
    this.hasPassedLight = false;

    this.stepPhase = 0;
    this.stepSpeed = 0.2;
    
    this.colors = {
      body: color(random(50, 200), random(50, 200), random(50, 200)),
      head: color(255, 220, 185),
      limbs: color(50)
    };
  }

  shouldStop(trafficLight) {
    if (this.hasPassedLight) return false;

    if (Math.abs(this.xRatio - this.lightCheckPosition) < 0.001) {
      if (!trafficLight || !trafficLight.isActive || trafficLight.currentState === 'red') {
        this.hasPassedLight = true;
        return false;
      }
      this.isWaitingForLight = true;
      return true;
    }

    return this.isWaitingForLight;
  }

  isFinished() {
    return this.direction === 'left' ? 
      this.xRatio <= this.targetXRatio : 
      this.xRatio >= this.targetXRatio;
  }

  update(trafficLight) {
    if (!this.isFinished()) {
      if (trafficLight && trafficLight.isActive && trafficLight.currentState === 'red') {
        this.isWaitingForLight = false;
      }

      if (!this.shouldStop(trafficLight)) {

        this.xRatio += this.currentSpeed * (this.direction === 'left' ? -1 : 1);
        
        this.stepPhase += this.stepSpeed;
        if (this.stepPhase > TWO_PI) {
          this.stepPhase -= TWO_PI;
        }
      }
    }
  }

  draw() {
    push();
    let x = this.xRatio * width;
    let y = this.yRatio * height;
    let w = this.width * width;
    let h = this.height * height;
    
    if (this.direction === 'right') {
      translate(x + w/2, y);
      scale(-1, 1);
      translate(-w/2, 0);
    } else {
      translate(x, y);
    }
    
    let legOffset = sin(this.stepPhase) * h * 0.2;

    fill(0, 0, 0, 30);
    noStroke();
    ellipse(w/2, h, w * 0.8, h * 0.1);
    
    stroke(this.colors.limbs);
    strokeWeight(2);

    line(w * 0.4, h * 0.5, 
         w * 0.3, h * 0.8 - legOffset);

    line(w * 0.6, h * 0.5,
         w * 0.7, h * 0.8 + legOffset);
    
    noStroke();
    fill(this.colors.body);
    rect(w * 0.3, h * 0.3, w * 0.4, h * 0.3);
    
    fill(this.colors.head);
    circle(w/2, h * 0.1, w * 0.6);

    fill(0);
    noStroke();

    let eyeSize = w * 0.08;
    circle(w * 0.4, h * 0.08, eyeSize);

    circle(w * 0.6, h * 0.08, eyeSize);
    
    fill(255);
    let pupilSize = eyeSize * 0.5;

    circle(w * 0.4 - pupilSize/4, h * 0.075, pupilSize);

    circle(w * 0.6 - pupilSize/4, h * 0.075, pupilSize);
    
    fill(0);
    circle(w * 0.5, h * 0.12, eyeSize * 0.8);
    
    stroke(this.colors.limbs);

    line(w * 0.4, h * 0.35,
         w * 0.2, h * 0.5 + legOffset);

    line(w * 0.6, h * 0.35,
         w * 0.8, h * 0.5 - legOffset);
    
    pop();
  }
}

class PedestrianManager {
  constructor(leftTrafficLight, rightTrafficLight, routeName = PEDESTRIAN_CONFIG.defaults.route) {
    this.pedestrians = [];
    this.routeName = routeName;
    const routeConfig = PEDESTRIAN_CONFIG.routes[routeName];
    this.maxPedestrians = routeConfig?.crowd?.maxPedestrians ?? 
    PEDESTRIAN_CONFIG.defaults.crowd.maxPedestrians;
    this.spawnTimer = 0;
    this.spawnInterval = random(30, 60);
    this.baseSpeed = 0.003;
    this.leftTrafficLight = leftTrafficLight;
    this.rightTrafficLight = rightTrafficLight;
  }

  update() {

    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const pedestrian = this.pedestrians[i];
 
      const relevantLight = pedestrian.direction === 'left' ? 
        this.rightTrafficLight : this.leftTrafficLight;
      
      pedestrian.update(relevantLight);
      
      if (pedestrian.isFinished()) {
        this.pedestrians.splice(i, 1);
      }
    }

    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval && this.pedestrians.length < this.maxPedestrians) {
      this.addNewPedestrian();
      this.spawnTimer = 0;
      this.spawnInterval = random(30, 60);
    }
  }

  addNewPedestrian() {

    const direction = random() < 0.5 ? 'left' : 'right';
    let pedestrian = new Pedestrian(this.baseSpeed, direction, this.routeName);
    this.pedestrians.push(pedestrian);
  }

  draw() {
    for (let pedestrian of this.pedestrians) {
      pedestrian.draw();
    }
  }
}

class CarHornSound {
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

class DoorBellSound {
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
class FountainSound {
  constructor(sound) {
    this.sound = sound;
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying && this.sound) {
      this.sound.setVolume(0.8); 
      this.sound.loop(); 
      this.isPlaying = true;
    }
  }

  stop() {
    if (this.isPlaying && this.sound) {
      this.sound.stop();
      this.isPlaying = false;
    }
  }
}


class CityScene {
  constructor(hornSounds, doorbellSounds, fountainSound) {
    this.carHornSound = new CarHornSound(hornSounds);
    this.doorBellSound = new DoorBellSound(doorbellSounds);

    this.fountainSound1 = new FountainSound(fountainSound);
    this.fountainSound2 = new FountainSound(fountainSound); 

    this.sky = new CitySky();
    this.road = new Road();
    // this.quadTest = new DraggableQuad(); 
    this.building = new Building();
    this.buildingRight = new BuildingRight();
    this.signpost = new Signpost();
    this.skyObject = new SkyObject(this.sky);
    this.trafficLightleft = new TrafficLight(0.26, 0.22, 1.0, 180);
    this.trafficLightRight = new TrafficLight(0.74, 0.38, 1.2, 0);
    this.trafficLightBot = new TrafficLight(0.28, 0.55, 1.5, 0);
    this.trafficLighTop = new TrafficLight(0.57, 0.23, 0.7, 0);

    this.streetLamps = [
      new StreetLamp(0.22, 0.22, 0.8, 'right'),  
      new StreetLamp(0.8, 0.35, 1.0, 'left'),   
      new StreetLamp(0.2, 0.5, 1.2, 'right'),  
      new StreetLamp(0.65, 0.2, 0.7, 'left')    
    ];
    this.carFleetManager = new CarFleetManager(this.trafficLightleft);
    this.reverseCarFleetManager = new ReverseCarFleetManager(this.trafficLightRight);
    this.pedestrianManagerBot = new PedestrianManager(this.trafficLightBot, this.trafficLightBot, 'bottom');
    this.pedestrianManagerTop = new PedestrianManager(this.trafficLighTop, this.trafficLighTop, 'top');
    this.fireHydrant1 = new FireHydrant(0.135, 0.828, 1.0);
    this.fireHydrant2 = new FireHydrant(0.865, 0.828, 1.0);
    this.grass = new Grass();
    this.flowerManager = new FlowerManager();

  }

  draw() {

    this.sky.update();
    this.sky.draw();
    
    this.skyObject.update();
    this.skyObject.draw();
    this.road.update(this.sky.getCurrentPhase());
    this.road.draw();
    this.signpost.draw();

    this.building.update(this.sky.getCurrentPhase());
    this.building.draw();
    this.buildingRight.draw();

    this.trafficLighTop.update();
    this.trafficLighTop.draw();
    this.pedestrianManagerTop.update();
    this.pedestrianManagerTop.draw();

    this.trafficLightleft.update();
    this.trafficLightleft.draw();
    this.trafficLightRight.update();
    this.trafficLightRight.draw();


    this.streetLamps.forEach(lamp => {
      lamp.update(this.sky.getCurrentPhase());
      lamp.draw();
    });

    this.carFleetManager.update();
    this.carFleetManager.draw();

    this.reverseCarFleetManager.update();
    this.reverseCarFleetManager.draw();

    if (this.fireHydrant1.isActive) {
      this.grass.updateGrassState('left', true);
    }
    if (this.fireHydrant2.isActive) {
      this.grass.updateGrassState('right', true);
    }

    this.grass.draw();
    this.pedestrianManagerBot.update();
    this.pedestrianManagerBot.draw();

    this.trafficLightBot.update();
    this.trafficLightBot.draw();

    this.fireHydrant1.update();
    this.fireHydrant1.draw();
    this.fireHydrant2.update();
    this.fireHydrant2.draw();
    this.flowerManager.update();
    this.flowerManager.draw();  
    // this.quadTest.draw();
  }

  handleMousePressed() {
    // this.quadTest.handleMousePressed();
    if (this.fireHydrant1.handleClick(mouseX / width, mouseY / height)) {
      this.grass.updateGrassState('left', this.fireHydrant1.isActive);

      if (this.fireHydrant1.isActive) {
        this.fountainSound1.play();
      } else {
        this.fountainSound1.stop();
      }
    }

    if (this.fireHydrant2.handleClick(mouseX / width, mouseY / height)) {
      this.grass.updateGrassState('right', this.fireHydrant2.isActive);
      if (this.fireHydrant2.isActive) {
        this.fountainSound2.play();
      } else {
        this.fountainSound2.stop();
      }
    }
    this.trafficLightleft.handleClick(mouseX / width, mouseY / height);
    this.trafficLightRight.handleClick(mouseX / width, mouseY / height);
    this.trafficLightBot.handleClick(mouseX / width, mouseY / height);
    this.trafficLighTop.handleClick(mouseX / width, mouseY / height);
    this.flowerManager.handleClick(mouseX / width, mouseY / height);

    if (this.carFleetManager.checkClick(mouseX / width, mouseY / height) || this.reverseCarFleetManager.checkClick(mouseX / width, mouseY / height)) {
      this.carHornSound.play();
    }

    if (this.building.checkDoorClick(mouseX / width, mouseY / height) || this.buildingRight.checkDoorClick(mouseX / width, mouseY / height)) {
      this.doorBellSound.play();
    }

    this.streetLamps.forEach(lamp => {
      lamp.handleClick(mouseX / width, mouseY / height);
    });
  }

  handleMouseDragged() {
    // this.quadTest.handleMouseDragged();
  }

  handleMouseReleased() {
    // this.quadTest.handleMouseReleased();
  }

  handleKeyPressed(key) {
    // if (key === 'h' || key === 'H') {
    //   this.quadTest.toggle();
    // }
    if (key === 's' || key === 'S') {
      const currentPhase = this.sky.getCurrentPhase();
      this.streetLamps.forEach(lamp => {
        lamp.resetToAutomatic(currentPhase);
      });
    }
  }
}