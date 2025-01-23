import { BaseChunk } from "./BaseChunk.js";
import { MovementToolTipZone } from "/js/gameobjects/MovementToolTipZone.js";

export class StarterChunkA extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkA.name, cx, cy, 400);
    this.loadChunkMap("/assets/images/chunk-maps/start-a.png", false);
    this.addChildObject(new MovementToolTipZone(0, 0, 300, 300))
  }
}