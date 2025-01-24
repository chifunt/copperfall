import { Engine } from "./core/Engine.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { MainScene } from "./scenes/MainScene.js";

const engine = new Engine("canvas");

// engine.debugMode = true;

engine.loadScene(new MainMenuScene());
// engine.loadScene(new MainScene());
engine.start();