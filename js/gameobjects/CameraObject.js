import { GameObject } from "/js/core/GameObject.js";
import { CameraFollow } from "/js/components/CameraFollow.js";

export class CameraObject extends GameObject {
  constructor(player, config = {}) {
    super("CameraObject");

    // Add the CameraFollow component, passing the player as the target
    const cameraFollow = new CameraFollow({
      target: player,
      smoothness: config.smoothness ?? 0.1,
      lookAheadDist: config.lookAheadDist ?? 0,
    });
    this.addComponent(cameraFollow);
  }
}
