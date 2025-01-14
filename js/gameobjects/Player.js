import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { EasingFunctions } from "../utils/easing.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";

export class Player extends GameObject {
  constructor(inputHandler) {
    super("Player");

    // Initial position and scale
    this.transform.position = { x: 0, y: 0 };
    this.transform.scale = { x: 0.03, y: 0.03 };
    this.transform.rotation = 10;

    // Movement
    this.inputHandler = inputHandler;
    this.speed = 350; // Max speed in units/second

    // Easing configuration
    this.easeInDuration = 0.1;    // Time (in seconds) to go from 0 → full speed
    this.easeOutDuration = 0.2;  // Time (in seconds) to go from full speed → 0
    this.easingFunctionIn = EasingFunctions.easeOutExpo;
    this.easingFunctionOut = EasingFunctions.easeOutExpo;

    // Internal state
    this.movementState = "idle"; // "idle", "accelerating", "full", or "decelerating"
    this.currentTime = 0;        // Tracks progress of the easing
    this.currentFactor = 0;      // 0 = not moving, 1 = full speed

    // Store the last nonzero direction so we can decelerate along that vector.
    this.lastDirection = { x: 0, y: 0 };

    // Add a SpriteRenderer component
    const img = new Image();
    img.src = "/assets/images/rafli.png";
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, { pivot: "bottom", zOrder: 5 }));
    };

    const squashAndStretch = new SquashAndStretch({
      squashScale: 0.95,
      stretchScale: 1.05,
      easingFunction: EasingFunctions.easeInOutQuad,
      duration: 2,
      loop: true,
    });
    this.addComponent(squashAndStretch);
  }

  update(deltaTime) {
    super.update(deltaTime);

    // 1. Get normalized direction from InputHandler
    const direction = this.inputHandler.getNormalizedDirection();
    const isMoving = (direction.x !== 0 || direction.y !== 0);

    // 2. State transitions
    if (isMoving) {
      // Update lastDirection every frame we have a nonzero direction
      this.lastDirection = { ...direction };

      // If we're not already at full speed, make sure we're accelerating
      if (this.movementState === "idle" || this.movementState === "decelerating") {
        this.movementState = "accelerating";
        this.currentTime = 0; // Restart easing timer
      }

      // Accelerating: move currentFactor from 0 → 1
      if (this.movementState === "accelerating") {
        this.currentTime += deltaTime;
        const progress = Math.min(1, this.currentTime / this.easeInDuration);
        this.currentFactor = this.easingFunctionIn(progress);

        if (progress >= 1) {
          this.movementState = "full"; // Reached full speed
          this.currentFactor = 1;
        }
      }
      // If already "full" speed, just keep factor at 1
      else if (this.movementState === "full") {
        this.currentFactor = 1;
      }

    } else {
      // If no input, transition to decelerating if we were moving
      if (this.movementState === "accelerating" || this.movementState === "full") {
        this.movementState = "decelerating";
        this.currentTime = 0;
      }

      if (this.movementState === "decelerating") {
        this.currentTime += deltaTime;
        const progress = Math.min(1, this.currentTime / this.easeOutDuration);

        // Easing from 1 → 0
        this.currentFactor = 1 - this.easingFunctionOut(progress);

        if (progress >= 1) {
          this.movementState = "idle";
          this.currentFactor = 0;
        }
      }
    }

    const sAndS = this.getComponent(SquashAndStretch);
    if (sAndS) {
      if (isMoving) {
        sAndS.duration = 0.1;
        sAndS.squashScale = 0.90;
        sAndS.stretchScale = 1.1;
      }
      else {
        sAndS.duration = 2;
        sAndS.squashScale = 0.95;
        sAndS.stretchScale = 1.05;
      }
    }

    // 3. Apply movement
    // - Use `lastDirection` for deceleration, because `direction` will be zero.
    // - If we're still pressing keys, direction & lastDirection are the same.
    const effectiveSpeed = this.speed * this.currentFactor;
    this.transform.position.x += this.lastDirection.x * effectiveSpeed * deltaTime;
    this.transform.position.y += this.lastDirection.y * effectiveSpeed * deltaTime;
  }
}