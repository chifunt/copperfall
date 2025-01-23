import { Scene } from "/js/core/Scene.js";
import { Background } from "/js/gameobjects/Background.js";
import { InputHandler } from "/js/gameobjects/InputHandler.js";
import { Engine } from "../core/Engine.js";
import { MainScene } from "./MainScene.js";
import { UIManager } from "../gameobjects/UIManager.js";
import { Pickup } from "../gameobjects/Pickup.js";
import { TestThing2 } from "../gameobjects/TestThing2.js";
import { ToolTipManager } from "/js/gameobjects/ToolTipManager.js";
import { TextureBG } from "../gameobjects/TextureBG.js";
import { EnemyTest } from "../gameobjects/EnemyTest.js";
import { Spaceship } from "../gameobjects/Spaceship.js";
import { EnemyPatrol } from "../gameobjects/EnemyPatrol.js";
import { Rock } from "../gameobjects/Rock.js";

export class MainMenuScene extends Scene {
  onStart() {
    const background = new Background();
    const inputHandler = new InputHandler();
    const uiManager = new UIManager();
    const toolTipManager = new ToolTipManager();

    Engine.instance.camera.position = {x: 0, y: 0};

    uiManager.openMainMenu();
    ToolTipManager.getInstance().showMainMenuToolTip();
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
      ToolTipManager.getInstance().closeToolTip();
    });
    uiManager.retryButton.addEventListener("click", function () {
      UIManager.instance.closeMenu();
      ToolTipManager.getInstance().closeToolTip();
      Engine.instance.loadScene(new MainScene());
    });
    uiManager.backtoMenuButton.addEventListener("click", function () {
      UIManager.instance.closeMenu();
      setTimeout(() => {
        Engine.instance.loadScene(new MainMenuScene());
      }, 500);
    });

    new Pickup(100, -100);
    new Pickup(150, -50);
    new Pickup(200, 0);
    new Pickup(250, 50);
    new Pickup(300, 100);
    new Pickup(-100, -100);
    new Pickup(-150, -50);
    new Pickup(-200, 0);
    new Pickup(-250, 50);
    new Pickup(-300, 100);
    new TestThing2(0, 250, 900, 10);
    new TestThing2(0, -250, 900, 10);
    new TestThing2(440, 0, 10, 500);
    new TestThing2(-440, 0, 10, 500);

    new TextureBG(100, 100, 0.395, 0.395);
    new TextureBG(100, 300, 0.395, 0.395);
    new TextureBG(100, -300, 0.395, 0.395);
    new TextureBG(-100, -100, 0.395, 0.395);
    new TextureBG(-300, 100, 0.395, 0.395);
    new TextureBG(100, -100, 0.395, 0.395);
    new TextureBG(300, 300, 0.395, 0.395);
    new TextureBG(-300, -300, 0.395, 0.395);
    new TextureBG(-300, 300, 0.395, 0.395);
    new TextureBG(300, -300, 0.395, 0.395);
    new TextureBG(300, -100, 0.395, 0.395);
    new TextureBG(300, 100, 0.395, 0.395);
    new TextureBG(500, 100, 0.395, 0.395);
    new TextureBG(500, -100, 0.395, 0.395);
    new TextureBG(500, -300, 0.395, 0.395);
    new TextureBG(500, 300, 0.395, 0.395);
    new TextureBG(-100, 300, 0.395, 0.395);
    new TextureBG(-100, -300, 0.395, 0.395);
    new TextureBG(-100, 100, 0.395, 0.395);
    new TextureBG(-300, -100, 0.395, 0.395);
    new TextureBG(-500, 100, 0.395, 0.395);
    new TextureBG(-500, -100, 0.395, 0.395);
    new TextureBG(-500, -300, 0.395, 0.395);
    new TextureBG(-500, 300, 0.395, 0.395);

    new EnemyTest(300, -120);
    new EnemyTest(-300, -120);
    new EnemyPatrol(150, 150);
    new EnemyPatrol(-150, 150);
    this.spaceship = new Spaceship(0, 0);
    this.spaceship.repairSpaceShip();
    this.spaceship.repairSpaceShip();

    new Rock(450, 0);
    new Rock(400, 0);
    new Rock(350, 0);
    new Rock(300, 0);
    new Rock(-450, 0);
    new Rock(-400, 0);
    new Rock(-350, 0);
    new Rock(-300, 0);
    new Rock(450, 50);
    new Rock(400, 50);
    new Rock(350, 50);
    new Rock(300, 50);
    new Rock(-450, 50);
    new Rock(-400, 50);
    new Rock(-350, 50);
    new Rock(-300, 50);

    // For now just load the main scene
    // this.loadMainScene();
  }

  loadMainScene() {
    UIManager.instance.closeMenu();
    Engine.instance.loadScene(new MainScene());
  }
}
