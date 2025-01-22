import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { ScreenShake } from "../components/ScreenShake.js";
import { InputHandler } from "./InputHandler.js";
import { DropShadow } from "../components/DropShadow.js";
import { ParticleSystemObject } from "./ParticleSystemObject.js";

export class DestructibleRock extends GameObject {
  constructor(posx = 0, posy = 0, width = 50, height = 50) {
    super("DestructibleRock");

    // Set initial position and scale
    this.transform.position = { x: posx, y: posy };
    this.transform.scale = { x: width, y: height };

    // Add SpriteRenderer
    const img = new Image();
    img.src = "/assets/images/test.png";
    img.onload = () => {
      this.addComponent(new SpriteRenderer(img, { pivot: "center", zOrder: 3 }));
    };

    // const dropShadow = new DropShadow({
    //   offset: { x: 0, y: -23 },
    //   width: 1.3,
    //   height: 0.25,
    //   color: "#00002266",
    //   zOrderOffset: -10,
    // });
    // this.addComponent(dropShadow);

    this.rockBurst = new ParticleSystemObject("RockBurst", {
      burst: true,
      burstCount: 20,
      spawnRadius: 40,
      color: "#895129aa",
      particleLifetime: 0.6,
      sizeOverTime: true,
      playOnWake: false,
      loop: false,
      duration: 0.1, // only needed if we want the system to auto-destroy after
      startSize: 10
    });
    this.rockBurst.transform.position = this.transform.position;

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
      this.rockBurst.playSystem();
      if (ScreenShake.instance) {
        ScreenShake.instance.trigger(
          0.05,   // duration in seconds
          0,  // blendInTime in seconds
          0.1,  // blendOutTime in seconds
          6,     // amplitude
          20     // frequency
        );
      }
      InputHandler.getInstance().triggerRumble(200, 100, .2, .5);
      this.destroy();
    }
  }
}
