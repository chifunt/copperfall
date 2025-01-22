import { GameObject } from "/js/core/GameObject.js";
import { ParticleSystem } from "/js/components/ParticleSystem.js";

export class ParticleSystemObject extends GameObject {
  constructor(name, config = {}) {
    super(name);
    this.ps = new ParticleSystem(config);
    this.addComponent(this.ps);
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
