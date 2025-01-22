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

    // Initialize the action queue
    this.actionQueue = [];
    this.isProcessing = false;
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
   * Enqueues an action (show or close) to the action queue.
   * Prevents duplicate show actions for the same tooltip and multiple close actions.
   * @param {Object} action - The action object containing type and toolTip.
   */
  enqueueAction(action) {
    if (action.type === 'show') {
      // Prevent duplicate show actions for the same tooltip
      const isAlreadyQueued = this.actionQueue.some(
        (a) => a.type === 'show' && a.toolTip === action.toolTip
      );
      if (isAlreadyQueued) {
        console.log(`Tooltip "${action.toolTip.id}" is already queued to be shown.`);
        return;
      }
    }

    if (action.type === 'close') {
      // Prevent multiple close actions in the queue
      const isCloseQueued = this.actionQueue.some((a) => a.type === 'close');
      if (isCloseQueued) {
        console.log(`A close action is already queued.`);
        return;
      }

      // Also, prevent queuing close if no tooltip is active
      if (!this.activeToolTip && !this.isAnimating) {
        console.log("No active tooltip to close.");
        return;
      }
    }

    // Add the action to the queue
    this.actionQueue.push(action);
    console.log(`Action queued: ${action.type}${action.toolTip ? ` (${action.toolTip.id})` : ''}`);

    // Start processing the queue if not already doing so
    this.processQueue();
  }

  /**
   * Processes the action queue sequentially.
   */
  async processQueue() {
    if (this.isProcessing || this.actionQueue.length === 0) return;

    this.isProcessing = true;
    const action = this.actionQueue.shift();

    try {
      if (action.type === 'show') {
        await this._displayToolTip(action.toolTip);
      } else if (action.type === 'close') {
        await this._hideToolTip();
      }
    } catch (error) {
      console.error(`Error processing action "${action.type}":`, error);
    }

    this.isProcessing = false;

    // Continue processing the next action in the queue
    this.processQueue();
  }

  /**
   * Internal method to handle the actual display of the tooltip.
   * @param {HTMLElement} toolTip - The tooltip element to display.
   * @returns {Promise} - Resolves when the show animation ends.
   */
  _displayToolTip(toolTip) {
    return new Promise((resolve) => {
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
        resolve();
      };

      this.activeToolTip.addEventListener("animationend", onAnimationEnd);
    });
  }

  /**
   * Internal method to handle the actual hiding of the tooltip.
   * @returns {Promise} - Resolves when the hide animation ends.
   */
  _hideToolTip() {
    return new Promise((resolve) => {
      if (!this.activeToolTip) {
        console.log("No active tooltip to hide.");
        resolve();
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
        resolve();
      };

      this.activeToolTip.addEventListener("animationend", onAnimationEnd);
    });
  }

  /**
   * Generic method to show any tooltip with queueing.
   * @param {HTMLElement} toolTip - The tooltip element to show.
   */
  showToolTip(toolTip) {
    this.enqueueAction({ type: 'show', toolTip });
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
   * Closes the currently active tooltip.
   * This action is also queued to maintain order.
   */
  closeToolTip() {
    this.enqueueAction({ type: 'close' });
  }

  /**
   * Clears the entire action queue.
   */
  clearQueue() {
    this.actionQueue = [];
    console.log("Action queue cleared.");
  }

  /**
   * Checks if a tooltip is currently active or in the queue.
   * @param {HTMLElement} toolTip - The tooltip element to check.
   * @returns {boolean} - True if the tooltip is active or in the queue, else false.
   */
  isToolTipActiveOrQueued(toolTip) {
    return (
      this.activeToolTip === toolTip ||
      this.actionQueue.some(
        (action) => action.type === 'show' && action.toolTip === toolTip
      )
    );
  }

  update(deltatime) {
    super.update(deltatime);
    // Optionally, handle focus or other dynamic behaviors here
  }
}
