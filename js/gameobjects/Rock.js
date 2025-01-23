import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { CircleCollider } from "../components/CircleCollider.js";

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

    // This thing below has too much performance cost!!
    // // One method of going about knowing which tile image to use.
    // const triggerCollider = new CircleCollider({
    //   radius: 25,
    //   offset: { x: 0, y: 0 },
    //   isTrigger: true,
    // });
    // this.addComponent(triggerCollider);
    // this.rockNeighbors = [];
    // triggerCollider.onTriggerEnter = (other) => {
    //   if (other.gameObject.name == "Rock" && other.isTrigger) {
    //     this.rockNeighbors.push(other.gameObject);
    //   }
    // }
    // console.log(this.rockNeighbors);
  }
}
