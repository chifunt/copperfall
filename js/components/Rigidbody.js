import { Component } from "../core/Component.js";

/**
 * A simple Rigidbody component:
 *  - isKinematic: if true, object ignores collision pushes but can be moved by code.
 *  - isDynamic: if true, object can be pushed out of overlaps (and possibly respond to forces, if expanded).
 * If an object has no Rigidbody, we treat it as "static" and immovable.
 */
export class Rigidbody extends Component {
  constructor(config = {}) {
    super();
    this.isKinematic = config.isKinematic || false;
    // Potential future expansions:???
    // this.velocity = { x: 0, y: 0 };
    // this.mass = config.mass || 1;
  }
}
