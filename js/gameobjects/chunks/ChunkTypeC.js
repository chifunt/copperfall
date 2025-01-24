import { BaseChunk } from "./BaseChunk.js";
import { getChunkMapPath, randomChoice } from "./ChunkMapImages.js";
import { TextureBG } from "../TextureBG.js";

export class ChunkTypeC extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeC.name, cx, cy, 400);
    this.addChildObject(new TextureBG(100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, -100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(100, -100, 0.395, 0.395));

    const possibleMaps = [
      "coinHaven",
      "driven",
      "amog",
      "rainbow",
      "sosh",
      "pool",
      "burp",
      "wheel"
    ];
    const chosenKey = randomChoice(possibleMaps);

    const fullPath = getChunkMapPath(chosenKey);
    if (fullPath) {
      this.loadChunkMap(fullPath);
    } else {
      console.warn(`ChunkTypeC: no valid map path for key="${chosenKey}"`);
    }
  }
}