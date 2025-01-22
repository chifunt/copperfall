// /js/components/ParticleSystem.js
import { Component } from "/js/core/Component.js";
import { Engine } from "/js/core/Engine.js";

/**
 * ParticleSystem Component
 * Manages the emission, updating, and rendering of particles.
 */
export class ParticleSystem extends Component {
  /**
   * @param {Object} config - Configuration object for the particle system.
   * @param {boolean} [config.loop=true] - If true, the system continuously emits particles (unless manually stopped).
   * @param {boolean} [config.playOnWake=true] - If true, emission starts immediately.
   * @param {number} [config.duration=Infinity] - System lifetime in seconds if not looping.
   * @param {number} [config.rateOverTime=10] - Particles to emit per second (if not burst).
   * @param {boolean} [config.burst=false] - If true, all particles are emitted at once.
   * @param {number} [config.burstCount=20] - Number of particles to emit in a burst.
   * @param {number} [config.spawnRadius=0] - Radius around the system's position for spawning.
   * @param {string} [config.color="#ffffff"] - Particle color (hex or CSS string without alpha).
   * @param {number} [config.particleLifetime=1] - How long each particle lives, in seconds.
   * @param {number} [config.startSize=10] - Starting radius of each particle.
   * @param {boolean} [config.sizeOverTime=false] - If true, the size shrinks (or changes) over time.
   * @param {function} [config.sizeOverTimeFunction] - Custom function for size changes over time.
   * @param {boolean} [config.opacityOverTime=false] - If true, the opacity changes over time.
   * @param {function} [config.opacityOverTimeFunction] - Custom function for opacity changes over time.
   * @param {number} [config.zOrder=0] - Z-order for rendering these particles.
   * @param {number} [config.minInitialSpeed=0] - Minimum initial speed of particles.
   * @param {number} [config.maxInitialSpeed=100] - Maximum initial speed of particles.
   * @param {number} [config.minAngle=0] - Minimum emission angle in degrees.
   * @param {number} [config.maxAngle=360] - Maximum emission angle in degrees.
   * @param {Object} [config.acceleration={x: 0, y: 0}] - Acceleration applied to particles.
   */
  constructor(config = {}) {
    super();
    // Emission/Update States
    this.isEmitting = config.playOnWake ?? true; // Spawns new particles if true
    this.isSystemActive = true; // If false, system won't update or render at all (optional)

    // Basic configs
    this.loop = config.loop ?? true;
    this.playOnWake = config.playOnWake ?? true;
    this.duration = config.duration ?? Infinity;
    this.rateOverTime = config.rateOverTime ?? 10;
    this.burst = config.burst ?? false;
    this.burstCount = config.burstCount ?? 20;
    this.spawnRadius = config.spawnRadius ?? 0;
    this.color = config.color ?? "#ffffff"; // Base color without alpha
    this.particleLifetime = config.particleLifetime ?? 1;
    this.startSize = config.startSize ?? 10;
    this.sizeOverTime = config.sizeOverTime ?? false;
    this.sizeOverTimeFunction = config.sizeOverTimeFunction || null;
    this.opacityOverTime = config.opacityOverTime ?? false;
    this.opacityOverTimeFunction = config.opacityOverTimeFunction || null;
    this.zOrder = config.zOrder ?? 0;

    // Velocity and Acceleration configs
    this.minInitialSpeed = config.minInitialSpeed ?? 0;
    this.maxInitialSpeed = config.maxInitialSpeed ?? 100;
    this.minAngle = config.minAngle ?? 0; // in degrees
    this.maxAngle = config.maxAngle ?? 360; // in degrees
    this.acceleration = config.acceleration || { x: 0, y: 0 };

    this.elapsedTime = 0; // Tracks the system's running time
    this.particles = []; // Store particles in an array
    this.emissionAccumulator = 0; // For rateOverTime emissions
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

  /**
   * Spawns a single particle with random velocity within the configured parameters.
   */
  spawnParticle() {
    // Random angle in radians between minAngle and maxAngle
    const angleDeg = this.minAngle + Math.random() * (this.maxAngle - this.minAngle);
    const angleRad = (angleDeg * Math.PI) / 180;

    // Random speed between min and max
    const speed = this.minInitialSpeed + Math.random() * (this.maxInitialSpeed - this.minInitialSpeed);

    // Velocity components
    const vx = speed * Math.cos(angleRad);
    const vy = speed * Math.sin(angleRad);

    // Random distance within spawnRadius
    const angleSpawn = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.spawnRadius;

    // Get GameObject's current position
    const gx = this.gameObject.transform.position.x;
    const gy = this.gameObject.transform.position.y;

    // Spawn position with spawnRadius
    const px = gx + dist * Math.cos(angleSpawn);
    const py = gy + dist * Math.sin(angleSpawn);

    // Create particle object
    this.particles.push({
      x: px,
      y: py,
      vx: vx,
      vy: vy,
      size: this.startSize,
      lifetime: this.particleLifetime,
      age: 0,
      opacity: 1, // Initial opacity
      // You can add more properties like color variations here
    });
  }

  /**
   * Updates all particles and handles emission.
   * @param {number} deltaTime - Time elapsed since the last frame in seconds.
   */
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

      // Update velocity with acceleration
      p.vx += this.acceleration.x * deltaTime;
      p.vy += this.acceleration.y * deltaTime;

      // Update position with velocity
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;

      // Size over time
      if (this.sizeOverTime) {
        if (this.sizeOverTimeFunction) {
          p.size = this.sizeOverTimeFunction(p.age, p.lifetime, this.startSize);
        } else {
          // Default: linear shrink
          const t = p.age / p.lifetime; // 0 -> 1
          p.size = this.startSize * (1 - t);
        }
      }

      // Opacity over time
      if (this.opacityOverTime) {
        if (this.opacityOverTimeFunction) {
          p.opacity = this.opacityOverTimeFunction(p.age, p.lifetime);
        } else {
          // Default: linear fade
          const t = p.age / p.lifetime; // 0 -> 1
          p.opacity = 1 - t;
        }
      }
    }

    // If not looping and not emitting, and no more particles left, auto-destroy if desired
    if (!this.loop && !this.isEmitting && this.particles.length === 0) {
      // Optional: auto destroy the entire gameobject
      // this.gameObject.destroy();
    }
  }

  /**
   * Renders all active particles as ellipses with opacity.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  render(ctx) {
    if (!this.isSystemActive) return; // If fully paused

    const engine = Engine.instance;
    const camera = engine.camera;

    for (const p of this.particles) {
      // Convert world -> canvas coords
      const screenX = (p.x - camera.position.x) * camera.scale + engine.canvas.width / 2;
      const screenY = (-p.y + camera.position.y) * camera.scale + engine.canvas.height / 2;

      // Determine fill color with opacity
      let fillColor = this.color;
      if (this.opacityOverTime) {
        // Ensure color is in a format that can accept alpha
        // We'll assume `this.color` is a valid CSS color string without alpha
        // We'll use a temporary canvas to parse the color and apply opacity
        const tempCtx = document.createElement("canvas").getContext("2d");
        tempCtx.fillStyle = this.color;
        const computedColor = tempCtx.fillStyle; // This converts the color to rgb(a) format

        // Extract RGB values
        const rgba = this.parseRGBA(computedColor);
        if (rgba) {
          fillColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${p.opacity})`;
        } else {
          // Fallback if parsing fails
          fillColor = `rgba(255, 255, 255, ${p.opacity})`;
        }
      }

      ctx.save();
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.ellipse(
        screenX,
        screenY,
        p.size * camera.scale,
        p.size * camera.scale,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Parses an RGBA color string and returns an object with r, g, b, a components.
   * @param {string} colorStr - The color string in "rgb(r, g, b)" or "rgba(r, g, b, a)" format.
   * @returns {Object|null} - { r, g, b, a } or null if parsing fails.
   */
  parseRGBA(colorStr) {
    const rgbaRegex = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d*\.?\d+))?\)$/;
    const match = colorStr.match(rgbaRegex);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: match[4] !== undefined ? parseFloat(match[4]) : 1,
      };
    }
    return null;
  }
}
