import { Component } from "/js/core/Component.js";
import { Engine } from "/js/core/Engine.js";

export class SpriteRenderer extends Component {
  constructor(image) {
    super();
    this.image = image;
  }

  render(ctx) {
    const engine = Engine.instance;
    const camera = engine.camera;

    const transform = this.gameObject.transform;
    const { x: worldX, y: worldY } = transform.position;
    const { x: scaleX, y: scaleY } = transform.scale;
    const rotation = transform.rotationInRadians;

    // Convert world coordinates to canvas coordinates
    const canvasX = (worldX - camera.position.x) * camera.scale + engine.canvas.width / 2;
    const canvasY = (-worldY + camera.position.y) * camera.scale + engine.canvas.height / 2; // invert y

    ctx.save();
    ctx.translate(canvasX, canvasY);
    ctx.rotate(rotation);
    ctx.scale(scaleX * camera.scale, scaleY * camera.scale);

    const width = this.image.width;
    const height = this.image.height;
    ctx.drawImage(this.image, -width / 2, -height / 2);

    ctx.restore();
  }
}