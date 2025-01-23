import { BaseChunk } from "./BaseChunk.js";
import { getChunkMapPath, randomChoice} from "./ChunkMapImages.js";

export class ChunkTypeB extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeB.name, cx, cy, 400);

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
      console.warn(`ChunkTypeB: no valid map path for key="${chosenKey}"`);
    }
  }
}