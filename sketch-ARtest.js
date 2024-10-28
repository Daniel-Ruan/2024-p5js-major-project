let handPose;
let faceMesh;
let video;
let hands = [];
let faces = [];
let prevHandPosition = null;
let currentStatus = "Detecting";
let lastMoveDirection = "None";
let scaleDirection = "Detecting";
const MOVEMENT_THRESHOLD = 30;
let prevPinchDistance = 0;
const PINCH_THRESHOLD = 10;
let dynapuffFont;

function preload() {
  // Initialize both models
  handPose = ml5.handPose({
    maxHands: 1,
    modelType: "full"
  }, {flipped: true});
  
  faceMesh = ml5.faceMesh({ 
    maxFaces: 1, 
    refineLandmarks: true, 
    flipHorizontal: false, 
    flipped: false
  }, {flipped: true});
  
  dynapuffFont = loadFont('assets/DynaPuff[wdth,wght].ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  
  // Start both detections
  handPose.detectStart(video, gotHands);
  faceMesh.detectStart(video, gotFaces);
  
  textFont(dynapuffFont);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Draw video stretched to canvas size
  image(video, 0, 0, width, height);

  // Scale factors
  let scaleX = width / 640;
  let scaleY = height / 480;

  // Draw face detection results
  drawFaceDetection(scaleX, scaleY);
  
  // Draw hand detection results
  drawHandDetection(scaleX, scaleY);

  // Draw status information
  drawStatusInfo();
}

function drawFaceDetection(scaleX, scaleY) {
  if (faces.length > 0) {
    const face = faces[0];
    
    // Scale the face box coordinates
    const scaledBox = {
      xMin: face.box.xMin * scaleX,
      yMin: face.box.yMin * scaleY,
      width: face.box.width * scaleX,
      height: face.box.height * scaleY,
      xMax: (face.box.xMin + face.box.width) * scaleX
    };
    
    // Draw face box
    strokeWeight(width * 0.003); // Responsive stroke weight
    stroke(255, 255, 0);
    noFill();
    rect(scaledBox.xMin, scaledBox.yMin, scaledBox.width, scaledBox.height);
    
    // Draw box dimensions
    fill(255, 255, 0);
    noStroke();
    textSize(width * 0.015); // Responsive text size
    text(`Width: ${Math.round(scaledBox.width)}px`, scaledBox.xMin, scaledBox.yMin - 5);
    text(`Height: ${Math.round(scaledBox.height)}px`, scaledBox.xMax + 5, scaledBox.yMin);
    
    // Draw facial features
    for (let feature in face) {
      if (typeof face[feature] === 'object' && 
          face[feature] !== null && 
          'x' in face[feature] && 
          'y' in face[feature]) {
        
        // Scale feature coordinates
        const scaledFeature = {
          x: face[feature].x * scaleX,
          y: face[feature].y * scaleY,
          width: face[feature].width * scaleX,
          height: face[feature].height * scaleY
        };
        
        // Draw feature box
        noFill();
        stroke(random(255), random(255), random(255));
        rect(
          scaledFeature.x,
          scaledFeature.y,
          scaledFeature.width,
          scaledFeature.height
        );
        
        // Draw feature label
        fill(255);
        noStroke();
        textSize(width * 0.012); // Responsive text size
        text(feature, scaledFeature.x, scaledFeature.y - 5);
      }
    }
  }
}

function drawHandDetection(scaleX, scaleY) {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
    // Get scaled keypoints
    let thumb = scalePoint(hand.thumb_tip, scaleX, scaleY);
    let indexFinger = scalePoint(hand.index_finger_tip, scaleX, scaleY);
    let wrist = scalePoint(hand.wrist, scaleX, scaleY);
    
    // Draw keypoints
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = scalePoint(hand.keypoints[j], scaleX, scaleY);
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, width * 0.015);
    }

    // Draw wrist point
    fill(255, 0, 0);
    noStroke();
    circle(wrist.x, wrist.y, width * 0.02);
    
    // Calculate and draw pinch
    let currentPinchDistance = dist(thumb.x, thumb.y, indexFinger.x, indexFinger.y);
    let pinchCenterX = (thumb.x + indexFinger.x) / 2;
    let pinchCenterY = (thumb.y + indexFinger.y) / 2;
    
    fill(0, 255, 0, 200);
    stroke(0);
    strokeWeight(width * 0.003);
    circle(pinchCenterX, pinchCenterY, currentPinchDistance);

    // Update scale direction
    if (prevPinchDistance > 0) {
      if (Math.abs(currentPinchDistance - prevPinchDistance) > PINCH_THRESHOLD) {
        scaleDirection = currentPinchDistance > prevPinchDistance ? "Zoom In" : "Zoom Out";
      }
    }
    prevPinchDistance = currentPinchDistance;

    // Update movement direction
    if (prevHandPosition) {
      let dx = wrist.x - prevHandPosition.x;
      let dy = wrist.y - prevHandPosition.y;

      if (Math.abs(dx) > MOVEMENT_THRESHOLD * scaleX || Math.abs(dy) > MOVEMENT_THRESHOLD * scaleY) {
        currentStatus = "Moving";
        if (Math.abs(dx) > Math.abs(dy)) {
          lastMoveDirection = dx > 0 ? "Right" : "Left";
        } else {
          lastMoveDirection = dy > 0 ? "Down" : "Up";
        }
      } else {
        currentStatus = "Static";
      }
    }
    
    prevHandPosition = {x: wrist.x, y: wrist.y};
  }

  // Reset detection status if no hands
  if (hands.length === 0) {
    currentStatus = "Detecting";
    scaleDirection = "Detecting";
    prevHandPosition = null;
    prevPinchDistance = 0;
  }
}

function drawStatusInfo() {
  fill(255);
  noStroke();
  textSize(width * 0.03);
  textAlign(CENTER);
  
  text(`Current Status: ${currentStatus}`, width/2, height - height * 0.25);
  text(`Last Move: ${lastMoveDirection}`, width/2, height - height * 0.15);
  text(scaleDirection, width/2, height - height * 0.05);
}

function scalePoint(point, scaleX, scaleY) {
  return {
    x: point.x * scaleX,
    y: point.y * scaleY
  };
}

function gotHands(results) {
  hands = results;
}

function gotFaces(results) {
  faces = results;
}