import { GameObject } from "../core/GameObject.js";
import { UIManager } from "./UIManager.js";

export class ShipMenuManager extends GameObject {
  static instance = null;

  constructor(config = {}) {
    if (ShipMenuManager.instance) {
      console.log("ShipMenuManager is a singleton and has already been created.");
      return ShipMenuManager.instance;
    }

    super("ShipMenuManager");

    ShipMenuManager.instance = this;

    this.shipMenu = UIManager.instance.shipMenu;
    this.shipMenuButtons = document.querySelector("#ship-menu-container button");
    this.playerObject = null;
  }

  /**
   * Retrieves the singleton instance of ShipMenuManager.
   * @returns {ShipMenuManager}
   */
  static getInstance() {
    if (!ShipMenuManager.instance) {
      ShipMenuManager.instance = new ShipMenuManager();
    }
    return ShipMenuManager.instance;
  }
}