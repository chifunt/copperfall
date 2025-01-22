// /js/components/ParticleSystem.js
import { Component } from "/js/core/Component.js";
import { Engine } from "/js/core/Engine.js";

export class ParticleSystem extends Component {
  /**
   * @param {Object} config
   * @param {boolean} [config.loop=true]        - If true, the system continuously emits particles (unless manually stopped).
   * @param {boolean} [config.playOnWake=true]  - If true, emission starts immediately.
   * @param {number} [config.duration=Infinity] - System lifetime in seconds if not looping.
   * @param {number} [config.rateOverTime=10]   - Particles to emit per second (if not burst).
   * @param {boolean} [config.burst=false]      - If true, all particles are emitted at once.
   * @param {number} [config.burstCount=20]     - Number of particles to emit in a burst.
   * @param {number} [config.spawnRadius=0]     - Radius around the system's position for spawning.
   * @param {string} [config.color="#ffffff"]   - Particle color (hex or CSS string).
   * @param {number} [config.particleLifetime=1]- How long each particle lives, in seconds.
   * @param {number} [config.startSize=10]      - Starting radius of each particle.
   * @param {boolean} [config.sizeOverTime=false] - If true, the size shrinks (or changes) over time.
   * @param {function} [config.sizeOverTimeFunction] - Custom function for size changes over time.
   * @param {number} [config.zOrder=0]          - Z-order for rendering these particles.
   */
  constructor(config = {}) {
    super();
    // Emission/Update States
    this.isEmitting = config.playOnWake ?? true; // Spawns new particles if true
    this.isSystemActive = true;  // If false, system won't update or render at all (optional)

    // Basic configs
    this.loop = config.loop ?? true;
    this.playOnWake = config.playOnWake ?? true;
    this.duration = config.duration ?? Infinity;
    this.rateOverTime = config.rateOverTime ?? 10;
    this.burst = config.burst ?? false;
    this.burstCount = config.burstCount ?? 20;
    this.spawnRadius = config.spawnRadius ?? 0;
    this.color = config.color ?? "#ffffff";
    this.particleLifetime = config.particleLifetime ?? 1;
    this.startSize = config.startSize ?? 10;
    this.sizeOverTime = config.sizeOverTime ?? false;
    this.sizeOverTimeFunction = config.sizeOverTimeFunction || null;
    this.zOrder = config.zOrder ?? 0;

    this.elapsedTime = 0;
    this.particles = [];            // Array of active particles
    this.emissionAccumulator = 0;   // For rateOverTime logic
  }

  start() {
    // If it's a burst system and we start automatically, emit burst immediately
    if (this.burst && this.playOnWake) {
      this.emitBurst();
    }
  }

  /**
   * Play the system: re-enable emission if it was off.
   */
  play() {
    this.isEmitting = true;
    this.elapsedTime = 0;

    if (this.burst) {
      this.emitBurst();
    }
  }

  /**
   * Stop the system from emitting new particles, but keep updating existing particles.
   */
  stop() {
    this.isEmitting = false;
  }

  /**
   * Completely pause the system update (i.e., no spawn *and* no particle updates).
   * Only call this if you want to freeze the entire system visually.
   */
  pauseSystem() {
    this.isSystemActive = false;
  }

  /**
   * Resume after pausing.
   */
  resumeSystem() {
    this.isSystemActive = true;
  }

  /**
   * Immediately spawns `burstCount` particles.
   */
  emitBurst() {
    for (let i = 0; i < this.burstCount; i++) {
      this.spawnParticle();
    }
  }

  spawnParticle() {
    // random angle + distance
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.spawnRadius;

    // gameObject transform
    const gx = this.gameObject.transform.position.x;
    const gy = this.gameObject.transform.position.y;

    // local position
    const px = gx + dist * Math.cos(angle);
    const py = gy + dist * Math.sin(angle);

    this.particles.push({
      x: px,
      y: py,
      size: this.startSize,
      lifetime: this.particleLifetime,
      age: 0
      // velocity, color, alpha, etc. can be added here
    });
  }

  update(deltaTime) {
    // If the entire system is inactive, skip everything
    if (!this.isSystemActive) return;

    this.elapsedTime += deltaTime;

    // If we have a finite duration and we've exceeded it, turn off emission
    if (!this.loop && this.elapsedTime >= this.duration) {
      this.isEmitting = false;
    }

    // If emission is on and it's not a burst system, spawn new particles at rateOverTime
    if (this.isEmitting && !this.burst) {
      this.emissionAccumulator += deltaTime * this.rateOverTime; // e.g. 10 particles/sec
      while (this.emissionAccumulator >= 1) {
        this.spawnParticle();
        this.emissionAccumulator -= 1;
      }
    }

    // Always update existing particles (even if emission is off)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += deltaTime;
      if (p.age >= p.lifetime) {
        // Remove expired particle
        this.particles.splice(i, 1);
        continue;
      }

      // Example: velocity if you want
      // p.x += p.vx * deltaTime;
      // p.y += p.vy * deltaTime;

      // Size over time
      if (this.sizeOverTime) {
        if (this.sizeOverTimeFunction) {
          p.size = this.sizeOverTimeFunction(p.age, p.lifetime, this.startSize);
        } else {
          // default linear scale from startSize -> 0
          const t = p.age / p.lifetime; // 0 -> 1
          p.size = this.startSize * (1 - t);
        }
      }
    }

    // If not looping and not emitting, and no more particles left, auto-destroy if desired
    if (!this.loop && !this.isEmitting && this.particles.length === 0) {
      // Optional: auto destroy the entire gameobject
      // this.gameObject.destroy();
    }
  }

  render(ctx) {
    if (!this.isSystemActive) return;  // If fully paused

    const engine = Engine.instance;
    const camera = engine.camera;

    for (const p of this.particles) {
      // Convert world -> canvas coords
      const screenX = (p.x - camera.position.x) * camera.scale + engine.canvas.width / 2;
      const screenY = (-p.y + camera.position.y) * camera.scale + engine.canvas.height / 2;

      // If you want alpha fade
      // let alpha = 1 - (p.age / p.lifetime);
      // let fillColor = `rgba(255,255,255,${alpha})`;

      ctx.save();
      ctx.fillStyle = this.color; // Or fillColor if alpha fade
      ctx.beginPath();
      ctx.ellipse(screenX, screenY, p.size * camera.scale, p.size * camera.scale, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
  }
}
