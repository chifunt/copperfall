import { BackgroundRenderer } from "/js/components/BackgroundRenderer.js";
import { Engine } from "/js/core/Engine.js";
import { GameObject } from "/js/core/GameObject.js";
import { TestThing } from "/js/gameobjects/TestThing.js";

const engine = new Engine("canvas");

const background = new GameObject("Background");
background.addComponent(new BackgroundRenderer("black"));

const testThing = new TestThing(engine.canvas);

engine.start();