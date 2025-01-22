import { BaseChunk } from "./BaseChunk.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";
import { MovementToolTipZone } from "/js/gameobjects/MovementToolTipZone.js";

export class StarterChunkA extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkA.name, cx, cy, 400);

    const testthing2 = new TestThing2(0, 100, 50, 50);
    this.addChildObject(testthing2);

    this.addChildObject(new MovementToolTipZone(0, 0, 300, 300))
  }
}