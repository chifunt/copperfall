import { Component } from "/js/core/Component.js";

export class BackgroundRenderer extends Component {
  constructor(color) {
    super();
    this.color = color;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}