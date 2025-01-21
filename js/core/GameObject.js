import { Transform } from "/js/core/Transform.js";
import { Engine } from "/js/core/Engine.js";

export class GameObject {
  constructor(name) {
    this.name = name;
    this.transform = new Transform();
    this.components = [];
    this.isDestroyed = false;
    this.persistent = false;

    // Automatically register with the Engine
    if (Engine.instance) {
      Engine.instance.addGameObject(this);
    } else {
      console.warn(`No Engine instance found. "${this.name}" cannot be added to the game.`);
    }
  }

  addComponent(component) {
    component.gameObject = this;
    this.components.push(component);
    if (typeof component.start === 'function') component.start();
  }

  getComponent(type) {
    return this.components.find(component => component instanceof type);
  }

  update(deltaTime) {
    for (const component of this.components) {
      if (typeof component.update === 'function') {
        component.update(deltaTime);
      }
    }
  }

  render(ctx) {
    for (const component of this.components) {
      if (typeof component.render === 'function') {
        component.render(ctx);
      }
    }
  }

  destroy() {
    this.isDestroyed = true;
  }
}