import { BaseChunk } from "./BaseChunk.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";
import { Spaceship } from "/js/gameobjects/Spaceship.js";

export class StarterChunkC extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkC.name, cx, cy, 400);

    const testthing2 = new TestThing2(0, 100, 50, 50);
    this.addChildObject(testthing2);
    this.addChildObject(new Spaceship(0, -50));
  }
}