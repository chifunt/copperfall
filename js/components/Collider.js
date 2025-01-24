import { Component } from "../core/Component.js";

export class Collider extends Component {
  /**
   * @param {Object} config
   * @param {boolean} config.isTrigger - Whether this collider is a trigger
   * @param {Object} config.offset - { x: number, y: number } offset from the GameObject's transform position
   * @param {string} config.layer - (Optional) For collision layers or tags
   */
  constructor(config = {}) {
    super();
    this.isTrigger = config.isTrigger || false;
    this.offset = config.offset || { x: 0, y: 0 };
    this.layer = config.layer || "Default";

    // For tracking collision states
    // A map of other colliders we're currently colliding with
    // so we can detect 'enter', 'stay', 'exit'
    this.currentCollisions = new Set();
  }

  // Called every frame by the collision system
  // where "other" is the other collider
  onCollisionEnter(other) {}
  onCollisionStay(other) {}
  onCollisionExit(other) {}

  // For triggers
  onTriggerEnter(other) {}
  onTriggerStay(other) {}
  onTriggerExit(other) {}

  // Optional debug rendering of the collider
  debugRender(ctx) {}
}
