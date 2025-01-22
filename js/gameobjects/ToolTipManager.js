// File: /js/managers/ToolTipManager.js

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

    // Corrected selectors with '#' to select by ID
    this.mainMenuToolTip = document.querySelector("#main-menu-tooltip");
    this.gameOverToolTip = document.querySelector("#game-over-tooltip");
    this.openShipMenuToolTip = document.querySelector("#open-ship-menu-tooltip");
    this.shipMenuToolTip = document.querySelector("#ship-menu-tooltip");
    this.movementToolTip = document.querySelector("#movement-tooltip");
    this.dashToolTip = document.querySelector("#dash-tooltip");

    this.activeToolTip = null;
    this.isAnimating = false; // Flag to handle animation state

    // Initialize EventTarget for event handling
    this.eventTarget = new EventTarget();

    // Initialize the tooltip queue
    this.tooltipQueue = [];
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
   * Generic method to show any tooltip with queueing.
   * Ensures the same tooltip isn't queued multiple times.
   * @param {HTMLElement} toolTip - The tooltip element to show.
   */
  showToolTip(toolTip) {
    if (!toolTip) {
      console.error("Tooltip element does not exist.");
      return;
    }

    // If the tooltip is already active, do nothing
    if (this.activeToolTip === toolTip) {
      console.log("Tooltip is already active.");
      return;
    }

    // If the tooltip is already in the queue, do not add it again
    if (this.tooltipQueue.includes(toolTip)) {
      console.log("Tooltip is already in the queue.");
      return;
    }

    // If no tooltip is active and not animating, show immediately
    if (!this.activeToolTip && !this.isAnimating) {
      this._displayToolTip(toolTip);
    } else {
      // Otherwise, add to the queue
      this.tooltipQueue.push(toolTip);
      console.log(`Tooltip queued: ${toolTip.id}`);
    }
  }

  /**
   * Internal method to handle the actual display of the tooltip.
   * @param {HTMLElement} toolTip - The tooltip element to display.
   */
  _displayToolTip(toolTip) {
    this.isAnimating = true; // Set animation flag
    this.activeToolTip = toolTip;
    this.activeToolTip.style.display = "flex";

    // Remove both animation classes to reset any previous states
    this.activeToolTip.classList.remove("tofadein", "tofadeout");

    void this.activeToolTip.offsetWidth; // Trigger reflow

    this.activeToolTip.classList.add("tofadein");

    const onAnimationEnd = () => {
      this.isAnimating = false; // Reset animation flag
      this.activeToolTip.removeEventListener("animationend", onAnimationEnd);

      // Dispatch event indicating a tooltip has been shown
      this.dispatchEvent("toolTipOpened", { toolTip: this.activeToolTip });
    };

    this.activeToolTip.addEventListener("animationend", onAnimationEnd);
  }

  /**
   * Shows the Main Menu Tooltip.
   */
  showMainMenuToolTip() {
    this.showToolTip(this.mainMenuToolTip);
  }

  /**
   * Shows the Game Over Tooltip.
   */
  showGameOverToolTip() {
    this.showToolTip(this.gameOverToolTip);
  }

  /**
   * Shows the Open Ship Menu Tooltip.
   */
  showOpenShipMenuToolTip() {
    this.showToolTip(this.openShipMenuToolTip);
  }

  /**
   * Shows the Ship Menu Tooltip.
   */
  showShipMenuToolTip() {
    this.showToolTip(this.shipMenuToolTip);
  }

  /**
   * Shows the Movement Tooltip.
   */
  showMovementToolTip() {
    this.showToolTip(this.movementToolTip);
  }

  /**
   * Shows the Dash Tooltip.
   */
  showDashToolTip() {
    this.showToolTip(this.dashToolTip);
  }

  /**
   * Closes the currently active tooltip and displays the next one in the queue, if any.
   */
  closeToolTip() {
    if (this.activeToolTip == null) {
      console.log("No active tooltip to close.");
      return;
    }

    if (this.isAnimating) {
      console.log("Animation in progress. Please wait.");
      return;
    }

    this.isAnimating = true; // Set animation flag

    // Remove both animation classes to reset any previous states
    this.activeToolTip.classList.remove("tofadein", "tofadeout");

    void this.activeToolTip.offsetWidth; // Trigger reflow

    this.activeToolTip.classList.add("tofadeout");

    const onAnimationEnd = () => {
      this.isAnimating = false; // Reset animation flag
      this.activeToolTip.removeEventListener("animationend", onAnimationEnd);
      this.activeToolTip.style.display = "none";

      // Dispatch event indicating a tooltip has been closed
      this.dispatchEvent("toolTipClosed", { toolTip: this.activeToolTip });

      this.activeToolTip = null;

      // Check if there are tooltips in the queue
      if (this.tooltipQueue.length > 0) {
        const nextToolTip = this.tooltipQueue.shift();
        console.log(`Displaying next tooltip from queue: ${nextToolTip.id}`);
        this._displayToolTip(nextToolTip);
      }
    };

    this.activeToolTip.addEventListener("animationend", onAnimationEnd);
  }

  /**
   * Clears the entire tooltip queue.
   */
  clearQueue() {
    this.tooltipQueue = [];
    console.log("Tooltip queue cleared.");
  }

  /**
   * Checks if a tooltip is currently active or in the queue.
   * @param {HTMLElement} toolTip - The tooltip element to check.
   * @returns {boolean} - True if the tooltip is active or in the queue, else false.
   */
  isToolTipActiveOrQueued(toolTip) {
    return this.activeToolTip === toolTip || this.tooltipQueue.includes(toolTip);
  }

  update(deltatime) {
    super.update(deltatime);
    // Optionally, handle focus or other dynamic behaviors here
  }
}
