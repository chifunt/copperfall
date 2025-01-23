import { Component } from "../core/Component.js";
import { Engine } from "../core/Engine.js";

export class CompassIndicator extends Component {
    constructor({ target, distanceThreshold = 800 }) {
        super();
        this.target = target;
        this.distanceThreshold = distanceThreshold;

        // These values are now in "virtual" units
        this.arrowLength = 20;  // e.g. 75 units tall in virtual space
        this.arrowWidth  = 10;  // e.g. 20 units wide at the base
        this.margin      = 50;  // how close (in virtual units) to keep from screen edges

        this.active = true; // Flag to fully hide/show the indicator
    }

    setActive(isActive) {
        this.active = isActive;
    }

    setTarget(newTarget) {
        this.target = newTarget;
    }

    render(ctx) {
        if (!this.active || !this.target || !this.gameObject) return;

        // Grab positions in world space
        const playerPos = this.gameObject.transform.position;
        const targetPos = this.target.transform.position;

        // Check distance in world units
        const dx = targetPos.x - playerPos.x;
        const dy = targetPos.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= this.distanceThreshold) return; // arrow is hidden if too close

        // Get engine references
        const engine = Engine.instance;
        const cam = engine.camera;
        const scale = cam.scale;  // how many screen pixels per 1 virtual unit

        const screenCenterX = engine.canvas.width  / 2;
        const screenCenterY = engine.canvas.height / 2;

        // Convert target from world to screen coords
        const targetScreenX = (targetPos.x - cam.position.x) * scale + screenCenterX;
        const targetScreenY = (-targetPos.y + cam.position.y) * scale + screenCenterY;

        // Direction from center to target (in screen space)
        let dirX = targetScreenX - screenCenterX;
        let dirY = targetScreenY - screenCenterY;

        // If direction is ~0, bail
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length < 0.001) return;

        // Normalize the screen-space direction
        dirX /= length;
        dirY /= length;

        // --- Convert our "virtual" margin into actual pixels ---
        const marginPx = this.margin * scale;

        // Define the bounding box in pixels, shrunk by marginPx
        const left   = marginPx;
        const right  = engine.canvas.width  - marginPx;
        const top    = marginPx;
        const bottom = engine.canvas.height - marginPx;

        // We’ll find t for the ray from (screenCenterX, screenCenterY) in direction (dirX, dirY)
        const tCandidates = [];

        // If dirX != 0, find intersection with left/right
        if (Math.abs(dirX) > 0.0001) {
            const tLeft = (left - screenCenterX) / dirX;
            if (tLeft > 0) {
                const yLeft = screenCenterY + tLeft * dirY;
                if (yLeft >= top && yLeft <= bottom) {
                    tCandidates.push(tLeft);
                }
            }
            const tRight = (right - screenCenterX) / dirX;
            if (tRight > 0) {
                const yRight = screenCenterY + tRight * dirY;
                if (yRight >= top && yRight <= bottom) {
                    tCandidates.push(tRight);
                }
            }
        }

        // If dirY != 0, find intersection with top/bottom
        if (Math.abs(dirY) > 0.0001) {
            const tTop = (top - screenCenterY) / dirY;
            if (tTop > 0) {
                const xTop = screenCenterX + tTop * dirX;
                if (xTop >= left && xTop <= right) {
                    tCandidates.push(tTop);
                }
            }
            const tBottom = (bottom - screenCenterY) / dirY;
            if (tBottom > 0) {
                const xBottom = screenCenterX + tBottom * dirX;
                if (xBottom >= left && xBottom <= right) {
                    tCandidates.push(tBottom);
                }
            }
        }

        if (!tCandidates.length) return;

        // Smallest positive t => earliest intersection
        const tFinal = Math.min(...tCandidates);

        // Intersection point in screen space
        const arrowX = screenCenterX + tFinal * dirX;
        const arrowY = screenCenterY + tFinal * dirY;

        // --- Determine orientation ---
        // Our triangle is drawn "pointing up" (negative Y) in local space,
        // but we want it pointing along (dirX, dirY) in screen space.
        // We'll do standard angle = atan2(dirY, dirX),
        // then add 90° (Math.PI/2) because "0°" in canvas is along +X axis,
        // but our triangle's tip is drawn along -Y axis.
        const angleToTarget = Math.atan2(dirY, dirX);

        // --- Convert arrow size from virtual to pixels ---
        const arrowPxLength = this.arrowLength * scale;
        const arrowPxWidth  = this.arrowWidth  * scale;

        // Draw the arrow
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angleToTarget + Math.PI / 2);

        // Triangle path: tip at (0, -arrowPxLength) in local coords
        ctx.beginPath();
        ctx.moveTo(0, -arrowPxLength);
        ctx.lineTo(-arrowPxWidth, 0);
        ctx.lineTo( arrowPxWidth, 0);
        ctx.closePath();

        ctx.fillStyle   = "rgba(255, 0, 0, 0.5)";
        ctx.strokeStyle = "black";
        ctx.lineWidth   = 2;

        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
