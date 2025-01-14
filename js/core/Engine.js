import { SpriteRenderer } from "/js/components/SpriteRenderer.js";

export class Engine {
  constructor(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found.`);
    }

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.lastTime = 0;
    this.gameObjects = [];

    this.virtualWidth = 640;
    this.virtualHeight = 480;
    this.camera = {
      position: { x: 0, y: 0 }, // Camera's position in world space
      scale: 1, // Scale factor (zoom level)
    };
    this.setupResizeListener();

    // Static reference to the engine instance (singleton)
    Engine.instance = this;
  }

  setupResizeListener() {
    const resizeCanvas = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Maintain stated aspect ratio
      const aspectRatio = 16 / 9;
      let canvasWidth, canvasHeight;

      if (windowWidth / windowHeight < aspectRatio) {
        // Window is taller than stated aspect ratio
        canvasWidth = windowWidth;
        canvasHeight = windowWidth / aspectRatio;
      } else {
        // Window is wider than stated aspect ratio
        canvasHeight = windowHeight;
        canvasWidth = windowHeight * aspectRatio;
      }

      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;

      this.updateCameraScale();
    };

    // Attach resize event listener
    window.addEventListener("resize", resizeCanvas);

    // Initial resize
    resizeCanvas();
  }

  updateCameraScale() {
    // e.g. Fit to width or fit to height, or do min to keep aspect ratio
    const scaleX = this.canvas.width / this.virtualWidth;
    const scaleY = this.canvas.height / this.virtualHeight;

    // If you want to fill the entire canvas while maintaining aspect ratio:
    this.camera.scale = Math.min(scaleX, scaleY);
  }

  addGameObject(gameObject) {
    console.log(gameObject.name + " GameObject Added")
    this.gameObjects.push(gameObject);
  }

  start() {
    const gameLoop = (currentTime) => {
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.gameObjects = this.gameObjects.filter(object => !object.isDestroyed);

      this.gameObjects.sort((a, b) => {
        const aRenderer = a.getComponent(SpriteRenderer);
        const bRenderer = b.getComponent(SpriteRenderer);

        if (aRenderer && bRenderer) {
          return aRenderer.zOrder - bRenderer.zOrder;
        }
        if (aRenderer && !bRenderer) return 1;   // b has no renderer, so a is "on top"
        if (!aRenderer && bRenderer) return -1; // a has no renderer, b is "on top"
        return 0; // neither has a renderer
      });

      for (const object of this.gameObjects) {
        object.update(deltaTime);
        object.render(this.ctx);
      }

      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}