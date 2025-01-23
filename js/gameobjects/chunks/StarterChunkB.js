import { BaseChunk } from "./BaseChunk.js";
import { DashToolTipZone } from "/js/gameobjects/DashToolTipZone.js";

export class StarterChunkB extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkB.name, cx, cy, 400);
    this.loadChunkMap("/assets/images/chunk-maps/start-b.png", false);
    this.addChildObject(new DashToolTipZone(0, 0, 300, 300))
  }
}