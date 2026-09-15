import { BaseChunk } from "./BaseChunk.js";
import { Spaceship } from "../../gameobjects/Spaceship.js";
import { TextureBG } from "../TextureBG.js";

export class StarterChunkC extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkC.name, cx, cy, 400);
    this.loadChunkMap(new URL("../../../assets/images/chunk-maps/start-c.png", import.meta.url).href, false);
    this.addChildObject(new Spaceship(0, -100));
    this.addChildObject(new TextureBG(100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, -100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(100, -100, 0.395, 0.395));
  }
}