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
      const aspectRatio = 4 / 3;
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
      for (const object of this.gameObjects) {
        object.update(deltaTime);
        object.render(this.ctx);
      }

      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}