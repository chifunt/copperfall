import { Engine } from "/js/core/Engine.js";

import { Background } from "/js/gameobjects/Background.js";
import { CameraObject } from "/js/gameobjects/CameraObject.js";
import { TestThing } from "/js/gameobjects/TestThing.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";
import { InputHandler } from "/js/gameobjects/InputHandler.js";
import { Player } from "/js/gameobjects/Player.js";

const engine = new Engine("canvas");

const background = new Background();


const testThing = new TestThing2();

const inputHandler = new InputHandler();
const player = new Player(inputHandler);

const cameraObj = new CameraObject(player, {
  smoothness: 0.175,
  lookAheadDist: 10,
});
engine.debugMode = true;
engine.start();