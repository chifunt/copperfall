import { Component } from "../core/Component.js";

export class Pickupable extends Component {
  constructor(onPickupCallback) {
    super();
    this.onPickupCallback = onPickupCallback || null;
  }

  /**
   * Called when the pickup is collected.
   * @param {GameObject} collector - The GameObject that collected the pickup (e.g., Player).
   */
  onPickup(collector) {
    if (this.onPickupCallback) {
      this.onPickupCallback(collector);
    } else {
      // Default behavior: destroy the pickup's GameObject
      this.gameObject.destroy();
      console.log(`${this.gameObject.name} has been picked up by ${collector.name}`);
    }
  }
}
