import { SpriteRenderer } from "./components/SpriteRenderer.js";
import { BackgroundRenderer } from "./components/BackgroundRenderer.js";
import { Engine } from "/js/core/Engine.js";
import { GameObject } from "/js/core/GameObject.js";
import { EasingFunctions } from "/js/utils/easing.js";

const engine = new Engine("canvas");

const background = new GameObject("Background");
background.addComponent(new BackgroundRenderer("black"));

const player = new GameObject("Player");

// Base scale and state tracking
player.baseScale = { x: 0.1, y: 0.1 }; // Initial scale values
player.scaleState = {
  targetFactor: 1.2,     // Target stretch factor (relative, e.g., 1.2 for stretching, 0.8 for squashing)
  elapsedTime: 0,        // Time passed since last state change
  duration: 0.5,         // Duration of each phase in seconds
  easingFunction: EasingFunctions.easeInOutQuad,
};

player.update = function (deltaTime) {
  // Handle rotation
  // this.transform.rotation += 360 * deltaTime; // Rotate 20 degrees per second
  if (this.transform.rotation >= 360) {
    this.transform.rotation -= 360;
  }

  // Handle squash-and-stretch scaling
  const state = this.scaleState;
  state.elapsedTime += deltaTime;

  // Calculate eased progress
  const rawProgress = Math.min(state.elapsedTime / state.duration, 1); // Clamp progress to [0, 1]
  const easedProgress = state.easingFunction(rawProgress); // Apply easing function

  // Interpolate between squashed and stretched factors
  const startFactor = state.targetFactor === 1.2 ? 0.8 : 1.2;
  const currentFactor = startFactor + (state.targetFactor - startFactor) * easedProgress;

  // Apply asymmetric scaling for squash-and-stretch
  this.transform.scale = {
    x: player.baseScale.x * currentFactor,                // Stretch along x-axis
    y: player.baseScale.y * (2 - currentFactor), // Squash along y-axis (inverse of x)
  };

  // If the transition is complete, swap the target factor and reset elapsed time
  if (rawProgress >= 1) {
    state.targetFactor = state.targetFactor === 1.2 ? 0.8 : 1.2; // Toggle between stretch and squash
    state.elapsedTime = 0; // Reset elapsed time
  }
};


const canvas = engine.canvas;
const ctx = canvas.getContext('2d');

player.transform.scale = { x: 0.1, y: 0.1 }
player.transform.position = { x: canvas.width / 2, y: canvas.height / 2 };


const img = new Image();
img.src = "/assets/images/rafli.png";
img.onload = () => {
  player.addComponent(new SpriteRenderer(img));
}

// // Destroy it after 3 seconds
// setTimeout(() => {
//     player.destroy();
//     console.log(`${player.name} marked for destruction`);
// }, 3000);

engine.start();