import { GameObject } from "/js/core/GameObject.js";
import { Engine } from "/js/core/Engine.js";

// Example imports of classes to spawn:
import { Rock } from "/js/gameobjects/Rock.js";
import { EnemyTest } from "/js/gameobjects/EnemyTest.js";
import { Pickup } from "/js/gameobjects/Pickup.js";
import { DestructibleRock } from "/js/gameobjects/DestructibleRock.js";

// OPTIONAL: If you prefer a dynamic approach, you could store this mapping externally.
const COLOR_TO_CLASS = {
  "#ffffffff": Rock,              // White
  "#ff0000ff": EnemyTest,         // Red
  "#00ff00ff": Pickup,            // Green
  "#0000ffff": DestructibleRock   // Blue
};

export class BaseChunk extends GameObject {
  constructor(name, cx, cy, chunkSize = 400) {
    super(name);
    this.cx = cx;
    this.cy = cy;
    this.chunkSize = chunkSize;

    // Position the chunk in world space
    this.transform.position.x = cx * this.chunkSize;
    this.transform.position.y = cy * this.chunkSize;

    this.childObjects = [];
  }

  /**
   * Helper to attach a child GameObject to this chunk.
   * The child's position is local (0,0) relative to chunk center,
   * so we offset by the chunk's absolute position.
   */
  addChildObject(child) {
    child.transform.position.x += this.transform.position.x;
    child.transform.position.y += this.transform.position.y;
    this.childObjects.push(child);
  }

  /**
   * Renders the chunk outline in debug mode.
   */
  render(ctx) {
    super.render(ctx);

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
   * If you want to easily destroy all children with the chunk, override destroy().
   */
  destroy() {
    for (const child of this.childObjects) {
      child.destroy();
    }
    this.childObjects = [];
    super.destroy();
  }

  /**
 * Loads a chunk map (.png) and spawns objects based on colors.
 * Ensures that only one object is instantiated per cell.
 *
 * @param {string} imagePath - e.g. "/assets/images/chunk-maps/start-a.png"
 * @param {Object} customMap - optional color->class mapping if you want to override or extend
 * @param {number} cellsX - number of cells horizontally (default: 8)
 * @param {number} cellsY - number of cells vertically (default: 8)
 * @returns {Promise<void>}
 */
  async loadChunkMap(imagePath, customMap = {}, cellsX = 8, cellsY = 8) {
    const colorMap = { ...COLOR_TO_CLASS, ...customMap };

    // 1. Load the image
    const img = await this.loadImageAsync(imagePath);

    // 2. Draw it into an offscreen canvas
    const offCanvas = document.createElement("canvas");
    offCanvas.width = img.width;
    offCanvas.height = img.height;
    const offCtx = offCanvas.getContext("2d");
    offCtx.drawImage(img, 0, 0);

    // 3. Read pixel data
    const imageData = offCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data; // Uint8ClampedArray of RGBA

    // 4. Define cell size in pixels
    const cellWidth = Math.floor(img.width / cellsX);
    const cellHeight = Math.floor(img.height / cellsY);

    for (let cellY = 0; cellY < cellsY; cellY++) {
      for (let cellX = 0; cellX < cellsX; cellX++) {
        // Collect colors in the current cell
        const colorsInCell = new Set();

        for (let y = cellY * cellHeight; y < (cellY + 1) * cellHeight && y < img.height; y++) {
          for (let x = cellX * cellWidth; x < (cellX + 1) * cellWidth && x < img.width; x++) {
            const i = (y * img.width + x) * 4;
            const r = data[i + 0];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            const colorKey = this.rgbaToHex(r, g, b, a);
            colorsInCell.add(colorKey);
          }
        }

        // Determine which object to spawn based on colors in the cell
        // For example, prioritize certain colors
        let objectClass = null;
        for (const color of Object.keys(colorMap)) {
          if (colorsInCell.has(color)) {
            objectClass = colorMap[color];
            break; // Stop at first matching color based on priority
          }
        }

        if (objectClass) {
          // Calculate world coordinates for the cell
          const cellSize = this.chunkSize / cellsX;
          const halfChunk = this.chunkSize / 2;
          const halfCell = cellSize / 2;

          const worldX = (cellX * cellSize) - halfChunk + halfCell;
          const worldY = halfChunk - (cellY * cellSize) - halfCell;

          // Create and add the object instance
          const obj = new objectClass(worldX, worldY);
          this.addChildObject(obj);
        }
      }
    }
  }

  /**
   * Converts RGBA values to a hexadecimal string in the format #rrggbbaa.
   *
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @param {number} a - Alpha component (0-255)
   * @returns {string} Hexadecimal color string
   */
  rgbaToHex(r, g, b, a) {
    const toHex = (component) => component.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
  }


  /**
   * Loads an image as a Promise, so we can await it in an async function.
   */
  loadImageAsync(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Converts (r,g,b,a) => "#rrggbbaa" hex string (lowercase).
   */
  rgbaToHex(r, g, b, a) {
    // clamp each to [0..255], then convert to 2-digit hex
    const rh = r.toString(16).padStart(2, "0");
    const gh = g.toString(16).padStart(2, "0");
    const bh = b.toString(16).padStart(2, "0");
    const ah = a.toString(16).padStart(2, "0");
    return `#${rh}${gh}${bh}${ah}`.toLowerCase();
  }
}
