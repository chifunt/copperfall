// /js/scenes/MainScene.js
import { Scene } from "/js/core/Scene.js";
import { Background } from "/js/gameobjects/Background.js";
import { Player } from "/js/gameobjects/Player.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";
import { InputHandler } from "/js/gameobjects/InputHandler.js";
import { CameraObject } from "/js/gameobjects/CameraObject.js";

export class MainScene extends Scene {
  onStart() {
    const background = new Background();

    const inputHandler = new InputHandler();
    const player = new Player(inputHandler);

    new TestThing2(250, 100);
    new TestThing2(250, -50);
    new TestThing2(-250, 100);
    new TestThing2(-250, -100);

    const cameraObj = new CameraObject(player, {
      smoothness: 0.175,
      lookAheadDist: 10,
    });
  }
}
