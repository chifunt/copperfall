import { GameObject } from "../core/GameObject.js";

export class ToolTipManager extends GameObject {
  static instance = null;

  constructor(config = {}) {
    if (ToolTipManager.instance) {
      console.log("ToolTipManager is a singleton and has already been created.");
      return ToolTipManager.instance;
    }

    super("ToolTipManager");
    this.persistent = true;

    ToolTipManager.instance = this;

    // this.mainMenuToolTip = document.querySelector("");
    // this.gameOverToolTip = document.querySelector("");
    // this.openShipMenuToolTip = document.querySelector("");
    // this.shipMenuToolTip = document.querySelector("");
    // this.movementToolTip = document.querySelector("");
    // this.dashToolTip = document.querySelector("");

    this.activeToolTip = null;
    this.isAnimating = false; // Flag to handle animation state

    // Initialize EventTarget for event handling
    this.eventTarget = new EventTarget();
  }

  /**
   * Retrieves the singleton instance of ToolTipManager.
   * @returns {ToolTipManager}
   */
  static getInstance() {
    if (!ToolTipManager.instance) {
      ToolTipManager.instance = new ToolTipManager();
    }
    return ToolTipManager.instance;
  }

  /**
   * Dispatches custom events.
   * @param {string} eventName - Name of the event.
   * @param {any} detail - Additional data to pass with the event.
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Adds an event listener.
   * @param {string} eventName - Name of the event.
   * @param {Function} callback - Callback function.
   */
  addEventListener(eventName, callback) {
    this.eventTarget.addEventListener(eventName, callback);
  }

  /**
   * Removes an event listener.
   * @param {string} eventName - Name of the event.
   * @param {Function} callback - Callback function.
   */
  removeEventListener(eventName, callback) {
    this.eventTarget.removeEventListener(eventName, callback);
  }

  /**
   * Generic method to open any menu.
   * @param {HTMLElement} toolTip - The menu element to open.
   */
  showToolTip(toolTip) {
    if (!toolTip) {
      console.error("Tooltip element does not exist.");
      return;
    }

    if (this.activeToolTip !== null) {
      console.log("Another Tooltip is currently active.");
      return;
    }

    if (this.isAnimating) {
      console.log("Animation in progress. Please wait.");
      return;
    }

    this.isAnimating = true; // Set animation flag

    this.activeToolTip = toolTip;
    this.activeToolTip.style.display = "flex";

    // **Remove both animation classes to reset any previous states**
    this.activeToolTip.classList.remove("tofadein", "tofadeout");

    void this.activeToolTip.offsetWidth; // Trigger reflow

    this.activeToolTip.classList.add("tofadein");

    const onAnimationEnd = () => {
      this.isAnimating = false; // Reset animation flag
      this.activeToolTip.removeEventListener("animationend", onAnimationEnd);

      // Dispatch event indicating a tooltip has been shown.
      this.dispatchEvent("toolTipOpened", { menu: this.activeToolTip });
    };

    this.activeToolTip.addEventListener("animationend", onAnimationEnd);
  }

  showMainMenuToolTip() {
    this.showToolTip(this.mainMenuToolTip);
  }
  showGameOverToolTip() {
    this.showToolTip(this.gameOverToolTip);
  }
  showOpenShipMenuToolTip() {
    this.showToolTip(this.openShipMenuToolTip);
  }
  showShipMenuToolTip() {
    this.showToolTip(this.shipMenuToolTip);
  }
  showMovementToolTip() {
    this.showToolTip(this.movementToolTip);
  }
  showDashToolTip() {
    this.showToolTip(this.dashToolTip);
  }

  /**
   * Closes the currently active menu.
   */
  closeToolTip() {
    if (this.activeToolTip == null) return;

    if (this.isAnimating) {
      console.log("Animation in progress. Please wait.");
      return;
    }

    this.isAnimating = true; // Set animation flag

    // **Remove both animation classes to reset any previous states**
    this.activeToolTip.classList.remove("tofadein", "tofadeout");

    void this.activeToolTip.offsetWidth; // Trigger reflow

    this.activeToolTip.classList.add("tofadeout");

    const onAnimationEnd = () => {
      this.isAnimating = false; // Reset animation flag
      this.activeToolTip.removeEventListener("animationend", onAnimationEnd);
      this.activeToolTip.style.display = "none";

      // Dispatch event indicating a menu has been closed
      this.dispatchEvent("toolTipClosed", { menu: this.activeToolTip });

      this.activeToolTip = null;
    };

    this.activeToolTip.addEventListener("animationend", onAnimationEnd);
  }
}
