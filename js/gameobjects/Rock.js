import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { BoxCollider } from "../components/BoxCollider.js";

export class Rock extends GameObject {
  constructor(posx = 0, posy = 0) {
    super(Rock.name);

    // Set initial position and scale
    this.transform.position = { x: posx, y: posy };
    this.transform.scale = { x: .158, y: .158 }; // this kinda depends on the sprite's resolution

    const rotations = [90, 180, 270];
    const randomRotationDegrees = rotations[Math.floor(Math.random() * rotations.length)];
    this.transform.rotation = randomRotationDegrees;

    // Add SpriteRenderer
    const img = new Image();
    img.src = "/assets/images/rock.png";
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 3 }));
    };

    const mainCollider = new BoxCollider({
      width: 40,
      height: 40,
      offset: { x: 0, y: 0 },
      isTrigger: false,
    });
    this.addComponent(mainCollider);
  }
}
