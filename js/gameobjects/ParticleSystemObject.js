import { GameObject } from "../core/GameObject.js";
import { ParticleSystem } from "../components/ParticleSystem.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";

export class ParticleSystemObject extends GameObject {
  constructor(name, config = {}) {
    super(name);
    this.ps = new ParticleSystem(config);
    this.addComponent(this.ps);

    // Create a transparent image, this is needed for the particles to render over the texturebg lol this is so scuff
    const transparentImg = new Image();
    transparentImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+DhN4AAAAAElFTkSuQmCC';

    transparentImg.onload = () => {
      const spriteRenderer = new SpriteRenderer(transparentImg, { pivot: "center", zOrder: 1 });
      this.addComponent(spriteRenderer);
    };
  }

  playSystem() {
    this.ps.play();
  }

  stopSystem() {
    // This stops new emission, but existing particles keep updating
    this.ps.stop();
  }

  pauseSystemCompletely() {
    // This also stops existing particles from updating
    this.ps.pauseSystem();
  }

  resumeSystem() {
    this.ps.resumeSystem();
  }
}
