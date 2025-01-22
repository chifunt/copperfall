import { Component } from "/js/core/Component.js";
import { EasingFunctions } from "/js/utils/EasingFunctions.js";
import { Engine } from "../core/Engine.js";

export class ScreenShake extends Component {
    static instance = null; // Singleton instance

    constructor(config = {}) {
        if (ScreenShake.instance) {
            console.warn("ScreenShake is a singleton and has already been created.");
            return ScreenShake.instance;
        }

        super();
        ScreenShake.instance = this;

        // Initialize configuration with defaults
        this.currentShake = null; // Current active shake
        this.shakeQueue = [];      // Queue of pending shakes
        this.shakeTime = 0;        // Elapsed time for current shake
        this.isShaking = false;    // Shake active flag
    }

    /**
     * Triggers a screen shake with specified parameters.
     * @param {number} duration - Total duration of the shake in seconds.
     * @param {number} blendInTime - Time to ramp up the shake in seconds.
     * @param {number} blendOutTime - Time to ramp down the shake in seconds.
     * @param {number} amplitude - Maximum shake offset.
     * @param {number} frequency - Oscillations per second.
     */
    trigger(duration, blendInTime, blendOutTime, amplitude, frequency) {
        const shakeParams = { duration, blendInTime, blendOutTime, amplitude, frequency };
        this.shakeQueue.push(shakeParams);
    }

    /**
     * Initiates the next shake in the queue if not currently shaking.
     */
    initiateNextShake() {
        if (this.isShaking || this.shakeQueue.length === 0) return;

        this.currentShake = this.shakeQueue.shift();
        this.shakeTime = 0;
        this.isShaking = true;

        // Destructure shake parameters
        const { duration, blendInTime, blendOutTime, amplitude, frequency } = this.currentShake;
        this.duration = duration;
        this.blendInTime = blendInTime;
        this.blendOutTime = blendOutTime;
        this.amplitude = amplitude;
        this.frequency = frequency;
    }

    /**
     * Updates the screen shake effect each frame.
     * @param {number} deltaTime - Time elapsed since the last frame.
     */
    update(deltaTime) {
        // Initiate the next shake if available
        this.initiateNextShake();

        if (!this.isShaking) return;

        this.shakeTime += deltaTime;

        if (this.shakeTime > this.duration) {
            this.isShaking = false;
            this.currentShake = null;
            return;
        }

        // Calculate progress ratio
        let progress = this.shakeTime / this.duration;

        // Determine current amplitude based on blend-in and blend-out
        if (this.shakeTime < this.blendInTime) {
            // Blend in
            this.currentAmplitude = EasingFunctions.easeOutQuad(this.shakeTime / this.blendInTime) * this.amplitude;
        } else if (this.shakeTime > (this.duration - this.blendOutTime)) {
            // Blend out
            const timeLeft = this.duration - this.shakeTime;
            this.currentAmplitude = EasingFunctions.easeInQuad(timeLeft / this.blendOutTime) * this.amplitude;
        } else {
            // Full amplitude
            this.currentAmplitude = this.amplitude;
        }

        // Calculate shake offset using sine and cosine waves
        const shakeOffsetX = Math.sin(this.shakeTime * this.frequency * 2 * Math.PI) * this.currentAmplitude;
        const shakeOffsetY = Math.cos(this.shakeTime * this.frequency * 2 * Math.PI) * this.currentAmplitude;

        // Apply shake to camera position
        const engine = Engine.instance;
        const camera = engine.camera;

        // Add the shake offset to the current camera position
        camera.position.x += shakeOffsetX;
        camera.position.y += shakeOffsetY;
    }
}
