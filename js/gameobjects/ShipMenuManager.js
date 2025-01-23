import { GameObject } from "../core/GameObject.js";
import { UIManager } from "./UIManager.js";
import { InputHandler } from "./InputHandler.js";
import { Actions } from "../utils/Actions.js";

/**
 * Manages the Ship (Shop) UI, creating items from an internal data structure
 * and handling purchase logic, focus navigation, etc.
 */
export class ShipMenuManager extends GameObject {
  static instance = null;

  constructor() {
    if (ShipMenuManager.instance) {
      console.log("ShipMenuManager is a singleton and has already been created.");
      return ShipMenuManager.instance;
    }
    super("ShipMenuManager");

    ShipMenuManager.instance = this;

    // A reference to the player's GameObject (set externally)
    // so we can call heal(), upgradeDashSpeed(), upgradeDashCooldown(), etc.
    this.playerObject = null;

    // Reference to the Ship menu in the DOM
    this.shipMenu = UIManager.getInstance().shipMenu;
    this.copperCounter = document.querySelector("#copper-count-container p");

    // Our data structure for the shop items.
    // Each item includes:
    //  - name (optional internal name)
    //  - cost
    //  - label (the button text)
    //  - upgradeBars: how many "upgrade bars" to show (0 = none)
    //  - increment: how much cost increments each time it’s bought
    //  - currentLevel: tracks how many times it’s been purchased
    //  - specialDivClass: optional – if present, we render a special <div> instead of bars
    this.shopItems = [
      {
        name: "Heal",
        cost: 105,
        label: "Heal 1HP",
        upgradeBars: 0,
        increment: 0,
        currentLevel: 0,
        specialDivClass: "health health-active",
      },
      {
        name: "RepairShip",
        cost: 2400,
        label: "Repair Ship",
        upgradeBars: 2,
        increment: 600,
        currentLevel: 0,
      },
      {
        name: "UpgradeDashSpeed",
        cost: 420,
        label: "Upgrade Dash Speed",
        upgradeBars: 2,
        increment: 120,
        currentLevel: 0,
      },
      {
        name: "UpgradeDashCooldown",
        cost: 555,
        label: "Upgrade Dash Cooldown",
        upgradeBars: 2,
        increment: 150,
        currentLevel: 0,
      },
    ];

    this.defaultShopItems = JSON.parse(JSON.stringify(this.shopItems));

    // We will store the newly created button elements to manage focus navigation.
    this.buttons = [];

    // Input Handling
    this.inputHandler = InputHandler.getInstance();

    // We only want to navigate (Actions.UP, Actions.DOWN) while the ship menu is open
    this.inputHandler.on(Actions.UP, () => {
      if (UIManager.getInstance().activeMenu === this.shipMenu) {
        this.moveFocus(-1);
      }
    });
    this.inputHandler.on(Actions.DOWN, () => {
      if (UIManager.getInstance().activeMenu === this.shipMenu) {
        this.moveFocus(1);
      }
    });

    // Listen to UIManager’s menuOpened event so we can refocus the first non-disabled button
    UIManager.getInstance().addEventListener("menuOpened", (e) => {
      if (e.detail.menu === this.shipMenu) {
        // Rebuild the UI each time if you want to reflect the latest Player stats
        // (Optional) Or you can do it once in constructor and just call refresh
        this.buildShipMenuUI();
        this.focusFirstEnabledButton();
      }
    });

    // Build the UI once on creation (you can also re-build it each time the menu opens if desired)
    this.buildShipMenuUI();
  }

  /**
   * Retrieve the singleton instance of ShipMenuManager.
   */
  static getInstance() {
    if (!ShipMenuManager.instance) {
      ShipMenuManager.instance = new ShipMenuManager();
    }
    return ShipMenuManager.instance;
  }

  resetShopItems() {
    // Deep clone the default items to avoid mutating original references
    this.shopItems = JSON.parse(JSON.stringify(this.defaultShopItems));

    // Rebuild the UI so the new defaults are visible.
    // You could also call this.refreshButtons() if you just want to update
    // states, but typically you want the entire menu content rebuilt.
    this.buildShipMenuUI();
  }

  /**
   * Removes all existing .ship-line-container elements from the DOM, then
   * recreates them based on our shopItems array.
   */
  buildShipMenuUI() {
    // 1. Clear all existing .ship-line-container from the Ship menu
    const oldContainers = this.shipMenu.querySelectorAll(".ship-line-container");
    oldContainers.forEach((el) => el.remove());

    // 2. Build each item’s UI
    this.buttons = []; // reset our local reference to the buttons
    this.shopItems.forEach((item, index) => {
      const containerDiv = document.createElement("div");
      containerDiv.classList.add("ship-line-container");

      // Price <p>
      const priceP = document.createElement("p");
      priceP.textContent = item.cost;
      containerDiv.appendChild(priceP);

      // Button
      const btn = document.createElement("button");
      btn.textContent = item.label;
      containerDiv.appendChild(btn);

      // If specialDivClass is specified (like Heal), we create that special div
      if (item.specialDivClass) {
        const specialDiv = document.createElement("div");
        // e.g. "health health-active"
        specialDiv.className = item.specialDivClass;
        containerDiv.appendChild(specialDiv);
      } else {
        // Otherwise, create upgrade bars if upgradeBars > 0
        if (item.upgradeBars > 0) {
          const barsContainer = document.createElement("div");
          barsContainer.classList.add("ship-upgrade-bars-container");

          for (let i = 0; i < item.upgradeBars; i++) {
            const barDiv = document.createElement("div");
            barDiv.classList.add("upgrade-bar");
            // If we want to show "active" bars for currentLevel, do:
            if (i < item.currentLevel) {
              barDiv.classList.add("upgrade-bar-active");
            }
            barsContainer.appendChild(barDiv);
          }
          containerDiv.appendChild(barsContainer);
        }
      }

      // Attach event listener for purchase
      btn.addEventListener("click", () => {
        this.handlePurchase(item, priceP, btn, containerDiv, index);
      });

      // Add to DOM
      this.shipMenu.appendChild(containerDiv);
      this.buttons.push(btn);
    });

    // Refresh button states (enabled/disabled)
    this.refreshButtons();
  }

  /**
   * Called whenever a button is clicked to purchase the given item.
   */
  handlePurchase(item, priceP, btn, containerDiv, itemIndex) {
    const player = this.playerObject;
    if (!player) return; // Safety check

    // If not enough copper, do nothing
    if (player.copper < item.cost) {
      console.log(`Not enough copper to purchase ${item.label}. Required: ${item.cost}, Available: ${player.copper}`);
      return;
    }

    // (1) Deduct copper
    player.decreaseCopper(item.cost);

    // (2) Increase current upgrade level (for items that have upgrade bars, or even Heal)
    item.currentLevel++;

    // (3) Increment the cost for next time
    if (item.increment && item.increment > 0) {
      item.cost += item.increment;
    }

    // (4) Call the corresponding player method based on the item
    switch (item.name) {
      case "Heal":
        player.heal();
        break;
      case "RepairShip":
        player.repairShip(); // Ensure this method exists in Player
        break;
      case "UpgradeDashSpeed":
        player.upgradeDashSpeed();
        break;
      case "UpgradeDashCooldown":
        player.upgradeDashCooldown();
        break;
      default:
        console.warn(`Unknown shop item: ${item.name}`);
    }

    // (5) Update the UI for the cost label, upgrade bars, etc.
    priceP.textContent = item.cost;
    this.updateUpgradeBars(containerDiv, item);

    // (6) Possibly disable the button if we’ve reached max upgrades,
    //     or if it’s Heal and player’s HP is full, etc.
    this.refreshButtons();
  }

  /**
   * Re-checks each item and sets buttons enabled/disabled
   * depending on the Player’s copper, current upgrade level, and special conditions.
   */
  refreshButtons() {
    const player = this.playerObject;
    if (!player) return;
    this.copperCounter.textContent = player.copper;

    this.shopItems.forEach((item, i) => {
      const btn = this.buttons[i];

      // Always check if the user has enough copper
      let canAfford = (player.copper >= item.cost);

      // If this item has a limited number of bars:
      let maxedOut = false;
      if (item.upgradeBars > 0 && item.currentLevel >= item.upgradeBars) {
        // If we've reached the # of bars, no more upgrades allowed -> disable
        maxedOut = true;
      }

      // Special case: Heal
      // (Should not be disabled by “being bought”, but disable if at full HP)
      // The prompt says: “except if it’s the Heal, it should not be disabled when bought.
      // It should however be disabled when the player’s health is full.”
      let isHealAndAtFullHealth = false;
      if (item.name === "Heal") {
        if (player.currentHealth >= player.maxHealth) {
          isHealAndAtFullHealth = true;
        }
        // So we do NOT consider `maxedOut` for Heal
        maxedOut = false; // ignore bars for Heal
      }

      // Final condition: can buy if canAfford and not maxedOut and not (heal+fullHP)
      const canBuy = canAfford && !maxedOut && !isHealAndAtFullHealth;

      btn.disabled = !canBuy;
    });
  }

  /**
   * Updates the UI for upgrade bars inside a container (if it has any).
   * This re-checks item.currentLevel and toggles .upgrade-bar-active classes.
   */
  updateUpgradeBars(containerDiv, item) {
    if (item.specialDivClass) {
      // This item doesn't use standard upgrade bars (e.g. Heal)
      return;
    }
    const barsContainer = containerDiv.querySelector(".ship-upgrade-bars-container");
    if (!barsContainer) return; // No bars to update if item.upgradeBars == 0

    const bars = barsContainer.querySelectorAll(".upgrade-bar");
    bars.forEach((bar, idx) => {
      if (idx < item.currentLevel) {
        bar.classList.add("upgrade-bar-active");
      } else {
        bar.classList.remove("upgrade-bar-active");
      }
    });
  }

  /**
   * Move focus up/down through the Ship Menu buttons by `delta` (-1 or +1).
   */
  moveFocus(delta) {
    const enabledButtons = this.buttons.filter((b) => !b.disabled);
    if (enabledButtons.length === 0) return; // no enabled buttons at all

    // Find which enabled button is currently focused
    const activeElement = document.activeElement;
    let idx = enabledButtons.indexOf(activeElement);

    // If the currently focused element is not in enabledButtons, start from 0
    if (idx < 0) idx = 0;

    // Move
    idx += delta;

    // Wrap around
    if (idx < 0) idx = enabledButtons.length - 1;
    if (idx >= enabledButtons.length) idx = 0;

    // Focus new button
    enabledButtons[idx].focus();
  }

  /**
   * Focuses the first non-disabled button in the list (if any).
   * Called whenever the Ship menu is opened.
   */
  focusFirstEnabledButton() {
    // If no buttons or all are disabled, do nothing
    const enabledButtons = this.buttons.filter((b) => !b.disabled);
    if (enabledButtons.length > 0) {
      enabledButtons[0].focus();
    }
  }

  /**
   * The update loop for this GameObject (not strictly necessary unless you want
   * dynamic behavior every frame). Could be used if we want to re-check
   * button states in real-time, etc.
   */
  update(deltaTime) {
    super.update(deltaTime);

    // Example: If you want to *continuously* refresh the states each frame, do:
    // this.refreshButtons();

    // But typically, we just refresh after each purchase or after player's copper changes.
  }
}
