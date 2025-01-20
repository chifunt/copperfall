import { Engine } from "/js/core/Engine.js";
import { MainMenuScene } from "/js/scenes/MainMenuScene.js"

const engine = new Engine("canvas");

engine.debugMode = true;

engine.loadScene(new MainMenuScene());
engine.start();