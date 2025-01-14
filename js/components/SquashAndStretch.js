import { Component } from "/js/core/Component.js";

export class SquashAndStretch extends Component {
  constructor(config = {}) {
    super();
    this.squashScale = config.squashScale || 0.8;
    this.stretchScale = config.stretchScale || 1.2;
    this.easingFunction = config.easingFunction || ((t) => t); // Default to linear easing
    this.duration = config.duration || 0.5;
    this.loop = config.loop !== undefined ? config.loop : true; // Looping by default
    this.running = true; // Animation state
    this.elapsedTime = 0; // Internal timer
    this.targetFactor = this.stretchScale; // Initial target
    this.baseScale = null;
  }

  update(deltaTime) {
    if (!this.running) return; // Skip updates if stopped

    this.elapsedTime += deltaTime;

    // Calculate eased progress
    const rawProgress = Math.min(this.elapsedTime / this.duration, 1); // Clamp progress to [0, 1]
    const easedProgress = this.easingFunction(rawProgress);

    // Interpolate between squash and stretch
    const startFactor = this.targetFactor === this.stretchScale ? this.squashScale : this.stretchScale;
    const currentFactor = startFactor + (this.targetFactor - startFactor) * easedProgress;

    // Apply asymmetric scaling
    this.gameObject.transform.scale = {
      x: this.baseScale.x * currentFactor,
      y: this.baseScale.y * (2 - currentFactor), // Inverse scaling
    };

    // Handle loop or stop animation
    if (rawProgress >= 1) {
      if (this.loop) {
        this.targetFactor = this.targetFactor === this.stretchScale ? this.squashScale : this.stretchScale;
        this.elapsedTime = 0; // Reset timer for next cycle
      } else {
        this.running = false; // Stop if not looping
      }
    }
  }

  // Method to stop the animation
  stop() {
    this.running = false;
    if (this.baseScale) {
      // Revert to the base scale
      this.gameObject.transform.scale = { ...this.baseScale };
    }
  }

  // Method to start/restart the animation
  start() {
    if (!this.baseScale) {
      const { x, y } = this.gameObject.transform.scale;
      this.baseScale = { x, y };
    }
    this.running = true;
    this.elapsedTime = 0; // Reset timer
  }
}