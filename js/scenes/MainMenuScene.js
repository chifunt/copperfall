// /js/scenes/MainScene.js
import { Scene } from "/js/core/Scene.js";
import { Background } from "/js/gameobjects/Background.js";
import { InputHandler } from "/js/gameobjects/InputHandler.js";
import { Engine } from "../core/Engine.js";
import { MainScene } from "./MainScene.js";

export class MainMenuScene extends Scene {
  onStart() {
    const background = new Background();
    const inputHandler = new InputHandler();

    // For now just load the main scene
    Engine.instance.loadScene(new MainScene());
  }
}
