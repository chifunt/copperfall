import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { Pickupable } from "../components/Pickupable.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";
import { EasingFunctions } from "../utils/easing.js";
import { DropShadow } from "../components/DropShadow.js";
import { VerticalBob } from "../components/VerticalBob.js";

export class Pickup extends GameObject {
  constructor(position = { x: 0, y: 0 }) {
    super("Pickup");

    this.transform.position = position;
    this.transform.scale = { x: 0.015, y: 0.015 };

    const img = new Image();
    img.src = "/assets/images/rafli.png";
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 2 }));

      const bobAmplitude = 2;
      const bobFrequency = 0.5;
      this.addComponent(new VerticalBob(bobAmplitude, bobFrequency));
    };

    const triggerCollider = new CircleCollider({
      radius: 20,
      offset: { x: 0, y: 0 },
      isTrigger: true,
    });
    this.addComponent(triggerCollider);

    const pickupable = new Pickupable();
    this.addComponent(pickupable);

    // Handle trigger logic
    triggerCollider.onTriggerEnter = (other) => {
      if (other.gameObject.name === "Player") {
        pickupable.onPickup(other.gameObject);
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
      offset: { x: 0, y: -18 },
      width: 1500,
      height: 600,
      color: "#00002288",
    });
    this.addComponent(dropShadow);
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.transform.rotation += 60 * deltaTime;

    // Ensure rotation stays within 0-360 degrees for consistency
    if (this.transform.rotation >= 360) {
      this.transform.rotation -= 360;
    }
  }
}
