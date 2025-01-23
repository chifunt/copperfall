import { BaseChunk } from "./BaseChunk.js";
import { getChunkMapPath, randomChoice, ChunkMapImages } from "./ChunkMapImages.js";

export class ChunkTypeA extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeA.name, cx, cy, 400);

    const possibleMaps = [
      "slashcoin",
      "coinHaven",
      "scatterEnemies",
      "zipzop",
    ];
    const chosenKey = randomChoice(possibleMaps);

    const fullPath = getChunkMapPath(chosenKey);
    if (fullPath) {
      this.loadChunkMap(fullPath);
    } else {
      console.warn(`ChunkTypeA: no valid map path for key="${chosenKey}"`);
    }
  }
}
