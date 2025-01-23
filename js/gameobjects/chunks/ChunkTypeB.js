import { BaseChunk } from "./BaseChunk.js";

export class ChunkTypeB extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeB.name, cx, cy, 400);

    this.loadChunkMap("/assets/images/chunk-maps/zipzop.png");
  }
}