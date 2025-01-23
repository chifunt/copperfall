import { BaseChunk } from "./BaseChunk.js";
import { getChunkMapPath, randomChoice } from "./ChunkMapImages.js";
import { TextureBG } from "../TextureBG.js";

export class ChunkTypeA extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeA.name, cx, cy, 400);
    this.addChildObject(new TextureBG(100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, -100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(100, -100, 0.395, 0.395));

    const possibleMaps = [
      "slashcoin",
      "scatterEnemies",
      "zipzop",
      "corderDawgs",
      "ladder",
      "sidei",
      "rotor",
      "crack"
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
