import { Component } from "../core/Component.js";
import { Engine } from "../core/Engine.js";

export class CompassIndicator extends Component {
    /**
     * @param {Object} config
     * @param {GameObject} config.target           - The GameObject to point at.
     * @param {number} config.distanceThreshold    - Hide the arrow if closer than this distance.
     */
    constructor({ target, distanceThreshold = 800 }) {
        super();
        this.target = target;
        this.distanceThreshold = distanceThreshold;

        // Appearance of the arrow in screen space
        this.arrowLength = 75; // The “length” from base to tip
        this.arrowWidth = 50;  // The base width of the triangle
        this.margin = 30;      // How close to the screen edge we clamp the arrow

        // Flag to show/hide the indicator entirely
        this.active = true;
    }

    /**
     * Enable or disable this compass indicator. When inactive, it won't render.
     * @param {boolean} isActive
     */
    setActive(isActive) {
        this.active = isActive;
    }

    /**
     * Update the target GameObject to point at a different object.
     * @param {GameObject} newTarget
     */
    setTarget(newTarget) {
        this.target = newTarget;
    }

    /**
     * Renders the arrow at the edge of the screen (rotated toward the target)
     */
    render(ctx) {
        // If it's not active or no valid target, exit
        if (!this.active || !this.target || !this.gameObject) return;

        // Grab positions
        const playerPos = this.gameObject.transform.position;
        const targetPos = this.target.transform.position;

        // Compute distance
        const dx = targetPos.x - playerPos.x;
        const dy = targetPos.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only show if we’re beyond the threshold
        if (distance <= this.distanceThreshold) {
            return;
        }

        // Get engine references
        const engine = Engine.instance;
        const cam = engine.camera;
        const scale = cam.scale;

        // Compute screen center
        const screenCenterX = engine.canvas.width / 2;
        const screenCenterY = engine.canvas.height / 2;

        // World → screen transform for the target
        const targetScreenX = (targetPos.x - cam.position.x) * scale + screenCenterX;
        const targetScreenY = (-targetPos.y + cam.position.y) * scale + screenCenterY;

        // Angle from screen center to target in screen space
        const angleToTarget = Math.atan2(
            screenCenterY - targetScreenY, // notice the Y inversion
            targetScreenX - screenCenterX
        );

        // We want to clamp our arrow to the edge of the screen
        // so it never appears off screen
        const halfW = engine.canvas.width / 2 - this.margin;
        const halfH = engine.canvas.height / 2 - this.margin;

        const cos = Math.cos(angleToTarget);
        const sin = Math.sin(angleToTarget);

        // Attempt horizontal intersection
        let arrowX = screenCenterX + cos * halfW;
        let arrowY = screenCenterY - sin * halfW; // “-sin” because Y is inverted in your engine

        // If that Y is out of vertical bounds, clamp vertically
        if (arrowY < this.margin || arrowY > engine.canvas.height - this.margin) {
            arrowX = screenCenterX + cos * halfH;
            arrowY = screenCenterY - sin * halfH;
        }

        // Draw the arrow with rotation so it points “up”
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(-angleToTarget);
        // We use “-angleToTarget” because our local shape “points up” in negative-Y
        // given the rendering setup.

        // Draw a simple triangle
        ctx.beginPath();
        // Tip of the arrow at (0, -arrowLength)
        ctx.moveTo(0, -this.arrowLength);
        // Base left
        ctx.lineTo(-this.arrowWidth, 0);
        // Base right
        ctx.lineTo(this.arrowWidth, 0);
        ctx.closePath();

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fill();

        // Outline
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}
