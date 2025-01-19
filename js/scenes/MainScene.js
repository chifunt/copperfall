// /js/scenes/MainScene.js
import { Scene } from "/js/core/Scene.js";
import { Background } from "/js/gameobjects/Background.js";
import { Player } from "/js/gameobjects/Player.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";
import { InputHandler } from "/js/gameobjects/InputHandler.js";
import { CameraObject } from "/js/gameobjects/CameraObject.js";
import { Pickup } from "/js/gameobjects/Pickup.js";
import { Spaceship } from "../gameobjects/Spaceship.js";
import { DestructibleRock } from "../gameobjects/DestructibleRock.js";

export class MainScene extends Scene {
  onStart() {
    const background = new Background();

    const inputHandler = new InputHandler();
    const player = new Player();

    new TestThing2(250, 100);
    new TestThing2(250, -50);
    new TestThing2(-250, 50);
    new TestThing2(-250, -100, 100, 50);

    new TestThing2(0, -700, 1450, 50);
    new TestThing2(0, 700, 1450, 50);
    new TestThing2(700, 0, 50, 1450);
    new TestThing2(-700, 0, 50, 1450);


    const cameraObj = new CameraObject(player, {
      smoothness: 0.175,
      lookAheadDist: 10,
    });

    new Spaceship();

    new Pickup({x: 100, y: -200});
    new Pickup({x: 50, y: -200});
    new Pickup({x: 0, y: -200});
    new Pickup({x: -50, y: -200});
    new Pickup({x: 100, y: 400});
    new Pickup({x: 50, y: 400});
    new Pickup({x: 0, y: 400});
    new Pickup({x: -50, y: 400});
    new Pickup({x: 250, y: 25});
    new Pickup({x: 350, y: 25});
    new Pickup({x: -250, y: -40});
    new Pickup({x: -300, y: -40});
    new Pickup({x: -350, y: -40});

    new Pickup({x: -50, y: -600});
    new Pickup({x: -100, y: -600});
    new Pickup({x: -150, y: -600});
    new Pickup({x: -200, y: -600});
    new Pickup({x: -250, y: -600});
    new Pickup({x: 0, y: -600});
    new Pickup({x: 50, y: -600});
    new Pickup({x: 100, y: -600});
    new Pickup({x: 150, y: -600});
    new Pickup({x: 200, y: -600});
    new Pickup({x: 250, y: -600});

    new DestructibleRock(10, -400);
    new DestructibleRock(10, -330);
    new DestructibleRock(10, -470);
    new DestructibleRock(140, -400);
    new DestructibleRock(140, -330);
    new DestructibleRock(140, -470);
    new DestructibleRock(75, -330);
    new DestructibleRock(75, -470);
    new DestructibleRock(300, 25);
    new Pickup({x:75,y:-400});
  }
}
