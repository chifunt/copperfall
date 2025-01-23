import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";
import { EasingFunctions } from "../utils/EasingFunctions.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { DropShadow } from "../components/DropShadow.js";

export class Spaceship extends GameObject {
  constructor(posx, posy) {
    super("Spaceship");

    // Set initial position and scale
    this.transform.position = { x: posx, y: posy };
    this.transform.scale = { x: 0.24, y: 0.24 };

    // Add SpriteRenderer
    this.imgFull = new Image();
    this.imgFull.src = "/assets/images/spaceship-full.png";
    this.imgRepaired = new Image();
    this.imgRepaired.src = "/assets/images/spaceship-repaired.png";
    this.imgWrecked = new Image();
    this.imgWrecked.src = "/assets/images/spaceship-wrecked.png";

    this.loaded = false;
    this.repairLevels = 0;
    this.pendingOperations = []; // Queue of operations to execute when loaded

    this.imgFull.onload = () => {
      this.loaded = true;
      this.addComponent(new SpriteRenderer(this.imgWrecked, { pivot: "bottom", zOrder: 6 }));

      // Process any pending operations
      this.processPendingOperations();
    };

    // Add other components
    const squashAndStretch = new SquashAndStretch({
      squashScale: 0.995,
      stretchScale: 1.005,
      easingFunction: EasingFunctions.easeInOutQuad,
      duration: 3,
      loop: true,
    });
    this.addComponent(squashAndStretch);

    const mainCollider = new BoxCollider({
      width: 100,
      height: 180,
      offset: { x: 0, y: 80 },
      isTrigger: false,
    });
    this.addComponent(mainCollider);

    const triggerCollider = new BoxCollider({
      width: 240,
      height: 300,
      offset: { x: 0, y: 50 },
      isTrigger: true,
    });
    this.addComponent(triggerCollider);

    const dropShadow = new DropShadow({
      offset: { x: 0, y: 10 },
      width: 450,
      height: 200,
      color: "#00002288",
      zOrderOffset: -10,
    });
    this.addComponent(dropShadow);
  }

  // Process any queued operations
  processPendingOperations() {
    while (this.pendingOperations.length > 0) {
      const operation = this.pendingOperations.shift();
      operation();
    }
  }

  repairSpaceShip() {
    // If not loaded, queue the operation
    if (!this.loaded) {
      this.pendingOperations.push(() => this.repairSpaceShip());
      return;
    }

    // Proceed with repair logic
    this.repairLevels++;
    const spriteRenderer = this.getComponent(SpriteRenderer);

    if (this.repairLevels === 1) {
      spriteRenderer.setImage(this.imgRepaired);
    } else if (this.repairLevels === 2) {
      spriteRenderer.setImage(this.imgFull);
    }
  }
}
