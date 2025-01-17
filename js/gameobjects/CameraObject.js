import { GameObject } from "/js/core/GameObject.js";
import { CameraFollow } from "/js/components/CameraFollow.js";
import { ScreenShake } from "/js/components/ScreenShake.js";

export class CameraObject extends GameObject {
  /**
   * Constructs the CameraObject.
   * @param {GameObject} player - The player GameObject to follow.
   * @param {Object} config - Optional configuration for CameraFollow.
   */
  constructor(player, config = {}) {
    super("CameraObject");

    // Add the CameraFollow component first
    const cameraFollow = new CameraFollow({
      target: player,
      smoothness: config.smoothness ?? 0.1,
      lookAheadDist: config.lookAheadDist ?? 0,
    });
    this.addComponent(cameraFollow);

    // Add the ScreenShake component second
    const screenShake = new ScreenShake();
    this.addComponent(screenShake);
  }
}
