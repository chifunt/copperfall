import { Component } from "/js/core/Component.js";
import { Engine } from "/js/core/Engine.js";

export class CameraFollow extends Component {
  /**
   * @param {Object} config
   * @param {GameObject} config.target   The GameObject we want to follow (e.g. player)
   * @param {number} [config.smoothness] How quickly the camera catches up. 0.1 = slow, 1.0 = instant
   * @param {number} [config.lookAheadDist] How far ahead (in world units) to look in the direction of travel
   */
  constructor(config = {}) {
    super();
    this.target = config.target;               // The GameObject to follow
    this.smoothness = config.smoothness ?? 0.1; // 0 < smoothness <= 1
    this.lookAheadDist = config.lookAheadDist ?? 0;
    this.lastTargetPos = { x: 0, y: 0 };
    this.lastDir = { x: 1, y: 0 }; // default direction
  }

  start() {
    // Optionally store the initial target pos
    if (this.target) {
      this.lastTargetPos.x = this.target.transform.position.x;
      this.lastTargetPos.y = this.target.transform.position.y;
    }
  }

  update(deltaTime) {
    if (!this.target) return;

    const engine = Engine.instance;
    const camera = engine.camera;

    // Current target position
    const tx = this.target.transform.position.x;
    const ty = this.target.transform.position.y;

    // Figure out direction of movement
    const dx = tx - this.lastTargetPos.x;
    const dy = ty - this.lastTargetPos.y;
    const distMoved = Math.sqrt(dx * dx + dy * dy);
    let dirX = this.lastDir.x;
    let dirY = this.lastDir.y;

    // If the target is moving significantly, update lastDir
    if (distMoved > 0.0001) {
      dirX = dx / distMoved;
      dirY = dy / distMoved;
      this.lastDir.x = dirX;
      this.lastDir.y = dirY;
    }

    // Calculate look-ahead offset
    const lookX = dirX * this.lookAheadDist;
    const lookY = dirY * this.lookAheadDist;

    // Desired camera position = target pos + look-ahead
    const desiredX = tx + lookX;
    const desiredY = ty + lookY;

    // Current camera pos
    const currentX = camera.position.x;
    const currentY = camera.position.y;

    // Lerp toward the desired position
    // smoothness typically in [0..1], so we might do:
    // newPos = currentPos + (desiredPos - currentPos) * smoothness
    const nextX = currentX + (desiredX - currentX) * this.smoothness;
    const nextY = currentY + (desiredY - currentY) * this.smoothness;

    // Update the engine's camera
    camera.position.x = nextX;
    camera.position.y = nextY;

    // Save current target pos for next frame
    this.lastTargetPos.x = tx;
    this.lastTargetPos.y = ty;
  }
}
