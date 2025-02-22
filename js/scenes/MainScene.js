import { Scene } from "../core/Scene.js";
import { Background } from "../gameobjects/Background.js";
import { Player } from "../gameobjects/Player.js";
import { InputHandler } from "../gameobjects/InputHandler.js";
import { CameraObject } from "../gameobjects/CameraObject.js";
import { UIManager } from "../gameobjects/UIManager.js";
import { ToolTipManager } from "../gameobjects/ToolTipManager.js";
import { ChunkManager } from "../gameobjects/ChunkManager.js";

export class MainScene extends Scene {
  onStart() {
    // const background = new Background();

    const inputHandler = new InputHandler();
    const uiManager = new UIManager();
    const toolTipManager = new ToolTipManager();
    const player = new Player();
    const cameraObj = new CameraObject(player, {
      smoothness: 0.175,
      lookAheadDist: 10,
    });

    // Instantiate Chunk Generator Here
    const chunkManager = new ChunkManager(player, {});
  }
}
