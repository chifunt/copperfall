import { Scene } from "/js/core/Scene.js";
import { Background } from "/js/gameobjects/Background.js";
import { InputHandler } from "/js/gameobjects/InputHandler.js";
import { Engine } from "../core/Engine.js";
import { MainScene } from "./MainScene.js";
import { UIManager } from "../gameobjects/UIManager.js";
import { Pickup } from "../gameobjects/Pickup.js";
import { TestThing2 } from "../gameobjects/TestThing2.js";

export class MainMenuScene extends Scene {
  onStart() {
    const background = new Background();
    const inputHandler = new InputHandler();
    const uiManager = new UIManager();

    uiManager.openMainMenu();

    new Pickup({ x: 50, y: -100 });
    new Pickup({ x: 100, y: -50 });
    new Pickup({ x: 150, y: 0 });
    new Pickup({ x: 200, y: 50 });
    new Pickup({ x: 250, y: 100 });
    new Pickup({ x: -50, y: -100 });
    new Pickup({ x: -100, y: -50 });
    new Pickup({ x: -150, y: 0 });
    new Pickup({ x: -200, y: 50 });
    new Pickup({ x: -250, y: 100 });
    new TestThing2(0, 250, 900, 10);
    new TestThing2(0, -250, 900, 10);
    new TestThing2(440, 0, 10, 500);
    new TestThing2(-440, 0, 10, 500);

    // For now just load the main scene
    this.loadMainScene();
  }

  loadMainScene() {
    setTimeout(() => {
      UIManager.instance.closeMenu();
      Engine.instance.loadScene(new MainScene());
    }, 1000); // 2000 milliseconds = 2 seconds
  }
}
