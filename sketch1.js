let handPose;
let video;
let hands = [];
let prevHandPosition = null;
let moveDirection = "检测中";
const MOVEMENT_THRESHOLD = 45;
let isDetecting = true;
let lastPauseTime = 0;
const PAUSE_DURATION = 1500; // 暂停1.5秒

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 绘制视频
  image(video, 0, 0, width, height);
  
  // 检查是否需要重新启动检测
  if (!isDetecting && millis() - lastPauseTime > PAUSE_DURATION) {
    handPose.detectStart(video, gotHands);
    isDetecting = true;
    moveDirection = "检测中";
    prevHandPosition = null;
  }
  
  // 检测和显示手部关键点
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
    // 计算手部中心点
    let centerX = 0;
    let centerY = 0;
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      centerX += keypoint.x;
      centerY += keypoint.y;
      
      // 绘制关键点
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
    centerX /= hand.keypoints.length;
    centerY /= hand.keypoints.length;
    
    // 只在检测状态下判断移动
    if (isDetecting && prevHandPosition) {
      let dx = centerX - prevHandPosition.x;
      let dy = centerY - prevHandPosition.y;
      
      // 只有当移动距离超过阈值时才更新方向并暂停检测
      if (Math.abs(dx) > MOVEMENT_THRESHOLD || Math.abs(dy) > MOVEMENT_THRESHOLD) {
        if (Math.abs(dx) > Math.abs(dy)) {
          moveDirection = dx > 0 ? "向右移动" : "向左移动";
        } else {
          moveDirection = dy > 0 ? "向下移动" : "向上移动";
        }
        // 检测到移动后暂停检测
        handPose.detectStop();
        isDetecting = false;
        lastPauseTime = millis();
      }
    }
    
    if (isDetecting) {
      prevHandPosition = {x: centerX, y: centerY};
    }
  }
  
  // 如果没有检测到手且正在检测中
  if (hands.length === 0 && isDetecting) {
    moveDirection = "检测中";
    prevHandPosition = null;
  }
  
  // 绘制状态文字
  fill(255);
  noStroke();
  textSize(32);
  textAlign(CENTER);
  text(moveDirection, width/2, height - 50);
  
  // 可选：显示调试信息
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(`检测状态: ${isDetecting ? "检测中" : "已暂停"}`, 10, 30);
  if (!isDetecting) {
    text(`重启倒计时: ${((PAUSE_DURATION - (millis() - lastPauseTime))/1000).toFixed(1)}s`, 10, 50);
  }
}

function gotHands(results) {
  hands = results;
}