import { BaseChunk } from "./BaseChunk.js";
import { MovementToolTipZone } from "../../gameobjects/MovementToolTipZone.js";
import { TextureBG } from "/js/gameobjects/TextureBG.js";

export class StarterChunkA extends BaseChunk {
  constructor(cx, cy) {
    super(StarterChunkA.name, cx, cy, 400);
    this.loadChunkMap("../../../assets/images/chunk-maps/start-a.png", false);
    this.addChildObject(new MovementToolTipZone(0, 0, 300, 300))
    this.addChildObject(new TextureBG(100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, -100, 0.395, 0.395));
    this.addChildObject(new TextureBG(-100, 100, 0.395, 0.395));
    this.addChildObject(new TextureBG(100, -100, 0.395, 0.395));
  }
}