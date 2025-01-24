import { BaseChunk } from "./BaseChunk.js";
import { DashToolTipZone } from "../../gameobjects/DashToolTipZone.js";
import { TextureBG } from "../TextureBG.js";

export class StarterChunkB extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkB.name, cx, cy, 400);
    this.loadChunkMap("../../../assets/images/chunk-maps/start-b.png", false);
    this.addChildObject(new DashToolTipZone(0, 0, 300, 300))
    this.addChildObject(new TextureBG(100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, -100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(100, -100, 0.395, 0.395));
  }
}