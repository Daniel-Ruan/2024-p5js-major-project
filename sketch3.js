let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false, flipped: true};

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  image(video, 0, 0, width, height);
  
  if (faces.length > 0) {
    const face = faces[0];
    
    // 先绘制 box
    strokeWeight(2);          // 设置线条粗细
    stroke(255, 255, 0);     // 设置黄色边框
    noFill();
    rect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);
    
    // 在 box 边上显示尺寸信息
    fill(255, 255, 0);       // 黄色文字
    noStroke();
    textSize(12);
    text(`Width: ${Math.round(face.box.width)}px`, face.box.xMin, face.box.yMin - 5);
    text(`Height: ${Math.round(face.box.height)}px`, face.box.xMax + 5, face.box.yMin);
    
    // 重置线条粗细为默认值
    strokeWeight(1);
    
    // 记录所有存在的特征
    let availableFeatures = [];
    
    // 遍历face对象的所有属性
    for (let feature in face) {
      // 排除非特征属性（如box和keypoints）
      if (typeof face[feature] === 'object' && 
          face[feature] !== null && 
          'x' in face[feature] && 
          'y' in face[feature]) {
        availableFeatures.push(feature);
        
        // 绘制该特征的边界框
        noFill();
        stroke(random(255), random(255), random(255));
        rect(
          face[feature].x,
          face[feature].y,
          face[feature].width,
          face[feature].height
        );
        
        // 绘制特征名称
        fill(255);
        noStroke();
        textSize(10);
        text(feature, face[feature].x, face[feature].y - 5);
      }
    }
  }
}

function gotFaces(results) {
  faces = results;
  // 只在检测到面部时打印一次结构
  // if (results.length > 0) {
  //   console.log('faces[0] structure:', results[0]);
  //   console.log('Properties in faces[0]:', Object.keys(results[0]));
  //   // 打印每个属性的类型
  //   for (let prop in results[0]) {
  //     console.log(`${prop}:`, typeof results[0][prop]);
  //   }
  // }
}