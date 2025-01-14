import { Component } from "/js/core/Component.js";

export class SpriteRenderer extends Component {
  constructor(image) {
    super();
    this.image = image;
  }

  render(ctx) {
    const transform = this.gameObject.transform;
    const { x, y } = transform.position;
    const { x: scaleX, y: scaleY } = transform.scale;
    const rotation = transform.rotationInRadians;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);

    const width = this.image.width;
    const height = this.image.height;
    ctx.drawImage(this.image, -width / 2, -height / 2);

    ctx.restore();
  }
}