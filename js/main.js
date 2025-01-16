import { Engine } from "/js/core/Engine.js";
import { MainScene } from "/js/scenes/MainScene.js";

const engine = new Engine("canvas");

engine.debugMode = true;

engine.loadScene(new MainScene());
engine.start();