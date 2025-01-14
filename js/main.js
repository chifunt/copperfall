import { Engine } from "/js/core/Engine.js";

import { TestThing } from "/js/gameobjects/TestThing.js";
import { Background } from "/js/gameobjects/Background.js";

const engine = new Engine("canvas");

const background = new Background();
const testThing = new TestThing(engine.canvas);

engine.start();