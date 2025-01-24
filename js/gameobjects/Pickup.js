import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";
import { EasingFunctions } from "../utils/EasingFunctions.js";
import { DropShadow } from "../components/DropShadow.js";
import { VerticalBob } from "../components/VerticalBob.js";

export class Pickup extends GameObject {
  constructor(posx, posy) {
    super("Pickup");

    this.transform.position = {x: posx, y: posy};
    this.transform.scale = { x: 0.045, y: 0.045 };
    this.isPickedUp = false;
    this.pickupAnimationDuration = 0.5;
    this.pickupAnimationElapsed = 0;
    this.rotationSpeed = Math.random() * (70 - 50) + 50;

    this.playerObject = null;
    this.startPos = { ...this.transform.position };
    this.targetPos = { x: 0, y: 0 };

    const img = new Image();
    img.src = "../../assets/images/copper.png";
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

    // Handle trigger logic
    triggerCollider.onTriggerEnter = (other) => {
      if (other.gameObject.name === "Player") {
        if (this.isPickedUp) return;
        this.isPickedUp = true;
        this.playerObject = other.gameObject;
        this.startPos = { ...this.transform.position };
      }
    };

    this.sAndS = new SquashAndStretch({
      squashScale: 0.97,
      stretchScale: 1.03,
      easingFunction: EasingFunctions.easeInOutQuad,
      duration: .2,
      loop: true,
    });
    this.addComponent(this.sAndS);
    this.sAndS.startAnimation();

    const dropShadow = new DropShadow({
      offset: { x: 0, y: -18 },
      width: 500,
      height: 200,
      color: "#00002288",
    });
    this.addComponent(dropShadow);
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.transform.rotation += this.rotationSpeed * deltaTime;

    // Ensure rotation stays within 0-360 degrees for consistency
    if (this.transform.rotation >= 360) {
      this.transform.rotation -= 360;
    }

    if (!this.isPickedUp) return;
    this.pickupAnimationElapsed += deltaTime;
    const t = Math.min(this.pickupAnimationElapsed / this.pickupAnimationDuration, 1); // Clamp t to [0,1]
    const easedT = EasingFunctions.easeInBack(t);

    this.targetPos.x = this.playerObject.transform.position.x;
    this.targetPos.y = this.playerObject.transform.position.y + 15; // Add a little offset for the player

    this.transform.position.x = this.startPos.x + (this.targetPos.x - this.startPos.x) * easedT;
    this.transform.position.y = this.startPos.y + (this.targetPos.y - this.startPos.y) * easedT;

    if (this.pickupAnimationElapsed >= this.pickupAnimationDuration) {
      // console.log("ANIMATION ELEPASE");
      this.playerObject.increaseCopper(15);
      this.destroy();
    }
  }
}
