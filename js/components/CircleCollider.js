import { Collider } from "./Collider.js";

export class CircleCollider extends Collider {
  /**
   * @param {Object} config
   * @param {number} config.radius
   */
  constructor(config = {}) {
    super(config);
    this.radius = config.radius || 1;
  }

  debugRender(ctx) {
  }
}
