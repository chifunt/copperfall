import { Component } from "/js/core/Component.js";
import { SpriteRenderer } from "./SpriteRenderer.js";

/**
 * VerticalBob Component
 * Makes the GameObject's sprite move up and down indefinitely using a sine wave.
 */
export class VerticalBob extends Component {
    /**
     * Constructs the VerticalBob component.
     * @param {number} amplitude - The maximum distance (in units) the sprite moves up and down.
     * @param {number} frequency - The number of complete oscillations per second.
     * @param {function} [easingFunction] - Optional easing function to modify the motion curve.
     */
    constructor(amplitude = 10, frequency = 1, easingFunction = null) {
        super();
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.easingFunction = easingFunction; // Optional
        this.timer = 0;
        this.spriteRenderer = null;
    }

    /**
     * Called when the component is added to a GameObject.
     * Finds the SpriteRenderer component to apply the vertical offset.
     */
    start() {
        // Find the SpriteRenderer component
        this.spriteRenderer = this.gameObject.getComponent(SpriteRenderer);
        if (!this.spriteRenderer) {
            console.error("VerticalBob: SpriteRenderer component not found on the GameObject.");
        }
    }

    /**
     * Updates the vertical offset each frame to create a bobbing effect.
     * @param {number} deltaTime - Time elapsed since the last frame (in seconds).
     */
    update(deltaTime) {
        if (!this.spriteRenderer) return;

        // Increment the timer
        this.timer += deltaTime;

        // Calculate the vertical offset using a sine wave
        const angle = 2 * Math.PI * this.frequency * this.timer;
        let offset = this.amplitude * Math.sin(angle);

        // Apply easing function if provided (optional)
        if (this.easingFunction && typeof this.easingFunction === 'function') {
            // Normalize sine value to [0,1] before applying easing
            const normalizedSin = (Math.sin(angle) + 1) / 2;
            const easedSin = this.easingFunction(normalizedSin);
            offset = this.amplitude * (easedSin * 2 - 1); // Map back to [-amplitude, amplitude]
        }

        // Update the SpriteRenderer's vertical offset
        this.spriteRenderer.setVerticalOffset(offset);
    }
}
