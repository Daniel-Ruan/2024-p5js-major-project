# instructions

- **Main Menu Controls and Settings:**

  - Toggle Help Text: Press H
  - Video Window: Press V to show/hide
  - Screenshot: Press SPACEBAR
  - Reset Everything: Press R
  - Main Menu: Press W or UP arrow
  - Scene Navigation: Use LEFT/RIGHT arrow keys
  - Black Cursor Size: Control with mouse wheel
  - AR Status: Press F to show/hide detection info
  - AR Toggle: Click button or press C

  **AR Control Setup:**

  1. Camera Requirements:
     - Webcam must be enabled
     - Good lighting recommended
     - Position camera to capture both hands and face
     - Default finger tracking uses middle finger
     - Switch fingers using number keys 1(thumb), 2(index), 3(middle), 4(ring), 5(pinky)

  **Scene 1: Interactive Rainforest** *Traditional Controls:*

  - Wind Effects:
    - Hold A: Create leftward wind
    - Hold D: Create rightward wind
    - Release keys to stop wind
  - Rain Control:
    - Press S: Toggle rain on/off
    - Press Q: Decrease raindrop size
    - Press E: Increase raindrop size
  - Object Interaction:
    - Click coconuts to make them fall
    - Click and drag rocks
    - Click puddles for splash effects

  *AR Gesture Controls:*

  - Weather Control:
    - Hand wave left/right: Create directional winds
    - Hand wave up/down: Stop wind
    - Mouth opening: Controls rain (larger= heavier rain, close = no rain)
  - Object Manipulation:
    - Move black cursor with finger tracking
    - Coconuts: Move cursor to them to trigger falling
    - Puddles: Double pinch gesture (thumb+index) over them
    - Rocks:
      1. Position cursor over rock
      2. Decrease thumb-index distance to grab
      3. Move hand to desired location
      4. Increase thumb-index distance to release
      5. Try dropping rocks into puddles!

  **Scene 2: Interactive City** *Traditional Controls:*

  - Traffic System:
    - Hold S: Reset all streetlights
    - Click traffic lights to toggle
    - Click streetlights to toggle
  - Environmental:
    - Click cars/doors for horn sounds
    - Click fire hydrant to spray water
    - Click grass to grow flowers
  - Dynamic Elements:
    - Watch cars respond to traffic light changes
    - Observe day/night cycle transitions
    - Monitor pedestrian movements

  *AR Gesture Controls:*

  - Object Interaction Methods:
    1. Sensitive Method:
       - Position cursor over object
       - Double pinch gesture (thumb+index)
    2. Alternative Method:
       - Position cursor over object
       - Nod head several times
       - Note: Less sensitive

  **Special Features:**

  - Combine multiple weather effects in rainforest
  - Create flower patterns in city scene
  - Experiment with different finger controls
  - Watch for environmental transitions
  - Try all interaction methods for full experience

  **Project Structure Description**

  The project consists of 4 key JavaScript files, each handling different aspects of the interactive artwork:

  **1. sketch.js (Main Application)**

  - Core functionality and initialization:
    - Handles preloading of assets (images, sounds, fonts)
    - Setup of canvas and scenes
    - Main draw loop
  - Global controls management:
    - Keyboard and mouse event handlers
    - Scene switching logic
    - AR control toggles
    - Help text display
  - Global state management:
    - Scene counter
    - AR detection status
    - Camera/video settings
    - Finger tracking settings

  **2. ARControl.js (AR Interaction)**

  - AR detection and processing:
    - Hand pose detection using ml5.js (tfjs model)
    - Face mesh detection using ml5.js (tfjs model)
    - Camera input handling
  - Gesture recognition:
    - Hand movement tracking
    - Finger pinch detection
    - Head movement detection
    - Mouth state detection
  - AR visualization:
    - Black cursor rendering
    - Detection status display
    - Video window management

  **3. rainforest.js (Rainforest Environment)**

  - Environmental elements:
    - Wind simulation
    - Rain system
    - Weather effects
  - Interactive objects:
    - Coconuts
    - Rocks
    - Water puddles
  - Interaction handling:
    - Mouse/keyboard controls
    - AR gesture responses
    - Sound effect management

  **4. city.js (Urban Environment)**

  - City infrastructure:
    - Traffic light system
    - Street lighting
    - Road and sidewalk layout
  - Interactive elements:
    - Vehicles
    - Pedestrians
    - Fire hydrants
    - Grass and flowers
  - System management:
    - Traffic flow control
    - Day/night cycle
    - Sound effects
    - Mouse/AR interaction handling

  **Integration Points:**

  - All scenes communicate through the main sketch.js
  - AR controls interface with both environment scenes
  - Shared resource management (sounds, images)
  - Consistent interaction patterns across scenes

  This modular structure allows for:

  - Clear separation of concerns
  - Easy maintenance and updates
  - Efficient resource management
  - Smooth scene transitions
  - Consistent interaction patterns