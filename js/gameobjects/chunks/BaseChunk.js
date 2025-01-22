import { GameObject } from "/js/core/GameObject.js";
import { Engine } from "/js/core/Engine.js";

export class BaseChunk extends GameObject {
  constructor(name, cx, cy, chunkSize = 400) {
    super(name);
    this.cx = cx;
    this.cy = cy;
    this.chunkSize = chunkSize;

    // Set world position
    // For example, if chunk(0,0) is at (0,0) or chunk(0,0) is the center, adapt as needed
    this.transform.position.x = cx * this.chunkSize;
    this.transform.position.y = cy * this.chunkSize;

    // Optionally store children in an array for reference
    this.childObjects = [];
  }

  /**
   * Helper to attach a child GameObject to this chunk.
   * The child's position is local (0,0) relative to chunk center,
   * so we offset by chunk's absolute position.
   */
  addChildObject(child) {
    // So if child is at (50, -20) in chunk-local coords:
    child.transform.position.x += this.transform.position.x;
    child.transform.position.y += this.transform.position.y;

    this.childObjects.push(child);
  }

  /**
   * draw the chunk outline in debug mode
   */
  render(ctx) {
    super.render(ctx); // This ensures child objects also render

    if (Engine.instance.debugMode) {
      const camera = Engine.instance.camera;
      const canvasX = (this.transform.position.x - camera.position.x) * camera.scale + Engine.instance.canvas.width / 2;
      const canvasY = (-this.transform.position.y + camera.position.y) * camera.scale + Engine.instance.canvas.height / 2;
      const size = this.chunkSize * camera.scale;

      ctx.save();
      ctx.strokeStyle = "rgba(255,0,0,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const half = size / 2;
      ctx.rect(canvasX - half, canvasY - half, size, size);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * If you want to easily destroy all children with the chunk, override destroy()
   */
  destroy() {
    // Optionally destroy children
    for (const child of this.childObjects) {
      child.destroy();
    }
    this.childObjects = [];
    super.destroy();
  }
}
