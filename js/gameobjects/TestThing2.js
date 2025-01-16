import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { EasingFunctions } from "../utils/easing.js";
import { BoxCollider } from "../components/BoxCollider.js";

export class TestThing2 extends GameObject {
    constructor() {
        super("TestThing");

        // Set initial position and scale
        this.transform.position = { x: 250, y: 100 };
        this.transform.scale = { x: 100, y: 200 };

        // Add SpriteRenderer
        const img = new Image();
        img.src = "/assets/images/test.png";
        img.onload = () => {
            this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 4 }));
        };

        const mainCollider = new BoxCollider({
        width: this.transform.scale.x,
        height: this.transform.scale.y,
        offset: { x: 0, y: 0 },
        isTrigger: false,
        });
        this.addComponent(mainCollider);
    }
}
