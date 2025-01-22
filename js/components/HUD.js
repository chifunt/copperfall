import { Component } from "/js/core/Component.js";

export class HUD extends Component {
    /**
     * Constructs the HUD component.
     * @param {Player} player - The Player GameObject to monitor.
     */
    constructor(player) {
        super();
        this.player = player;

        // Select DOM elements
        this.hudContainer = document.querySelector("#hud-container");

        this.chargeContainer = document.querySelector("#charge-container");
        this.healthContainer = document.querySelector("#health-container");
        this.copperContainer = document.querySelector("#copper-container p");

        this.damageVignette = document.querySelector(".vignette-damage");

        // Initialize previous state to optimize updates
        this.prevDashCharges = null;
        this.prevHealth = null;
        this.prevCopper = null;
        this.damagedShown = false;

        // Validate DOM elements
        if (!this.chargeContainer || !this.healthContainer || !this.copperContainer) {
            console.error("HUD: One or more HUD elements not found in the DOM.");
        }
    }

    /**
     * Updates the HUD elements based on the player's current state.
     */
    update(deltaTime) {
        if (!this.player) {
            this.removeHud();
        }

        this.showHud();
        this.updateDashCharges();
        this.updateHealth();
        this.updateCopper();
    }

    /**
     * Updates the dash charges display.
     */
    updateDashCharges() {
        const currentCharges = this.player.currentDashCharges;

        // Avoid unnecessary updates
        if (currentCharges === this.prevDashCharges) return;
        if (currentCharges < this.prevDashCharges) {
            console.warn("CHONTATINER FLASH");
            this.chargeContainer.classList.remove("charge-container-flash");
            void this.chargeContainer.offsetWidth;
            this.chargeContainer.classList.add("charge-container-flash");
        }
        this.prevDashCharges = currentCharges;

        const chargeDivs = this.chargeContainer.querySelectorAll(".charge");

        chargeDivs.forEach((chargeDiv, index) => {
            if (index < currentCharges) {
                chargeDiv.classList.add("charge-active");
            } else {
                chargeDiv.classList.remove("charge-active");
            }
        });
    }

    /**
     * Updates the health display.
     */
    updateHealth() {
        const currentHealth = this.player.currentHealth;

        // Avoid unnecessary updates
        if (currentHealth === this.prevHealth) return;
        this.prevHealth = currentHealth;

        const healthDivs = this.healthContainer.querySelectorAll(".health");

        healthDivs.forEach((healthDiv, index) => {
            if (index < currentHealth) {
                healthDiv.classList.add("health-active");
            } else {
                healthDiv.classList.remove("health-active");
            }
        });
    }

    /**
     * Updates the copper display.
     */
    updateCopper() {
        const currentCopper = this.player.copper;

        // Avoid unnecessary updates
        if (currentCopper === this.prevCopper) return;
        this.prevCopper = currentCopper;

        // Remove the flash class to reset the animation
        this.copperContainer.classList.remove('flash');

        // Trigger reflow to restart the animation
        void this.copperContainer.offsetWidth;

        // Update the text content
        this.copperContainer.textContent = currentCopper;

        // Add the flash class to trigger the animation
        this.copperContainer.classList.add('flash');
    }

    updateDamaged() {
        if (this.damagedShown) return; // Prevent triggering if already shown

        this.damageVignette.classList.remove("damaged"); // Remove the class

        // Force reflow to ensure the class removal is recognized
        void this.damageVignette.offsetWidth;

        this.damageVignette.classList.add("damaged"); // Re-add the class to trigger animation
        this.damagedShown = true; // Set the flag to indicate the animation is in progress

        // Define the event handler
        const onAnimationEnd = () => {
            this.damagedShown = false; // Reset the flag
            this.damageVignette.removeEventListener('animationend', onAnimationEnd); // Clean up the listener
        };

        // Add the event listener for when the animation ends
        this.damageVignette.addEventListener('animationend', onAnimationEnd);
    }

    removeHud() {
        this.hudContainer.style.display = "none";
    }

    showHud() {
        if (this.hudContainer.style.display = "flex") return;
        this.hudContainer.style.display = "flex";
    }
}
