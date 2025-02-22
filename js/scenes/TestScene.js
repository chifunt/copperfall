import { Scene } from "../core/Scene.js";
import { Background } from "../gameobjects/Background.js";
import { Player } from "../gameobjects/Player.js";
import { TestThing2 } from "../gameobjects/TestThing2.js";
import { InputHandler } from "../gameobjects/InputHandler.js";
import { CameraObject } from "../gameobjects/CameraObject.js";
import { Pickup } from "../gameobjects/Pickup.js";
import { Spaceship } from "../gameobjects/Spaceship.js";
import { DestructibleRock } from "../gameobjects/DestructibleRock.js";
import { EnemyTest } from "../gameobjects/EnemyTest.js";
import { UIManager } from "../gameobjects/UIManager.js";
import { ToolTipManager } from "../gameobjects/ToolTipManager.js";
import { MovementToolTipZone } from "../gameobjects/MovementToolTipZone.js";
import { DashToolTipZone } from "../gameobjects/DashToolTipZone.js";

export class TestScene extends Scene {
  onStart() {
    const background = new Background();

    const inputHandler = new InputHandler();
    const uiManager = new UIManager();
    const toolTipManager = new ToolTipManager();
    const player = new Player();

    new TestThing2(250, 100);
    new TestThing2(250, -50);
    new TestThing2(-250, 50);
    new TestThing2(-250, -100, 100, 50);

    new TestThing2(0, -700, 1450, 50);
    new TestThing2(0, 700, 1450, 50);
    new TestThing2(700, 0, 50, 1450);
    new TestThing2(-700, 0, 50, 1450);

    new MovementToolTipZone(500, -400, 100, 100);
    new DashToolTipZone(500, -600, 100, 100);

    const cameraObj = new CameraObject(player, {
      smoothness: 0.175,
      lookAheadDist: 10,
    });

    new Spaceship(0, 150);

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
    new Pickup({x: -50, y: 600});
    new Pickup({x: -100, y: 600});
    new Pickup({x: -150, y: 600});
    new Pickup({x: -200, y: 600});
    new Pickup({x: -250, y: 600});
    new Pickup({x: 0, y: 600});
    new Pickup({x: 50, y: 600});
    new Pickup({x: 100, y: 600});
    new Pickup({x: 150, y: 600});
    new Pickup({x: 200, y: 600});
    new Pickup({x: 250, y: 600});

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
    new Pickup({x:250,y:-400});

    new EnemyTest(600, -600);
    new EnemyTest(-600, 600);
    new EnemyTest(-600, -600);
    new EnemyTest(600, 600);
  }
}
