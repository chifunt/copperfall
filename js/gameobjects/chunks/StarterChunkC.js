import { BaseChunk } from "./BaseChunk.js";
import { Spaceship } from "/js/gameobjects/Spaceship.js";

export class StarterChunkC extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkC.name, cx, cy, 400);
    this.loadChunkMap("/assets/images/chunk-maps/start-c.png", false);
    this.addChildObject(new Spaceship(0, -80));
  }
}