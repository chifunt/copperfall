import { Component } from "/js/core/Component.js";
import { Engine } from "/js/core/Engine.js";
import { EasingFunctions } from "/js/utils/easing.js";

export class CameraFollow extends Component {
  /**
   * @param {Object} config
   * @param {GameObject} config.target           The GameObject to follow (e.g., player)
   * @param {number} [config.smoothness]        How quickly the camera catches up. 0.1 = slow, 1.0 = instant
   * @param {number} [config.lookAheadDist]     How far ahead (in world units) to look in the direction of travel
   * @param {Function} [config.easingFunction]  Easing function to apply. Defaults to linear.
   */
  constructor(config = {}) {
    super();
    this.target = config.target;
    this.smoothness = config.smoothness ?? 0.1;
    this.lookAheadDist = config.lookAheadDist ?? 0;
    this.easingFunction = config.easingFunction || EasingFunctions.easeInOutQuad;
    this.lastTargetPos = { x: 0, y: 0 };
    this.lastDir = { x: 1, y: 0 }; // Default direction
  }

  update(deltaTime) {
    if (!this.target) return;

    const engine = Engine.instance;
    const camera = engine.camera;

    // Current target position
    const tx = this.target.transform.position.x;
    const ty = this.target.transform.position.y;

    // Calculate movement since last frame
    const dx = tx - this.lastTargetPos.x;
    const dy = ty - this.lastTargetPos.y;
    const distMoved = Math.sqrt(dx * dx + dy * dy);
    let dirX = this.lastDir.x;
    let dirY = this.lastDir.y;

    // Update direction if the target has moved significantly
    if (distMoved > 0.0001) {
      dirX = dx / distMoved;
      dirY = dy / distMoved;
      this.lastDir.x = dirX;
      this.lastDir.y = dirY;
    }

    // Calculate look-ahead offset
    const lookX = dirX * this.lookAheadDist;
    const lookY = dirY * this.lookAheadDist;

    // Desired camera position = target position + look-ahead
    const desiredX = tx + lookX;
    const desiredY = ty + lookY;

    // Current camera position
    const currentX = camera.position.x;
    const currentY = camera.position.y;

    // Calculate the difference
    const deltaCamX = desiredX - currentX;
    const deltaCamY = desiredY - currentY;

    // Apply easing function to smoothness
    const t = Math.min(this.smoothness, 1); // Clamp t to [0,1]
    const easedT = this.easingFunction(t);

    // Interpolate camera position towards desired position using easedT
    const nextX = currentX + deltaCamX * easedT;
    const nextY = currentY + deltaCamY * easedT;

    // Update the camera's position
    camera.position.x = nextX;
    camera.position.y = nextY;

    // Update last target position for the next frame
    this.lastTargetPos.x = tx;
    this.lastTargetPos.y = ty;
  }
}
