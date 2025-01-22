import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { BoxCollider } from "../components/BoxCollider.js";

export class Rock extends GameObject {
    constructor(posx = 0, posy = 0) {
        super(Rock.name);

        // Set initial position and scale
        this.transform.position = { x: posx, y: posy };
        this.transform.scale = { x: 50, y: 50 }; // this kinda depends on the sprite's resolution

        // Add SpriteRenderer
        const img = new Image();
        img.src = "/assets/images/test5.png";
        img.onload = () => {
            this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 3 }));
        };

        const mainCollider = new BoxCollider({
        width: 50,
        height: 50,
        offset: { x: 0, y: 0 },
        isTrigger: false,
        });
        this.addComponent(mainCollider);
    }
}
