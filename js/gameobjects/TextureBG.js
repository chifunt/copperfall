import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";

export class TextureBG extends GameObject {
    constructor(posx = 0, posy = 0, width = 0.195, height = 0.195) {
        super("TestThing2");

        // Set initial position and scale
        this.transform.position = { x: posx, y: posy };
        this.transform.scale = { x: width, y: height };

        // Add SpriteRenderer
        const img = new Image();
        img.src = new URL("../../assets/images/texture.png", import.meta.url).href;
        img.onload = () => {
            this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 0 }));
        };
    }
}
