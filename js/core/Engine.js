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
    this.camera = {
      position: { x: 0, y: 0 }, // Camera's position in world space
      scale: 1,                 // Scale factor (zoom level)
    };

    // Static reference to the engine instance
    Engine.instance = this;
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