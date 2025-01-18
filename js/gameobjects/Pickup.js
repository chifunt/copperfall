import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { Pickupable } from "../components/Pickupable.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";
import { EasingFunctions } from "../utils/easing.js";
import { DropShadow } from "../components/DropShadow.js";

export class Pickup extends GameObject {
  constructor(position = { x: 0, y: 0 }) {
    super("Pickup");

    // Set initial position
    this.transform.position = position;
    this.transform.scale = { x: 0.015, y: 0.015 };

    // Add SpriteRenderer
    const img = new Image();
    img.src = "/assets/images/rafli.png"; // Path to your pickup sprite
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 2 }));
    };

    // Add CircleCollider (trigger)
    const triggerCollider = new CircleCollider({
      radius: 20, // Adjust radius as needed
      offset: { x: 0, y: 0 },
      isTrigger: true,
    });
    this.addComponent(triggerCollider);

    // Add Pickupable component
    const pickupable = new Pickupable();
    this.addComponent(pickupable);

    // Handle trigger logic
    triggerCollider.onTriggerEnter = (other) => {
      // Check if the other collider belongs to the player
      if (other.gameObject.name === "Player") {
        pickupable.onPickup(other.gameObject); // Call the onPickup method
        other.gameObject.increaseCopper(15);
      }
    };

    this.sAndS = new SquashAndStretch({
      squashScale: 0.97,
      stretchScale: 1.03,
      easingFunction: EasingFunctions.easeInOutQuad,
      duration: 4,
      loop: true,
    });
    this.addComponent(this.sAndS);
    this.sAndS.startAnimation();

    const dropShadow = new DropShadow({
      offset: { x: 0, y: -15 },
      width: 1500,
      height: 600,
      color: "#00002288",
    });
    this.addComponent(dropShadow);
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.transform.rotation += 30 * deltaTime; // Rotate 90 degrees per second

    // Ensure rotation stays within 0-360 degrees for consistency
    if (this.transform.rotation >= 360) {
        this.transform.rotation -= 360;
    }
  }
}
