let handPose;
let video;
let hands = [];
let prevHandPosition = null;
let currentStatus = "Detecting";
let lastMoveDirection = "None";
let scaleDirection = "Detecting";
const MOVEMENT_THRESHOLD = 30;
let prevPinchDistance = 0;
const PINCH_THRESHOLD = 10;
let dynapuffFont;

function preload() {
  handPose = ml5.handPose({
    maxHands: 1,
    modelType: "full"
  }, {flipped: true});
  
  dynapuffFont = loadFont('assets/DynaPuff[wdth,wght].ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480); // Keep original video capture size
  video.hide();
  handPose.detectStart(video, gotHands);
  textFont(dynapuffFont);
}

// Add window resize handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Draw video stretched to canvas size
  image(video, 0, 0, width, height);

  // Scale factor for hand keypoints
  let scaleX = width / 640;
  let scaleY = height / 480;

  // Detect and display hand keypoints
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
    // Get keypoints
    let thumb = scalePoint(hand.thumb_tip, scaleX, scaleY);
    let indexFinger = scalePoint(hand.index_finger_tip, scaleX, scaleY);
    let wrist = scalePoint(hand.wrist, scaleX, scaleY);
    
    // Draw all keypoints
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = scalePoint(hand.keypoints[j], scaleX, scaleY);
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, width * 0.015); // Responsive circle size
    }

    // Specially mark the wrist point
    fill(255, 0, 0);
    noStroke();
    circle(wrist.x, wrist.y, width * 0.02); // Responsive circle size
    
    // Calculate pinch distance (scaled)
    let currentPinchDistance = dist(thumb.x, thumb.y, indexFinger.x, indexFinger.y);
    
    // Draw circle between pinch points
    let pinchCenterX = (thumb.x + indexFinger.x) / 2;
    let pinchCenterY = (thumb.y + indexFinger.y) / 2;
    fill(0, 255, 0, 200);
    stroke(0);
    strokeWeight(width * 0.003); // Responsive stroke weight
    circle(pinchCenterX, pinchCenterY, currentPinchDistance);

    // Determine scaling direction
    if (prevPinchDistance > 0) {
      if (Math.abs(currentPinchDistance - prevPinchDistance) > PINCH_THRESHOLD) {
        scaleDirection = currentPinchDistance > prevPinchDistance ? "Zoom In" : "Zoom Out";
      }
    }
    prevPinchDistance = currentPinchDistance;

    // Determine movement direction
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

  // If no hand is detected
  if (hands.length === 0) {
    currentStatus = "Detecting";
    scaleDirection = "Detecting";
    prevHandPosition = null;
    prevPinchDistance = 0;
  }

  // Draw status text
  fill(255);
  noStroke();
  textSize(width * 0.03); // Responsive text size
  textAlign(CENTER);
  
  // Display status texts at relative positions
  text(`Current Status: ${currentStatus}`, width/2, height - height * 0.25);
  text(`Last Move: ${lastMoveDirection}`, width/2, height - height * 0.15);
  text(scaleDirection, width/2, height - height * 0.05);
}

// Helper function to scale points based on canvas size
function scalePoint(point, scaleX, scaleY) {
  return {
    x: point.x * scaleX,
    y: point.y * scaleY
  };
}

function gotHands(results) {
  hands = results;
}