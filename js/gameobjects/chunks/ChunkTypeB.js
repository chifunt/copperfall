import { BaseChunk } from "./BaseChunk.js";
import { getChunkMapPath, randomChoice } from "./ChunkMapImages.js";
import { TextureBG } from "../TextureBG.js";

export class ChunkTypeB extends BaseChunk {
  constructor(cx, cy) {
    super(ChunkTypeB.name, cx, cy, 400);
    this.addChildObject(new TextureBG(100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, -100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(100, -100, 0.395, 0.395));

    const possibleMaps = [
      "actually",
      "woops",
      "gaol",
      "monsie",
      "capsule",
      "watch",
      "cross",
      "aye",
      "smile",
      "legma",
      "coinHaven"
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