import { GameObject } from "../core/GameObject.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { ToolTipManager } from "./ToolTipManager.js";

export class DashToolTipZone extends GameObject {
  constructor(posx = 0, posy = 0, triggerwidth = 100, triggerheight = 100) {
    super("DashToolTipZone");

    // Set initial position and scale
    this.transform.position = { x: posx, y: posy };
    this.transform.scale = { x: triggerwidth, y: triggerheight };

    const mainCollider = new BoxCollider({
      width: triggerwidth,
      height: triggerheight,
      offset: { x: 0, y: 0 },
      isTrigger: true,
    });
    this.addComponent(mainCollider);

    mainCollider.onTriggerEnter = (other) => {
      if (other.gameObject.name == "Player" && other.isTrigger) {
        ToolTipManager.getInstance().showDashToolTip();
      }
    }

    mainCollider.onTriggerExit = (other) => {
      if (other.gameObject.name == "Player" && other.isTrigger) {
        ToolTipManager.getInstance().closeToolTip();
      }
    }
  }
}