import { GameObject } from "../core/GameObject.js";

export class UIManager extends GameObject {
  static instance = null;

  constructor(config = {}) {
    if (UIManager.instance) {
      console.log("UIManager is a singleton and has already been created.");
      return UIManager.instance;
    }

    super("UIManager");

    UIManager.instance = this;

    this.activeMenu = null;
    this.mainMenu = document.querySelector("#main-menu-container");
    this.shipMenu = document.querySelector("#ship-menu-container");
    this.gameOverMenu = document.querySelector("#game-over-container");
    this.helpMenu = document.querySelector("#help-menu-container");
    this.pauseMenu = document.querySelector("#pause-menu-container");

    this.isAnimating = false; // Flag to handle animation state
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

  openShipMenu() {
    if (this.activeMenu != null) {
      console.log("Another menu is currently active.");
      return;
    }

    if (this.isAnimating) {
      console.log("Animation in progress. Please wait.");
      return;
    }

    this.isAnimating = true; // Set animation flag

    this.activeMenu = this.shipMenu;
    this.activeMenu.style.display = "flex";

    // **Remove both animation classes to reset any previous states**
    this.activeMenu.classList.remove("tofadein", "tofadeout");

    void this.activeMenu.offsetWidth; // Trigger reflow

    this.activeMenu.classList.add("tofadein");

    const onAnimationEnd = () => {
      this.isAnimating = false; // Reset animation flag
      this.activeMenu.removeEventListener("animationend", onAnimationEnd);
    };

    this.activeMenu.addEventListener("animationend", onAnimationEnd);
  }

  closeMenu() {
    if (this.activeMenu == null) return;
    // Prevent closing critical menus manually
    if (this.activeMenu == this.gameOverMenu || this.activeMenu == this.mainMenu) return;

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
      this.activeMenu = null;
    };

    this.activeMenu.addEventListener("animationend", onAnimationEnd);
  }
}
