import { Collider } from "./Collider.js";

export class BoxCollider extends Collider {
  /**
   * @param {Object} config
   * @param {number} config.width
   * @param {number} config.height
   */
  constructor(config = {}) {
    super(config);
    this.width = config.width || 1;
    this.height = config.height || 1;
  }

  debugRender(ctx) {
    const transform = this.gameObject.transform;
    const posX = transform.position.x + this.offset.x;
    const posY = transform.position.y + this.offset.y;
    const rot = transform.rotationInRadians;
  }
}
