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
    // This stuff down here should probably go to the ui manager itself not here lol but whatevs.
    uiManager.startButton.disabled = false;
    uiManager.startButton.addEventListener("click", function () {
      uiManager.startButton.disabled = true;
      UIManager.instance.closeMenu();
      uiManager.blackScreen.classList.remove("activated");
      void uiManager.blackScreen.offsetWidth;
      uiManager.blackScreen.classList.add("activated");
      setTimeout(() => {
        Engine.instance.loadScene(new MainScene());
      }, 500);
    });
    uiManager.retryButton.addEventListener("click", function () {
      UIManager.instance.closeMenu();
      Engine.instance.loadScene(new MainScene());
    });

    new Pickup({ x: 100, y: -100 });
    new Pickup({ x: 150, y: -50 });
    new Pickup({ x: 200, y: 0 });
    new Pickup({ x: 250, y: 50 });
    new Pickup({ x: 300, y: 100 });
    new Pickup({ x: -100, y: -100 });
    new Pickup({ x: -150, y: -50 });
    new Pickup({ x: -200, y: 0 });
    new Pickup({ x: -250, y: 50 });
    new Pickup({ x: -300, y: 100 });
    new TestThing2(0, 250, 900, 10);
    new TestThing2(0, -250, 900, 10);
    new TestThing2(440, 0, 10, 500);
    new TestThing2(-440, 0, 10, 500);

    // For now just load the main scene
    // this.loadMainScene();
  }

  loadMainScene() {
    UIManager.instance.closeMenu();
    Engine.instance.loadScene(new MainScene());
  }
}
