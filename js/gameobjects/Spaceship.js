import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";
import { EasingFunctions } from "../utils/easing.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { DropShadow } from "../components/DropShadow.js";
import { CircleCollider } from "../components/CircleCollider.js";

export class Spaceship extends GameObject {
  constructor() {
    super("Spaceship");

    // Set initial position and scale
    this.transform.position = { x: 0, y: 100 };
    this.transform.scale = { x: 100, y: 200 };

    // Add SpriteRenderer
    const img = new Image();
    img.src = "/assets/images/test3.png";
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, { pivot: "bottom", zOrder: 5 }));
    };

    // Add SquashAndStretch component
    const squashAndStretch = new SquashAndStretch({
      squashScale: 0.98,
      stretchScale: 1.02,
      easingFunction: EasingFunctions.easeInOutQuad,
      duration: 10,
      loop: true,
    });
    this.addComponent(squashAndStretch);

    const mainCollider = new BoxCollider({
      width: 120,
      height: 180,
      offset: { x: 0, y: 80 },
      isTrigger: false,
    });
    this.addComponent(mainCollider);

    const triggerCollider = new CircleCollider({
      radius: 120,
      offset: { x: 0, y: 19 },
      isTrigger: true,
    });
    this.addComponent(triggerCollider);

    const dropShadow = new DropShadow({
      offset: { x: 0, y: 5 },
      width: 1.3,
      height: 0.25,
      color: "#00002288",
      zOrderOffset: -10,
    });
    this.addComponent(dropShadow);
  }
}
