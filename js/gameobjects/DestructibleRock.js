import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { EasingFunctions } from "../utils/easing.js";
import { BoxCollider } from "../components/BoxCollider.js";

export class DestructibleRock extends GameObject {
    constructor(posx = 0, posy = 0, width = 50, height = 50) {
        super("TestThing");

        // Set initial position and scale
        this.transform.position = { x: posx, y: posy };
        this.transform.scale = { x: width, y: height };

        // Add SpriteRenderer
        const img = new Image();
        img.src = "/assets/images/test2.png";
        img.onload = () => {
            this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 3 }));
        };

        const mainCollider = new BoxCollider({
        width: this.transform.scale.x,
        height: this.transform.scale.y,
        offset: { x: 0, y: 0 },
        isTrigger: false,
        });
        this.addComponent(mainCollider);

        mainCollider.onCollisionStay = (other) => {
          if (!other.gameObject.name == "Player") return;
          if (!other.gameObject.isDashing) return;
          console.log("PLAYER BROKE ROCK");
          this.destroy();
        }
    }
}
