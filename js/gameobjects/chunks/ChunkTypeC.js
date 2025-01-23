import { BaseChunk } from "./BaseChunk.js";

export class ChunkTypeC extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeC.name, cx, cy, 400);
    this.loadChunkMap("/assets/images/chunk-maps/coin-haven.png");
  }
}