import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { Pickupable } from "../components/Pickupable.js";

export class Pickup extends GameObject {
  constructor(position = { x: 0, y: 0 }) {
    super("Pickup");

    // Set initial position
    this.transform.position = position;
    this.transform.scale = { x: 0.02, y: 0.02};

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
      }
    };
  }
}
