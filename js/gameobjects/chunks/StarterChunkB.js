import { BaseChunk } from "./BaseChunk.js";
import { TestThing2 } from "/js/gameobjects/TestThing2.js";
import { DashToolTipZone } from "/js/gameobjects/DashToolTipZone.js";

export class StarterChunkB extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkB.name, cx, cy, 400);

    const testthing2 = new TestThing2(0, 100, 50, 50);
    this.addChildObject(testthing2);
    this.addChildObject(new DashToolTipZone(0, 0, 300, 300))
  }
}