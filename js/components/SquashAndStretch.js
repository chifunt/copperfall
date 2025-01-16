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
    const currentFactor = this.interpolate(easedProgress);
    this.applyScale(currentFactor);

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

  // Helper method for interpolation
  interpolate(progress) {
    const startFactor = this.targetFactor === this.stretchScale ? this.squashScale : this.stretchScale;
    return startFactor + (this.targetFactor - startFactor) * progress;
  }

  // Helper method to apply the scale
  applyScale(currentFactor) {
    this.gameObject.transform.scale = {
      x: this.baseScale.x * currentFactor,
      y: this.baseScale.y * (2 - currentFactor), // Inverse scaling
    };
  }

  setConfig(config = {}) {
    if (config.duration !== undefined && config.duration !== this.duration) {
      const oldDuration = this.duration;
      this.duration = config.duration;

      // Adjust elapsed time proportionally to the new duration
      this.elapsedTime = (this.elapsedTime / oldDuration) * this.duration;
    }

    if (config.squashScale !== undefined && config.squashScale !== this.squashScale) {
      this.squashScale = config.squashScale;

      // Update target factor and reset progress
      const progress = this.elapsedTime / this.duration;
      const currentFactor = this.interpolate(progress);
      this.targetFactor = this.targetFactor === this.stretchScale ? this.squashScale : this.stretchScale;

      // Reapply current scale based on new factor
      this.applyScale(currentFactor);
    }

    if (config.stretchScale !== undefined && config.stretchScale !== this.stretchScale) {
      this.stretchScale = config.stretchScale;

      // Update target factor and reset progress
      const progress = this.elapsedTime / this.duration;
      const currentFactor = this.interpolate(progress);
      this.targetFactor = this.targetFactor === this.stretchScale ? this.squashScale : this.stretchScale;

      // Reapply current scale based on new factor
      this.applyScale(currentFactor);
    }

    if (config.easingFunction !== undefined) {
      this.easingFunction = config.easingFunction;
    }

    if (config.loop !== undefined) {
      this.loop = config.loop;
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