export class Engine {
  constructor(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found.`);
    }

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    // Disable image smoothing
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;

    this.lastTime = 0;
    this.gameObjects = [];

    this.virtualWidth = 640;
    this.virtualHeight = 480;
    this.camera = {
      position: { x: 0, y: 0 }, // Camera's position in world space
      scale: 1,                 // Scale factor (zoom level)
    };
    this.updateCameraScale();
    window.addEventListener("resize", () => this.updateCameraScale());

    // Static reference to the engine instance
    Engine.instance = this;
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
      for (const object of this.gameObjects) {
        object.update(deltaTime);
        object.render(this.ctx);
      }

      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}