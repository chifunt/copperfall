import { Component } from "../core/Component.js";
import { Engine } from "../core/Engine.js";

export class CompassIndicator extends Component {
    constructor({ target, distanceThreshold = 800 }) {
        super();
        this.target = target;
        this.distanceThreshold = distanceThreshold;

        // Appearance of the arrow in screen space
        this.arrowLength = 75;
        this.arrowWidth = 50;
        this.margin = 60;  // how close to the edges we clamp

        // Flag to show/hide the indicator entirely
        this.active = true;
    }

    /** Enable or disable this compass indicator. */
    setActive(isActive) {
        this.active = isActive;
    }

    /** Update the target GameObject to point at a different object. */
    setTarget(newTarget) {
        this.target = newTarget;
    }

    /**
     * Renders the arrow at the edge of the screen (rotated toward the target)
     */
    render(ctx) {
        if (!this.active || !this.target || !this.gameObject) return;

        // Grab positions
        const playerPos = this.gameObject.transform.position;
        const targetPos = this.target.transform.position;

        // Compute distance
        const dx = targetPos.x - playerPos.x;
        const dy = targetPos.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= this.distanceThreshold) return; // don't show if close

        // --- Convert the target's world position to screen space ---
        const engine = Engine.instance;
        const cam = engine.camera;
        const scale = cam.scale;

        const screenCenterX = engine.canvas.width / 2;
        const screenCenterY = engine.canvas.height / 2;

        const targetScreenX = (targetPos.x - cam.position.x) * scale + screenCenterX;
        const targetScreenY = (-targetPos.y + cam.position.y) * scale + screenCenterY;

        // Direction from center → target in screen space
        let dirX = targetScreenX - screenCenterX;
        let dirY = targetScreenY - screenCenterY;

        // If dir is zero (extremely unlikely here), bail out
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length < 0.001) return;

        // Normalize
        dirX /= length;
        dirY /= length;

        // --- Find intersection with bounding box [margin, margin, w-margin, h-margin] ---
        const left   = this.margin;
        const right  = engine.canvas.width  - this.margin;
        const top    = this.margin;
        const bottom = engine.canvas.height - this.margin;

        // We'll do a line param:  X(t) = centerX + t*dirX,  Y(t) = centerY + t*dirY
        // We want the smallest t > 0 that hits one of the 4 edges.

        // For each vertical boundary, solve: centerX + t*dirX = boundary
        // Then check if the Y(t) is within top..bottom
        const tCandidates = [];

        // If dirX != 0, check left/right
        if (Math.abs(dirX) > 0.0001) {
            // t at left edge
            const tLeft = (left - screenCenterX) / dirX;
            if (tLeft > 0) { // only forward
                const yLeft = screenCenterY + tLeft * dirY;
                if (yLeft >= top && yLeft <= bottom) {
                    tCandidates.push(tLeft);
                }
            }
            // t at right edge
            const tRight = (right - screenCenterX) / dirX;
            if (tRight > 0) {
                const yRight = screenCenterY + tRight * dirY;
                if (yRight >= top && yRight <= bottom) {
                    tCandidates.push(tRight);
                }
            }
        }

        // If dirY != 0, check top/bottom
        if (Math.abs(dirY) > 0.0001) {
            // t at top edge
            const tTop = (top - screenCenterY) / dirY;
            if (tTop > 0) {
                const xTop = screenCenterX + tTop * dirX;
                if (xTop >= left && xTop <= right) {
                    tCandidates.push(tTop);
                }
            }
            // t at bottom edge
            const tBottom = (bottom - screenCenterY) / dirY;
            if (tBottom > 0) {
                const xBottom = screenCenterX + tBottom * dirX;
                if (xBottom >= left && xBottom <= right) {
                    tCandidates.push(tBottom);
                }
            }
        }

        // If we found no valid intersection, just skip
        if (tCandidates.length === 0) return;

        // We want the SMALLEST t > 0 among them => earliest intersection
        const tFinal = Math.min(...tCandidates);

        // Intersection coordinates
        const arrowX = screenCenterX + tFinal * dirX;
        const arrowY = screenCenterY + tFinal * dirY;

        // --- Now rotate the arrow to point in dirX, dirY ---
        // Because our shape "points up" (negative Y), we compute the angle with standard atan2
        // but we invert Y to match that shape's orientation
        const angleToTarget = Math.atan2(dirY, dirX);

        // Draw the arrow
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angleToTarget + Math.PI / 2);
        // Our triangle by default has its tip at negative Y, so if you want it pointing "forward"
        // (the direction of dirX,dirY), rotate by +angleToTarget instead of -angleToTarget,
        // or tweak your path below.

        // Triangle shape
        ctx.beginPath();
        // Tip at (0, -arrowLength)
        ctx.moveTo(0, -this.arrowLength);
        // Base left
        ctx.lineTo(-this.arrowWidth, 0);
        // Base right
        ctx.lineTo(this.arrowWidth, 0);
        ctx.closePath();

        // Fill & stroke
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}
