// ARControl.js
class ARControlScene {
  constructor(handPoseModel, faceMeshModel, videoOpacity) {

    this.handPoseModel = handPoseModel;
    this.faceMeshModel = faceMeshModel;
    this.opacity = videoOpacity;

    this.video = null;
    this.hands = [];
    this.faces = [];
    this.prevHandPosition = null;
    this.currentStatus = "Detecting";
    this.lastMoveDirection = "None";  
    this.scaleDirection = "Detecting";
    this.MOVEMENT_THRESHOLD = 30;
    this.prevPinchDistance = 0;
    this.PINCH_THRESHOLD = 10;
    this.isDetecting = false;

    this.thumbPosition = null;
    this.indexFingerPosition = null;
    this.middleFingerPosition = null;
    this.ringFingerPosition = null;
    this.pinkyPosition = null;

    this.fingerMetrics = {
      thumb: { width: 0, height: 0},
      index: { width: 0, height: 0},
      middle: { width: 0, height: 0},
      ring: { width: 0, height: 0},
      pinky: { width: 0, height: 0}
    };

    this.lipsMetrics = {
      width: 0,
      height: 0,
      ratio: 0
    };
    this.lipsStatus = "Detecting";

    this.prevFacePosition = null;
    this.faceCurrentStatus = "Detecting";
    this.faceLastMoveDirection = "Detecting";
    this.FACE_MOVEMENT_THRESHOLD = 50;

    this.scaleHistory = [];
    this.lastCheckedScale = null;
    this.MAX_SCALE_HISTORY = 3;

    this.moveHistory = [];
    this.lastCheckedDirection = null;
    this.MAX_HISTORY = 3;

    this.statusInfoOpacity = 255;

    this.setup();
  }
  
  setup() {
    // Create video element
    this.video = createCapture(VIDEO, {flipped: true});
    this.video.size(1920, 1080);
    this.video.hide();
    
  }

  startDetect() {
    // Start detection with the passed models
    if (this.video) {

      console.log("Starting detection...");   
      this.handPoseModel.detectStart(this.video, this.gotHands.bind(this));
      this.faceMeshModel.detectStart(this.video, this.gotFaces.bind(this));
      this.isDetecting = true;

    }
  }

  stopDetect() {
    console.log("Stopping detection...");
    this.handPoseModel.detectStop();
    this.faceMeshModel.detectStop();

    this.hands = [];
    this.faces = [];
    this.prevHandPosition = null;
    this.currentStatus = "Detecting";
    this.lastMoveDirection = "None";
    this.scaleDirection = "Detecting";
    this.prevPinchDistance = 0;
    
    this.thumbPosition = null;
    this.indexFingerPosition = null;
    this.middleFingerPosition = null;
    this.ringFingerPosition = null;
    this.pinkyPosition = null;

    this.lipsMetrics = {
      width: 0,
      height: 0,
      ratio: 0
    };
    this.lipsStatus = "Detecting";
    
    this.prevFacePosition = null;
    this.faceCurrentStatus = "Detecting";
    this.faceLastMoveDirection = "Detecting";
    this.FACE_MOVEMENT_THRESHOLD = 30;

    this.moveHistory = [];
    this.lastCheckedDirection = null;
    this.MAX_HISTORY = 3;

    this.scaleHistory = [];
    this.lastCheckedScale = null;
    this.MAX_SCALE_HISTORY = 3;

    this.statusInfoOpacity = 255;
    this.isDetecting = false;
  }
  
  draw() {
    if (!this.video) return;

    push();

    tint(255, this.opacity);

    image(this.video, 0, 0, width, height);

    // Scale factors
    let scaleX = width / 1920;
    let scaleY = height / 1080;

    if (this.isDetecting) {

      this.drawFaceDetection(scaleX, scaleY);
      
      // Draw hand detection results
      this.drawHandDetection(scaleX, scaleY);

      // Draw status information
      this.drawStatusInfo();

    }

    pop();
  }
  
  drawFaceDetection(scaleX, scaleY) {
    if (this.faces.length > 0) {
      const face = this.faces[0];

      this.measureLips(face, scaleX, scaleY);
      
      // Scale the face box coordinates
      const scaledBox = {
        xMin: face.box.xMin * scaleX,
        yMin: face.box.yMin * scaleY,
        width: face.box.width * scaleX,
        height: face.box.height * scaleY,
        xMax: (face.box.xMin + face.box.width) * scaleX
      };

      const faceCenterX = scaledBox.xMin + (scaledBox.width / 2);
      const faceCenterY = scaledBox.yMin + (scaledBox.height / 2);
      const currentFacePosition = { x: faceCenterX, y: faceCenterY };
      // 检测头部移动
      if (this.prevFacePosition) {
        let dx = currentFacePosition.x - this.prevFacePosition.x;
        let dy = currentFacePosition.y - this.prevFacePosition.y;

        if (Math.abs(dx) > this.FACE_MOVEMENT_THRESHOLD * scaleX || 
            Math.abs(dy) > this.FACE_MOVEMENT_THRESHOLD * scaleY) {
          this.faceCurrentStatus = "Moving";
          if (Math.abs(dx) > Math.abs(dy)) {
            this.faceLastMoveDirection = dx > 0 ? "Right" : "Left";
          } else {
            this.faceLastMoveDirection = dy > 0 ? "Down" : "Up";
          }
        } else {
          this.faceCurrentStatus = "Static";
        }
      }

      this.prevFacePosition = currentFacePosition;

      push();

      const alpha = this.statusInfoOpacity;
      // Draw face box
      strokeWeight(width * 0.003);
      stroke(255, 255, 0, alpha);
      noFill();
      rect(scaledBox.xMin, scaledBox.yMin, scaledBox.width, scaledBox.height);
      
      // Draw box dimensions
      fill(255, 255, 0, alpha);
      noStroke();
      textSize(width * 0.015);
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
          stroke(random(255), random(255), random(255), alpha);
          rect(
            scaledFeature.x,
            scaledFeature.y,
            scaledFeature.width,
            scaledFeature.height
          );
          
          // Draw feature label
          fill(255, 255, 0, alpha);
          noStroke();
          textSize(width * 0.012);
          text(feature, scaledFeature.x, scaledFeature.y - 5);
        }
      }
      pop();
    } else {
      this.lipsMetrics = {
        width: 0,
        height: 0,
        ratio: 0
      };
      this.lipsStatus = "Detecting";

      this.prevFacePosition = null;
      this.faceCurrentStatus = "Detecting";
      this.faceLastMoveDirection = "Detecting";
      this.FACE_MOVEMENT_THRESHOLD = 30;

      this.moveHistory = [];
      this.lastCheckedDirection = null;
      this.MAX_HISTORY = 3;
    }

  }
  
  drawHandDetection(scaleX, scaleY) {
    for (let i = 0; i < this.hands.length; i++) {
      let hand = this.hands[i];
      
      // Get scaled keypoints
      this.thumbPosition = this.scalePoint(hand.thumb_tip, scaleX, scaleY);
      this.indexFingerPosition = this.scalePoint(hand.index_finger_tip, scaleX, scaleY);
      this.middleFingerPosition = this.scalePoint(hand.middle_finger_tip, scaleX, scaleY);
      this.ringFingerPosition = this.scalePoint(hand.ring_finger_tip, scaleX, scaleY);
      this.pinkyPosition = this.scalePoint(hand.pinky_finger_tip, scaleX, scaleY);
      let wrist = this.scalePoint(hand.wrist, scaleX, scaleY);
    
      push();

      const alpha = this.statusInfoOpacity;

      // Draw keypoints
      for (let j = 0; j < hand.keypoints.length; j++) {
        let keypoint = this.scalePoint(hand.keypoints[j], scaleX, scaleY);
        fill(0, 255, 0, alpha);
        noStroke();
        circle(keypoint.x, keypoint.y, width * 0.015);
      }

      // Draw wrist point
      fill(255, 0, 0, alpha);
      noStroke();
      circle(wrist.x, wrist.y, width * 0.02);
      
      // Calculate and draw pinch
      let currentPinchDistance = dist(this.thumbPosition.x, this.thumbPosition.y, this.indexFingerPosition.x, this.indexFingerPosition.y);
      let pinchCenterX = (this.thumbPosition.x + this.indexFingerPosition.x) / 2;
      let pinchCenterY = (this.thumbPosition.y + this.indexFingerPosition.y) / 2;
      
      fill(0, 255, 0, alpha);
      stroke(0, 0, 0, alpha);
      strokeWeight(width * 0.003);
      circle(pinchCenterX, pinchCenterY, currentPinchDistance);

      // Update scale direction
      if (this.prevPinchDistance > 0) {
        if (Math.abs(currentPinchDistance - this.prevPinchDistance) > this.PINCH_THRESHOLD) {
          this.scaleDirection = currentPinchDistance > this.prevPinchDistance ? "Zoom In" : "Zoom Out";
        }
      }
      this.prevPinchDistance = currentPinchDistance;

      // Update movement direction
      if (this.prevHandPosition) {
        let dx = wrist.x - this.prevHandPosition.x;
        let dy = wrist.y - this.prevHandPosition.y;

        if (Math.abs(dx) > this.MOVEMENT_THRESHOLD * scaleX || Math.abs(dy) > this.MOVEMENT_THRESHOLD * scaleY) {
          this.currentStatus = "Moving";
          if (Math.abs(dx) > Math.abs(dy)) {
            this.lastMoveDirection = dx > 0 ? "Right" : "Left";
          } else {
            this.lastMoveDirection = dy > 0 ? "Down" : "Up";
          }
        } else {
          this.currentStatus = "Static";
        }
      }
      
      this.prevHandPosition = {x: wrist.x, y: wrist.y};

      pop();
    }

    // Reset detection status if no hands
    if (this.hands.length === 0) {
      this.currentStatus = "Detecting";
      this.scaleDirection = "Detecting";
      this.prevHandPosition = null;
      this.prevPinchDistance = 0;

      this.thumbPosition = null;
      this.indexFingerPosition = null;
      this.middleFingerPosition = null;
      this.ringFingerPosition = null;
      this.pinkyPosition = null;
    }

    this.measureCurrentFingerPoint();
  }
  
  drawStatusInfo() {
    const alpha = this.statusInfoOpacity;
    fill(255,255, 255, alpha);
    noStroke();
    textSize(width * 0.02);
    textAlign(CENTER);
    
    let yPos = height * 0.03;
    const lineHeight = height * 0.03;
    
    text(`Current Status: ${this.currentStatus}`, width/2, yPos);
    yPos += lineHeight;
    text(`Last Move: ${this.lastMoveDirection}`, width/2, yPos);
    yPos += lineHeight;
    text(this.scaleDirection, width/2, yPos);
    yPos += lineHeight;
    text(`Lips Status: ${this.lipsStatus}`, width/2, yPos);
    yPos += lineHeight;
    text(`Face Status: ${this.faceCurrentStatus}`, width/2, yPos);
    yPos += lineHeight;
    text(`Face Movement: ${this.faceLastMoveDirection}`, width/2, yPos);

  }
  
  scalePoint(point, scaleX, scaleY) {
    return {
      x: point.x * scaleX,
      y: point.y * scaleY
    };
  }

  measureLips(face, scaleX, scaleY) {
    if (face.lips) {
      const width = Math.round(face.lips.width * scaleX);
      const height = Math.round(face.lips.height * scaleY);
      const ratio = Math.round((face.lips.width * scaleX) / (face.lips.height * scaleY) * 100) / 100;
      
      this.lipsMetrics = { width, height, ratio };
      
      if (ratio >= 2.5 && ratio <= 6) {
        this.lipsStatus = "Closed";
      } else if (ratio >= 1.8 && ratio < 2.5) {
        this.lipsStatus = "Small";
      } else if (ratio >= 1.2 && ratio < 1.8) {
        this.lipsStatus = "Medium";
      } else if (ratio >= 0.5 && ratio < 1.2) {
        this.lipsStatus = "Large";
      } else {
        this.lipsStatus = "Detecting";
      }
    }
    
  }


  measureCurrentFingerPoint() {

    if (this.hands.length > 0) {
      const fingerPositions = {
        thumb: this.thumbPosition,
        index: this.indexFingerPosition,
        middle: this.middleFingerPosition,
        ring: this.ringFingerPosition,
        pinky: this.pinkyPosition
      };

      for (let fingerType in fingerPositions) {
        const position = fingerPositions[fingerType];
        
        if (position) {

          const relativeWidth = position.x / width;

          const relativeHeight = position.y / height;

          this.fingerMetrics[fingerType] = {
            width: Math.round(relativeWidth * 100) / 100,
            height: Math.round(relativeHeight * 100) / 100,
          };
        }
      }
    } else {

      for (let fingerType in this.fingerMetrics) {
        this.fingerMetrics[fingerType] = {
          width: 0,
          height: 0,
        };
      }
    }
  }

  checkRecentMovements() {

    if (this.faceCurrentStatus === "Detecting") {
      this.moveHistory = [];
      this.lastCheckedDirection = null;
      return;
    }

    if (this.faceLastMoveDirection !== this.lastCheckedDirection && 
        this.faceLastMoveDirection !== "Detecting" && 
        this.faceCurrentStatus === "Moving") {
      
      this.moveHistory.push(this.faceLastMoveDirection);
      
      if (this.moveHistory.length > this.MAX_HISTORY) {
        this.moveHistory.shift(); 
      }

      this.lastCheckedDirection = this.faceLastMoveDirection;

      if (this.moveHistory.length === this.MAX_HISTORY) {

        const horizontalMoves = this.moveHistory.filter(dir => dir === "Left" || dir === "Right").length;
        const verticalMoves = this.moveHistory.filter(dir => dir === "Up" || dir === "Down").length;

        if (horizontalMoves >= 2) {
          this.moveHistory = [];
          return false;
        }

        else if (verticalMoves >= 2) {
          this.moveHistory = [];
          return true;
        }
      }
    }
  }

  checkRecentScaling() {

    if (this.scaleDirection === "Detecting") {
      this.scaleHistory = [];
      this.lastCheckedScale = null;
      return;
    }

    if (this.scaleDirection !== this.lastCheckedScale && 
        this.scaleDirection !== "Detecting") {
      
      this.scaleHistory.push(this.scaleDirection);

      if (this.scaleHistory.length > this.MAX_SCALE_HISTORY) {
        this.scaleHistory.shift();
      }

      this.lastCheckedScale = this.scaleDirection;

      if (this.scaleHistory.length === this.MAX_SCALE_HISTORY) {

        const zoomInCount = this.scaleHistory.filter(dir => dir === "Zoom In").length;
        const zoomOutCount = this.scaleHistory.filter(dir => dir === "Zoom Out").length;

        if (zoomInCount + zoomOutCount === 3) {
          this.scaleHistory = []; 
          this.lastCheckedScale = null;
          return true;
        }
      }
    }
    return false;
  }

  toggleStatusInfoOpacity() {
    if (this.isDetecting) {
      this.statusInfoOpacity = this.statusInfoOpacity === 255 ? 0 : 255;
    }
  }
  
  gotHands(results) {
    this.hands = results;
  }
  
  gotFaces(results) {
    this.faces = results;
  }

}