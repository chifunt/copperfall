import { Engine } from "/js/core/Engine.js";
import { MainScene } from "/js/scenes/MainScene.js";
import { MainMenuScene } from "/js/scenes/MainMenuScene.js"

const engine = new Engine("canvas");

engine.debugMode = true;

// engine.loadScene(new MainScene());
engine.loadScene(new MainMenuScene());
engine.start();