import { SpriteRenderer } from "./components/SpriteRenderer.js";
import { BackgroundRenderer } from "/js/components/BackgroundRenderer.js";
import { Engine } from "/js/core/Engine.js";
import { GameObject } from "/js/core/GameObject.js";
import { SquashAndStretch } from "./components/SquashAndStretch.js";
import { EasingFunctions } from "/js/utils/easing.js";

const engine = new Engine("canvas");

const background = new GameObject("Background");
background.addComponent(new BackgroundRenderer("black"));

const player = new GameObject("Player");
const img = new Image();
img.src = "/assets/images/yolk.png";
img.onload = () => {
  player.addComponent(new SpriteRenderer(img));
}
player.transform.position = { x: canvas.width / 2, y: canvas.height / 2 };

player.transform.scale = { x: 0.1, y: 0.1 };

const squashAndStretch = new SquashAndStretch({
    squashScale: 0.95,
    stretchScale: 1.05,
    easingFunction: EasingFunctions.easeInOutQuad,
    duration: 0.5,
    loop: true,
    pivot: "bottom",
});
player.addComponent(squashAndStretch);


// // Destroy it after 3 seconds
// setTimeout(() => {
//     player.destroy();
//     console.log(`${player.name} marked for destruction`);
// }, 3000);

engine.start();