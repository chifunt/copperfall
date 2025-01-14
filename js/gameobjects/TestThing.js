import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";
import { EasingFunctions } from "../utils/easing.js";

export class TestThing extends GameObject {
    constructor() {
        super("TestThing");

        // Set initial position and scale
        this.transform.position = { x: 250, y: 100 };
        this.transform.scale = { x: 0.1, y: 0.1 };

        // Add SpriteRenderer
        const img = new Image();
        img.src = "/assets/images/rafli.png";
        img.onload = () => {
            this.addComponent(new SpriteRenderer(img, { pivot: "bottom", zOrder: 10 }));
        };

        // Add SquashAndStretch component
        const squashAndStretch = new SquashAndStretch({
            squashScale: 0.95,
            stretchScale: 1.05,
            easingFunction: EasingFunctions.easeInOutQuad,
            duration: 0.5,
            loop: true,
        });
        this.addComponent(squashAndStretch);
    }
}
