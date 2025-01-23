import { BaseChunk } from "./BaseChunk.js";
import { Spaceship } from "/js/gameobjects/Spaceship.js";
import { TextureBG } from "../TextureBG.js";

export class StarterChunkC extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkC.name, cx, cy, 400);
    this.loadChunkMap("/assets/images/chunk-maps/start-c.png", false);
    this.addChildObject(new Spaceship(0, -80));
    this.addChildObject(new TextureBG(100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, -100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(100, -100, 0.395, 0.395));
  }
}