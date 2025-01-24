import { GameObject } from "../core/GameObject.js";
import { ToolTipManager } from "./ToolTipManager.js";

export class UIManager extends GameObject {
  static instance = null;

  constructor(config = {}) {
    if (UIManager.instance) {
      console.log("UIManager is a singleton and has already been created.");
      return UIManager.instance;
    }

    super("UIManager");
    this.persistent = true;

    UIManager.instance = this;

    // Menu Elements
    this.mainMenu = document.querySelector("#main-menu-container");
    this.shipMenu = document.querySelector("#ship-menu-container");
    this.gameOverMenu = document.querySelector("#game-over-container");
    this.helpMenu = document.querySelector("#help-menu-container");
    this.pauseMenu = document.querySelector("#pause-menu-container");
    this.winMenu = document.querySelector("#win-menu-container");

    this.blackScreen = document.querySelector("#blackscreen");

    this.startButton = document.querySelector("#main-menu-container button");
    this.retryButton = document.querySelector("#game-over-container button");
    this.backtoMenuButton = document.querySelector("#win-menu-container button");

    this.activeMenu = null;
    this.isAnimating = false; // Flag to handle animation state

    // Initialize EventTarget for event handling
    this.eventTarget = new EventTarget();
  }

  /**
   * Retrieves the singleton instance of UIManager.
   * @returns {UIManager}
   */
  static getInstance() {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
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
   * @param {HTMLElement} menu - The menu element to open.
   */
  openMenu(menu) {
    if (!menu) {
      console.error("Menu element does not exist.");
      return;
    }

    if (this.activeMenu !== null) {
      console.log("Another menu is currently active.");
      return;
    }

    if (this.isAnimating) {
      console.log("Animation in progress. Please wait.");
      return;
    }

    this.isAnimating = true; // Set animation flag

    this.activeMenu = menu;
    this.activeMenu.style.display = "flex";

    // **Remove both animation classes to reset any previous states**
    this.activeMenu.classList.remove("tofadein", "tofadeout");

    void this.activeMenu.offsetWidth; // Trigger reflow

    this.activeMenu.classList.add("tofadein");

    const onAnimationEnd = () => {
      this.isAnimating = false; // Reset animation flag
      this.activeMenu.removeEventListener("animationend", onAnimationEnd);

      // Dispatch event indicating a menu has been opened
      this.dispatchEvent("menuOpened", { menu: this.activeMenu });
    };

    this.activeMenu.addEventListener("animationend", onAnimationEnd);
  }

  /**
   * Opens the Ship Menu.
   */
  openShipMenu() {
    this.openMenu(this.shipMenu);
    ToolTipManager.getInstance().closeToolTip();
    ToolTipManager.getInstance().showShipMenuToolTip();
  }

  /**
   * Opens the Pause Menu.
   */
  openPauseMenu() {
    this.openMenu(this.pauseMenu);
  }

  /**
   * Opens the Help Menu.
   */
  openHelpMenu() {
    this.openMenu(this.helpMenu);
  }

  /**
   * Opens the Game Over Menu.
   */
  openGameOverMenu() {
    this.retryButton.disabled = false;
    this.openMenu(this.gameOverMenu);
  }

  /**
   * Opens the Main Menu.
   */
  openMainMenu() {
    this.openMenu(this.mainMenu);
  }

  openWinMenu() {
    this.openMenu(this.winMenu);
  }

  /**
   * Closes the currently active menu.
   */
  closeMenu() {
    if (this.activeMenu == null) return;

    if (this.activeMenu == this.shipMenu) {
      ToolTipManager.getInstance().closeToolTip();
    }

    // Prevent closing critical menus manually
    // if (
    //   this.activeMenu == this.gameOverMenu ||
    //   this.activeMenu == this.mainMenu
    // ) {
    //   console.log("Cannot close the Game Over or Main Menu manually.");
    //   return;
    // }

    if (this.isAnimating) {
      console.log("Animation in progress. Please wait.");
      return;
    }

    this.isAnimating = true; // Set animation flag

    // **Remove both animation classes to reset any previous states**
    this.activeMenu.classList.remove("tofadein", "tofadeout");

    void this.activeMenu.offsetWidth; // Trigger reflow

    this.activeMenu.classList.add("tofadeout");

    const onAnimationEnd = () => {
      this.isAnimating = false; // Reset animation flag
      this.activeMenu.removeEventListener("animationend", onAnimationEnd);
      this.activeMenu.style.display = "none";

      // Dispatch event indicating a menu has been closed
      this.dispatchEvent("menuClosed", { menu: this.activeMenu });

      this.activeMenu = null;
    };

    this.activeMenu.addEventListener("animationend", onAnimationEnd);
  }

  update(deltatime) {
    super.update(deltatime)
    if (this.activeMenu == this.mainMenu) {
      this.startButton.focus();
    }
    if (this.activeMenu == this.gameOverMenu) {
      this.retryButton.focus();
    }
    if (this.activeMenu == this.winMenu) {
      this.backtoMenuButton.focus();
    }
  }
}
