import { BaseChunk } from "./BaseChunk.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";

export class ChunkTypeB extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeB.name, cx, cy, 400);

    const testthing2 = new TestThing2(0, 100, 50, 50);
    this.addChildObject(testthing2);
  }
}