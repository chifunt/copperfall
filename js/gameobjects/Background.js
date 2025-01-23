import { GameObject } from "../core/GameObject.js";
import { BackgroundRenderer } from "../components/BackgroundRenderer.js";

export class Background extends GameObject {
  constructor() {
    super("Background");
    // this.addComponent(new BackgroundRenderer("#503030"));
    this.addComponent(new BackgroundRenderer("#403d52"));
  }
}