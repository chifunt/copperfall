import { Component } from "/js/core/Component.js";
import { EasingFunctions } from "/js/utils/EasingFunctions.js";
import { Engine } from "../core/Engine.js";

export class ScreenShake extends Component {
    static instance = null;

    constructor() {
        if (ScreenShake.instance) {
            // Singleton guard
            return ScreenShake.instance;
        }
        super();
        ScreenShake.instance = this;

        // Instead of a queue, keep a list of active shakes
        this.activeShakes = [];

        // We’ll track the total offset from shakes so we can remove it each frame
        this.lastOffsetX = 0;
        this.lastOffsetY = 0;
    }

    /**
     * Triggers a new screen shake that will run independently
     * of other shakes.
     * @param {number} duration     - Total duration of the shake in seconds.
     * @param {number} blendInTime  - Time to ramp up the shake in seconds.
     * @param {number} blendOutTime - Time to ramp down the shake in seconds.
     * @param {number} amplitude    - Maximum shake offset.
     * @param {number} frequency    - Oscillations per second.
     */
    trigger(duration, blendInTime, blendOutTime, amplitude, frequency) {
        this.activeShakes.push({
            time: 0,          // Elapsed time for this shake
            duration,
            blendInTime,
            blendOutTime,
            amplitude,
            frequency
        });
    }

    /**
     * Update the screen shake effect each frame.
     * @param {number} deltaTime - Time elapsed since the last frame (seconds).
     */
    update(deltaTime) {
        // If there was any offset applied last frame, remove it before calculating a new one.
        const engine = Engine.instance;
        const camera = engine.camera;
        camera.position.x -= this.lastOffsetX;
        camera.position.y -= this.lastOffsetY;

        // We'll calculate the total offset from all active shakes
        let totalOffsetX = 0;
        let totalOffsetY = 0;

        // Update each active shake and accumulate offsets
        for (let i = this.activeShakes.length - 1; i >= 0; i--) {
            const shake = this.activeShakes[i];

            // Advance time
            shake.time += deltaTime;

            // If this shake is finished, remove it
            if (shake.time > shake.duration) {
                this.activeShakes.splice(i, 1);
                continue;
            }

            // Determine current amplitude based on blend-in/blend-out
            let currentAmplitude;
            if (shake.time < shake.blendInTime) {
                // Blend in
                currentAmplitude = EasingFunctions.easeOutQuad(shake.time / shake.blendInTime) * shake.amplitude;
            } else if (shake.time > (shake.duration - shake.blendOutTime)) {
                // Blend out
                const timeLeft = shake.duration - shake.time;
                currentAmplitude = EasingFunctions.easeInQuad(timeLeft / shake.blendOutTime) * shake.amplitude;
            } else {
                // Full amplitude
                currentAmplitude = shake.amplitude;
            }

            // Calculate shake offset using sine/cosine
            const shakeOffsetX = Math.sin(shake.time * shake.frequency * 2 * Math.PI) * currentAmplitude;
            const shakeOffsetY = Math.cos(shake.time * shake.frequency * 2 * Math.PI) * currentAmplitude;

            // Accumulate the offset
            totalOffsetX += shakeOffsetX;
            totalOffsetY += shakeOffsetY;
        }

        // Apply the total offset for this frame
        camera.position.x += totalOffsetX;
        camera.position.y += totalOffsetY;

        // Remember this offset so we can remove it next frame
        this.lastOffsetX = totalOffsetX;
        this.lastOffsetY = totalOffsetY;
    }
}
