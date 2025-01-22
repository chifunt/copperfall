import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { EasingFunctions } from "../utils/easing.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { ParticleSystemObject } from "./ParticleSystemObject.js";
import { InputHandler } from "./InputHandler.js";

export class EnemyTest extends GameObject {
  constructor(posx = 0, posy = 0, width = 30, height = 40) {
    super("EnemyTest");

    // Set initial position and scale
    this.transform.position = { x: posx, y: posy };
    this.transform.scale = { x: width, y: height };

    // Add SpriteRenderer
    const img = new Image();
    img.src = "/assets/images/test2.png";
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, { pivot: "bottom", zOrder: 3 }));
    };

    this.dieBurst = new ParticleSystemObject("DieBurst", {
      burst: true,
      burstCount: 20,
      spawnRadius: 40,
      color: "rgba(255, 10, 10, .5)",
      particleLifetime: 0.5,
      sizeOverTime: true,
      playOnWake: false,
      loop: false,
      duration: 0.7, // only needed if we want the system to auto-destroy after
      startSize: 10,
      minAngle: 0,
      maxAngle: 360,
      minInitialSpeed: 200,
      maxInitialSpeed: 300
    });
    this.dieBurst.transform.position = this.transform.position;

    const mainCollider = new BoxCollider({
      width: this.transform.scale.x,
      height: this.transform.scale.y,
      offset: { x: 0, y: height / 2 },
      isTrigger: false,
    });
    this.addComponent(mainCollider);

    const triggerCollider = new CircleCollider({
      radius: 20,
      offset: { x: 0, y: height / 2 },
      isTrigger: true,
    });
    this.addComponent(triggerCollider);

    triggerCollider.onTriggerStay = (other) => {
      if (other.gameObject.name === "Player") {
        if (other.gameObject.isDashing) {
          this.dieBurst.playSystem();
          InputHandler.getInstance().triggerRumble(200, 100, .1, .3);
          this.destroy();
          return;
        }
        other.gameObject.takeDamage();
      }
    };
  }
}
