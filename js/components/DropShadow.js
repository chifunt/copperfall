import { Component } from "../core/Component.js";
import { Engine } from "../core/Engine.js";

export class DropShadow extends Component {
  constructor(config = {}) {
    super();

    // Default configuration
    this.offset = config.offset || { x: 0, y: 5 }; // Offset from the GameObject's position
    this.width = config.width || 50; // Default width
    this.height = config.height || 20; // Default height
    this.color = config.color || "#000000dd"; // Default color with transparency
    this.zOrderOffset = config.zOrderOffset || -1; // Render below the SpriteRenderer
  }

  render(ctx) {
    const engine = Engine.instance;
    const camera = engine.camera;

    const transform = this.gameObject.transform;

    // Calculate shadow position based on GameObject's position and camera
    const shadowX = (transform.position.x + this.offset.x - camera.position.x) * camera.scale + engine.canvas.width / 2;
    const shadowY = (-transform.position.y - this.offset.y + camera.position.y) * camera.scale + engine.canvas.height / 2;

    // Scale the shadow to match the GameObject's scale
    const scaledWidth = this.width * transform.scale.x * camera.scale;
    const scaledHeight = this.height * transform.scale.y * camera.scale;

    // Render the shadow
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY, scaledWidth / 2, scaledHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
