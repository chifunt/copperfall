// /js/core/Scene.js
import { Engine } from "/js/core/Engine.js";

export class Scene {
  constructor() {
    this.gameObjects = []; // All objects in this scene
  }

  start() {
    // Called when the scene is loaded
    console.log(`Starting scene: ${this.constructor.name}`);
    this.onStart();
  }

  onStart() {
    // Override in child scenes to initialize game objects
  }

  destroy() {
    // Clean up all game objects in this scene
    for (const gameObject of this.gameObjects) {
      gameObject.destroy();
    }
    this.gameObjects = [];
    console.log(`Scene destroyed: ${this.constructor.name}`);
  }
}
