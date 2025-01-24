import { Component } from "../core/Component.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";

export class HorizontalFlip extends Component {
  constructor(defaultFacingRight = true) {
    super();

    // Default direction (true = right, false = left)
    this.facingRight = defaultFacingRight;
  }

  /**
   * Set the facing direction.
   * @param {boolean} isFacingRight - True if facing right, false if facing left.
   */
  setFacingRight(isFacingRight) {
    this.facingRight = isFacingRight;

    // Get the SpriteRenderer and set its flipX property
    const spriteRenderer = this.gameObject?.getComponent(SpriteRenderer);
    if (spriteRenderer) {
      spriteRenderer.flipX = !this.facingRight; // FlipX is true if facing left
    }
  }

  /**
   * Optional: Ensure the renderer always matches the current facing direction.
   */
  update(deltaTime) {
    const spriteRenderer = this.gameObject?.getComponent(SpriteRenderer);
    if (spriteRenderer) {
      spriteRenderer.flipX = !this.facingRight;
    }
  }
}
