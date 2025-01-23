import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { EasingFunctions } from "../utils/EasingFunctions.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { ParticleSystemObject } from "./ParticleSystemObject.js";
import { InputHandler } from "./InputHandler.js";
import { ScreenShake } from "../components/ScreenShake.js";
import { DropShadow } from "../components/DropShadow.js";
import { SquashAndStretch } from "../components/SquashAndStretch.js";

export class EnemyTest extends GameObject {
  constructor(posx = 0, posy = 0, width = 30, height = 40) {
    super("EnemyTest");

    // Set initial position and scale
    this.transform.position = { x: posx, y: posy - height / 2 };
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

    const dropShadow = new DropShadow({
      offset: { x: 0, y: 2 },
      width: 1.3,
      height: 0.25,
      color: "#00002266",
      zOrderOffset: -10,
    });
    this.addComponent(dropShadow);

    this.sAndS = new SquashAndStretch({
      squashScale: 0.97,
      stretchScale: 1.03,
      easingFunction: EasingFunctions.easeInOutQuad,
      duration: 1.5,
      loop: true,
    });
    this.addComponent(this.sAndS);
    this.sAndS.startAnimation();

    const mainCollider = new BoxCollider({
      width: this.transform.scale.x,
      height: this.transform.scale.y - 10,
      offset: { x: 0, y: height / 2 },
      isTrigger: false,
    });
    this.addComponent(mainCollider);

    const hitboxCollider = new CircleCollider({
      radius: 20,
      offset: { x: 0, y: height / 2 },
      isTrigger: true,
    });
    this.addComponent(hitboxCollider);

    const damagingCollider = new CircleCollider({
      radius: 10,
      offset: { x: 0, y: height / 2 },
      isTrigger: true,
    });
    this.addComponent(damagingCollider);

    hitboxCollider.onTriggerStay = (other) => {
      if (other.gameObject.name !== "Player") return;
      if (!other.gameObject.isDashing) return;
      this.dieBurst.playSystem();
      InputHandler.getInstance().triggerRumble(200, 100, .1, .3);
      if (ScreenShake.instance) {
        ScreenShake.instance.trigger(
          0.25,   // duration in seconds
          0,  // blendInTime in seconds
          0.1,  // blendOutTime in seconds
          6,     // amplitude
          20     // frequency
        );
      }
      this.destroy();
      return;
    };

    damagingCollider.onTriggerStay = (other) => {
      if (other.gameObject.name !== "Player") return;
      if (other.gameObject.isDashing) return;
      other.gameObject.takeDamage();
    }
  }
}
