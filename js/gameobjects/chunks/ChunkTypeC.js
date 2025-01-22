import { BaseChunk } from "./BaseChunk.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";

export class ChunkTypeC extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeC.name, cx, cy, 400);

    const testthing2 = new TestThing2(0, 100, 50, 50);
    this.addChildObject(testthing2);
  }
}