import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { EasingFunctions } from "../utils/EasingFunctions.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { ParticleSystemObject } from "./ParticleSystemObject.js";
import { InputHandler } from "./InputHandler.js";
import { ScreenShake } from "../components/ScreenShake.js";
import { DropShadow } from "../components/DropShadow.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";
import { Rigidbody } from "../components/Rigidbody.js";

export class EnemyFast extends GameObject {
  constructor(posx = 0, posy = 0) {
    super("EnemyPatrol");

    // Set initial position and scale
    this.transform.position = { x: posx, y: posy - 22 };
    this.transform.scale = { x: 0.1, y: 0.1 };

    const rb = new Rigidbody();
    this.addComponent(rb);

    // Add SpriteRenderer
    const img = new Image();
    img.src = "../../assets/images/enemy-fast.png";
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, {
        pivot: "bottom",
        zOrder: 3,
      }));
    };

    // -- Particle system for death burst --
    this.dieBurst = new ParticleSystemObject("DieBurst", {
      burst: true,
      burstCount: 20,
      spawnRadius: 40,
      color: "rgba(198, 131, 70, .5)",
      particleLifetime: 0.5,
      sizeOverTime: true,
      playOnWake: false,
      loop: false,
      duration: 0.7,
      startSize: 10,
      minAngle: 0,
      maxAngle: 360,
      minInitialSpeed: 200,
      maxInitialSpeed: 300,
    });
    this.dieBurst.transform.position = this.transform.position;

    // -- DropShadow --
    const dropShadow = new DropShadow({
      offset: { x: 0, y: 5 },
      width: 500,
      height: 160,
      color: "#00002266",
      zOrderOffset: -10,
    });
    this.addComponent(dropShadow);

    // -- SquashAndStretch (for idle) --
    this.sAndS = new SquashAndStretch({
      squashScale: 0.97,
      stretchScale: 1.03,
      easingFunction: EasingFunctions.easeInOutQuad,
      duration: .2,
      loop: true,
    });
    this.addComponent(this.sAndS);
    this.sAndS.startAnimation();

    // -- Colliders --
    const mainCollider = new BoxCollider({
      width: 30,
      height: 30,
      offset: { x: 0, y: 22 },
      isTrigger: false,
    });
    this.addComponent(mainCollider);

    const hitboxCollider = new CircleCollider({
      radius: 20,
      offset: { x: 0, y: 22 },
      isTrigger: true,
    });
    this.addComponent(hitboxCollider);

    const damagingCollider = new CircleCollider({
      radius: 10,
      offset: { x: 0, y: 22 },
      isTrigger: true,
    });
    this.addComponent(damagingCollider);

    // -- Attack logic (destroy self on player dash, etc.) --
    hitboxCollider.onTriggerStay = (other) => {
      if (other.gameObject.name !== "Player") return;
      if (!other.gameObject.isDashing) return;

      // On kill:
      this.dieBurst.playSystem();
      InputHandler.getInstance().triggerRumble(200, 100, 0.1, 0.3);
      if (ScreenShake.instance) {
        ScreenShake.instance.trigger(
          0.25,  // duration
          0,     // blendInTime
          0.1,   // blendOutTime
          6,     // amplitude
          20     // frequency
        );
      }
      this.destroy();
    };

    damagingCollider.onTriggerStay = (other) => {
      if (other.gameObject.name !== "Player") return;
      if (other.gameObject.isDashing) return;
      other.gameObject.takeDamage();
    };

    // -- State Variables --
    this.movementState = "waiting";   // "waiting" or "moving"
    this.stateTimer = 0;             // tracks countdown in current state
    this.moveSpeed = 150;             // constant move speed
    this.currentDirection = { x: 1, y: 0 };

    this.originalSAndSConfig = {
      squashScale: 0.97,
      stretchScale: 1.03,
      duration: 1.5,
      easingFunction: EasingFunctions.easeInOutQuad,
      loop: true,
    };

    // Initialize first wait time
    this.setWaitTime();

    // Optionally keep a debug flag if needed
    this.debugLogs = false;
  }

  /**
   * Helper function: sets a new random wait time in [1, 5].
   */
  setWaitTime() {
    this.stateTimer = this.getRandomFloat(0.2, 1);
    this.movementState = "waiting";

    // Revert to gentler squash & stretch while idle:
    this.sAndS.setConfig({
      ...this.originalSAndSConfig,
    });
    if (!this.sAndS.isAnimating) {
      this.sAndS.startAnimation();
    }
  }

  /**
   * Helper function: sets a new random move time in [1, 3]
   * and picks a random direction.
   */
  setMoveTime() {
    this.stateTimer = this.getRandomFloat(1, 3);
    this.movementState = "moving";

    // Pick a random direction by angle:
    const angle = Math.random() * Math.PI * 2;
    this.currentDirection = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    // Increase squash & stretch effect while moving:
    this.sAndS.setConfig({
      squashScale: 0.95,
      stretchScale: 1.05,
      duration: 0.07, // Faster "bob" while moving
      easingFunction: EasingFunctions.easeInOutQuad,
      loop: true,
    });
    if (!this.sAndS.isAnimating) {
      this.sAndS.startAnimation();
    }
  }

  /**
   * Returns a random float between min and max.
   */
  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Called every frame; handles the wait/move state logic.
   */
  update(deltaTime) {
    super.update(deltaTime);

    // Countdown the timer
    this.stateTimer -= deltaTime;

    if (this.movementState === "waiting") {
      // Transition to "moving" once timer ends
      if (this.stateTimer <= 0) {
        this.setMoveTime();
      }
    } else if (this.movementState === "moving") {
      // Move in currentDirection at moveSpeed
      this.transform.position.x += this.currentDirection.x * this.moveSpeed * deltaTime;
      this.transform.position.y += this.currentDirection.y * this.moveSpeed * deltaTime;

      // Transition to "waiting" once timer ends
      if (this.stateTimer <= 0) {
        this.setWaitTime();
      }
    }
  }
}
