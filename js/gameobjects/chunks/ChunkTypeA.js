import { BaseChunk } from "./BaseChunk.js";

export class ChunkTypeA extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeA.name, cx, cy, 400);

    this.loadChunkMap("/assets/images/chunk-maps/slashcoin.png");
  }
}