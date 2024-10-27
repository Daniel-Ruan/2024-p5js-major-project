// city.js - 城市场景
function drawCityScene() {
  dayProgress += 0.01;
  let timeOfDay = (dayProgress % 1); // 0-1表示一天的时间循环
  
  // 根据时间设置天空颜色
  let skyColor;
  if (timeOfDay < 0.25) { // 凌晨
    skyColor = lerpColor(color(0, 0, 50), color(135, 206, 235), timeOfDay * 4);
  } else if (timeOfDay < 0.75) { // 白天
    skyColor = color(135, 206, 235);
  } else { // 傍晚到夜晚
    skyColor = lerpColor(color(135, 206, 235), color(0, 0, 50), (timeOfDay - 0.75) * 4);
  }
  background(skyColor);
  
  // 绘制建筑群
  for (let i = 0; i < 12; i++) {
    drawBuilding(width * i / 12, height, timeOfDay);
  }
  
  // 绘制马路
  fill(50);
  rect(0, height * 0.8, width, height * 0.2);
  
  // 绘制道路标线
  stroke(255);
  strokeWeight(4);
  for (let i = 0; i < width; i += 80) {
    line(i, height * 0.9, i + 40, height * 0.9);
  }
}

function drawBuilding(x, y, time) {
  push();
  let buildingHeight = random(150, 400);
  let buildingWidth = 80;
  
  // 建筑主体
  fill(100);
  rect(x, y - buildingHeight, buildingWidth, buildingHeight);
  
  // 窗户
  let windowColor;
  if (time < 0.25 || time > 0.75) {
    // 夜晚，部分窗户亮着
    windowColor = random() > 0.5 ? color(255, 255, 150) : color(50);
  } else {
    // 白天，窗户反射天空
    windowColor = color(200);
  }
  
  fill(windowColor);
  for (let i = 0; i < buildingHeight - 40; i += 30) {
    for (let j = 10; j < buildingWidth - 10; j += 30) {
      rect(x + j, y - buildingHeight + 20 + i, 20, 20);
    }
  }
  pop();
}