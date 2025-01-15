import { Component } from "/js/core/Component.js";
import { SpriteRenderer } from "/js/components/SpriteRenderer.js";

/**
 * HorizontalFlip
 * Flips the sprite horizontally when facing left.
 *
 * @param {boolean} defaultFacingRight If true, the entity starts facing right; else left
 */
export class HorizontalFlip extends Component {
  constructor(defaultFacingRight = true) {
    super();

    // If true, sprite is considered facing right initially
    this.facingRight = defaultFacingRight;

    // We'll store last known position to detect movement direction
    this.lastPosition = null;
  }

  update(deltaTime) {
    // Make sure we have a gameObject and a SpriteRenderer
    if (!this.gameObject) return;
    const spriteRenderer = this.gameObject.getComponent(SpriteRenderer);
    if (!spriteRenderer) return;

    // On first frame, initialize lastPosition
    if (!this.lastPosition) {
      this.lastPosition = {
        x: this.gameObject.transform.position.x,
        y: this.gameObject.transform.position.y
      };
    }

    // Determine movement direction by comparing with last frame
    const currentPos = this.gameObject.transform.position;
    const dx = currentPos.x - this.lastPosition.x;

    if (dx > 0.01) {
      // Moving right
      this.facingRight = true;
    } else if (dx < -0.01) {
      // Moving left
      this.facingRight = false;
    }

    // Update lastPosition
    this.lastPosition.x = currentPos.x;
    this.lastPosition.y = currentPos.y;

    // Flip horizontally if facing left
    // If facingRight = true => flipX = false
    // If facingRight = false => flipX = true
    spriteRenderer.flipX = !this.facingRight;
  }
}
