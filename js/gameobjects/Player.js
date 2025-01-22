import { GameObject } from "../core/GameObject.js";
import { SpriteRenderer } from "../components/SpriteRenderer.js";
import { EasingFunctions } from "../utils/easing.js";
import { SquashAndStretch } from "/js/components/SquashAndStretch.js";
import { HorizontalFlip } from "/js/components/HorizontalFlip.js";
import { BoxCollider } from "../components/BoxCollider.js";
import { CircleCollider } from "../components/CircleCollider.js";
import { Rigidbody } from "../components/Rigidbody.js";
import { InputHandler } from "./InputHandler.js";
import { DropShadow } from "../components/DropShadow.js";
import { Actions } from "../utils/Actions.js";
import { ScreenShake } from "/js/components/ScreenShake.js";
import { HUD } from "/js/components/HUD.js";
import { UIManager } from "./UIManager.js";
import { ShipMenuManager } from "./ShipMenuManager.js";
import { ParticleSystemObject } from "./ParticleSystemObject.js";

export class Player extends GameObject {
    constructor() {
        super("Player");

        // Initial position and scale
        this.transform.position = { x: 0, y: 0 };
        this.transform.scale = { x: 0.03, y: 0.03 };
        this.transform.rotation = 10;

        // Reference to InputHandler
        this.inputHandler = InputHandler.getInstance();
        this.speed = 350; // Max speed in units/second

        // Easing configuration
        this.easeInDuration = 0.1;    // Time (in seconds) to go from 0 → full speed
        this.easeOutDuration = 0.5;   // Time (in seconds) to go from full speed → 0
        this.easingFunctionIn = EasingFunctions.easeOutExpo;
        this.easingFunctionOut = EasingFunctions.easeOutExpo;

        // Internal state
        this.movementState = "idle"; // "idle", "accelerating", "full", or "decelerating"
        this.currentTime = 0;        // Tracks progress of the easing
        this.currentFactor = 0;      // 0 = not moving, 1 = full speed

        // Store the last nonzero direction so we can decelerate along that vector.
        this.lastDirection = { x: 1, y: 0 }; // Default to facing right

        // Dash-related variables
        this.isDashing = false;
        this.dashDuration = 0.25;          // 200ms dash
        this.dashElapsedTime = 0;
        this.dashSpeed = 1200;             // Dash speed
        this.dashDirection = { x: 1, y: 0 }; // Default dash direction (facing right)
        this.debugLogs = true;           // Debug logging flag

        // Optional: Dash cooldown (prevent spamming)
        this.dashCooldown = 0.4;          // 400ms cooldown
        this.dashCooldownTimer = 0;

        // Health Management
        this.maxHealth = 5;
        this.currentHealth = 5;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0; // Time left in invulnerability

        // Resource Management (Copper)
        this.copper = 0;

        // Dash Charge Management
        this.maxDashCharges = 3;
        this.currentDashCharges = 3;
        this.dashChargeRechargeDuration = 2; // seconds
        this.dashRechargeTimer = 0;

        const hud = new HUD(this);
        this.addComponent(hud);

        // Add DropShadow component
        const dropShadow = new DropShadow({
            offset: { x: 0, y: 5 },
            width: 1500,
            height: 600,
            color: "#00002288",
        });
        this.addComponent(dropShadow);

        // Add a SpriteRenderer component
        const img = new Image();
        img.src = "/assets/images/rafli.png";
        img.onload = () => {
            this.addComponent(new SpriteRenderer(img, { pivot: "bottom", zOrder: 5 }));
        };

        // Add SquashAndStretch component
        this.sAndS = new SquashAndStretch({
            squashScale: 0.95,
            stretchScale: 1.05,
            easingFunction: EasingFunctions.easeInOutQuad,
            duration: 2,
            loop: true,
        });
        this.addComponent(this.sAndS);
        this.sAndS.startAnimation(); // Initialize baseScale

        // Store original squash and stretch values
        this.originalSquashScale = 0.95;
        this.originalStretchScale = 1.05;

        // Add HorizontalFlip component (default facing right)
        this.horizontalFlip = new HorizontalFlip(true);
        this.addComponent(this.horizontalFlip);

        // Add BoxCollider (non-trigger)
        const mainCollider = new BoxCollider({
            width: 25,
            height: 32,
            offset: { x: 2, y: 12 },
            isTrigger: false,
        });
        this.addComponent(mainCollider);

        mainCollider.onCollisionEnter = (other) => {
            console.log("Player main collider collision with:", other.gameObject.name);
            // e.g., check if the other is an Enemy
            if (other.gameObject.name === "Enemy") {
                this.takeDamage();
            }
        };

        // Add CircleCollider (trigger)
        const triggerCollider = new CircleCollider({
            radius: 30,
            offset: { x: 2.5, y: 19 },
            isTrigger: true,
        });
        this.addComponent(triggerCollider);

        this.isInSpaceshipZone = false;

        triggerCollider.onTriggerEnter = (other) => {
            console.log("Player trigger triggered by:", other.gameObject.name);
            if (other.gameObject.name === "Spaceship" && other.isTrigger) {
                // console.log("PLAYER WITHIN RANGE FOR SPACESHIP INTERACtION");
                this.isInSpaceshipZone = true;
            }
        };

        triggerCollider.onTriggerExit = (other) => {
            if (other.gameObject.name === "Spaceship" && other.isTrigger) {
                // console.log("PLAYER OUTSIDE RANGE FOR SPACESHIP INTERACtION");
                this.isInSpaceshipZone = false;
            }
        };

        // Add Rigidbody component (dynamic)
        const rb = new Rigidbody();
        this.addComponent(rb);

        // Register action callbacks
        this.inputHandler.on(Actions.DASH, this.startDash.bind(this));
        this.inputHandler.on(Actions.INTERACT, this.interact.bind(this));
        this.inputHandler.on(Actions.PAUSE, this.pause.bind(this));
        this.inputHandler.on(Actions.HELP, this.help.bind(this));
        this.inputHandler.on(Actions.BACK, this.back.bind(this));

        // Initialize playerCanMove flag
        this.playerCanMove = true;

        // Listen to UIManager's menuOpened and menuClosed events
        const uiManager = UIManager.getInstance();
        uiManager.addEventListener("menuOpened", this.onMenuOpened.bind(this));
        uiManager.addEventListener("menuClosed", this.onMenuClosed.bind(this));

        this.isDead = false;

        const shipMenuManager = ShipMenuManager.getInstance();
        shipMenuManager.playerObject = this;

        this.shipLevel = 0;

        this.trail = new ParticleSystemObject("PlayerTrail", {
            rateOverTime: 20,
            spawnRadius: 5,
            color: "#e0def440",
            particleLifetime: 0.5,
            sizeOverTime: true,
            startSize: 7,
            minInitialSpeed: 10,
            maxInitialSpeed: 50,
            acceleration: { x: 0, y: 10 },
            opacityOverTime: true,
        });
        this.dashTrail = new ParticleSystemObject("PlayerTrail", {
            rateOverTime: 50,
            spawnRadius: 10,
            color: "#1010ee44",
            particleLifetime: 0.5,
            sizeOverTime: true,
            startSize: 20,
            playOnWake: false,
        });
        this.dashBurst = new ParticleSystemObject("DashBurst", {
            burst: true,
            burstCount: 20,
            spawnRadius: 40,
            color: "rgba(156, 207, 255, .7)",
            particleLifetime: 0.2,
            sizeOverTime: true,
            playOnWake: false,
            loop: false,
            duration: 0.6, // only needed if we want the system to auto-destroy after
            startSize: 10,
            minAngle: 0,
            maxAngle: 360,
            minInitialSpeed: 200,
            maxInitialSpeed: 300
        });
        this.trailOffset = { x: 0, y: 12 }; // offset behind player if desired
    }

    /**
     * Event handler for when a menu is opened.
     * Disables player movement.
     * @param {CustomEvent} event
     */
    onMenuOpened(event) {
        if (this.debugLogs) {
            console.log("Player received menuOpened event. Disabling movement.");
        }
        this.playerCanMove = false;
    }

    /**
     * Event handler for when a menu is closed.
     * Enables player movement.
     * @param {CustomEvent} event
     */
    onMenuClosed(event) {
        if (this.debugLogs) {
            console.log("Player received menuClosed event. Enabling movement.");
        }
        this.playerCanMove = true;
    }

    /**
     * Reduces the player's health by 1.
     * Initiates invulnerability for 2 seconds after taking damage.
     */
    takeDamage() {
        if (this.isInvulnerable) {
            if (this.debugLogs) {
                console.log("Player is invulnerable and cannot take damage.");
            }
            return;
        }

        this.currentHealth -= 1;
        if (this.debugLogs) {
            console.log(`Player took damage. Current Health: ${this.currentHealth}`);
        }

        this.getComponent(HUD).updateDamaged();

        // Trigger screen shake for damage
        if (ScreenShake.instance) {
            ScreenShake.instance.trigger(
                0.3,   // duration in seconds
                0.05,  // blendInTime in seconds
                0.05,  // blendOutTime in seconds
                8,     // amplitude
                20     // frequency
            );
        }

        // Trigger controller rumble for damage
        this.inputHandler.triggerRumble(200, 400, 1.0, 0.5); // 300ms duration, strong 1.0, weak 1.0

        // Set invulnerability
        this.isInvulnerable = true;
        this.invulnerabilityTimer = 2; // 2 seconds of invulnerability

        // Check for death
        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    /**
     * Handles the player's death.
     * For now, it simply logs a message.
     */
    die() {
        this.getComponent(HUD).removeHud();
        console.log("Player has died!");
        UIManager.instance.openGameOverMenu();
        this.isDead = true;
        this.destroy();
        // Implement additional death logic here (e.g., respawn, game over screen)
    }

    /**
     * Updates the invulnerability timer.
     * @param {number} deltaTime - Time elapsed since the last frame.
     */
    updateInvulnerability(deltaTime) {
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                this.invulnerabilityTimer = 0;
                if (this.debugLogs) {
                    console.log("Player is no longer invulnerable.");
                }
            }
        }
    }

    /**
     * Increases the player's copper by a specified amount.
     * @param {number} amount - The amount of copper to add.
     */
    increaseCopper(amount) {
        if (amount < 0) {
            console.warn("increaseCopper called with negative amount. Use decreaseCopper instead.");
            return;
        }
        this.inputHandler.triggerRumble(200, 50, 0, .2);
        this.copper += amount;
        console.log(`Player gained ${amount} copper. Total Copper: ${this.copper}`);
    }

    /**
     * Decreases the player's copper by a specified amount.
     * @param {number} amount - The amount of copper to subtract.
     */
    decreaseCopper(amount) {
        if (amount < 0) {
            console.warn("decreaseCopper called with negative amount. Use increaseCopper instead.");
            return;
        }

        if (amount > this.copper) {
            console.warn("Attempted to decrease copper below zero.");
            this.copper = 0;
        } else {
            this.copper -= amount;
        }

        console.log(`Player spent ${amount} copper. Remaining Copper: ${this.copper}`);
    }

    /**
     * Initiates the dash action if possible.
     * Consumes a dash charge and triggers related effects.
     * @param {Gamepad|GameObject} collector - The source of the dash action.
     */
    startDash(collector) {
        if (!this.playerCanMove) {
            if (this.debugLogs) {
                console.log("Dash attempted while player cannot move (menu active).");
            }
            return;
        }

        if (this.isDashing || this.dashCooldownTimer > 0) {
            // Already dashing or cooldown active; ignore additional dash inputs
            if (this.debugLogs) {
                console.log("Dash attempted while already dashing or cooldown active.");
            }
            return;
        }

        if (this.currentDashCharges <= 0) {
            if (this.debugLogs) {
                console.log("Dash attempted with no available dash charges.");
            }
            return;
        }

        // Consume a single dash charge
        this.currentDashCharges -= 1;
        if (this.debugLogs) {
            console.log(`Dash charge consumed. Remaining Dash Charges: ${this.currentDashCharges}`);
        }

        this.dashTrail.playSystem();
        this.dashBurst.transform.position.x = this.transform.position.x;
        this.dashBurst.transform.position.y = this.transform.position.y + this.trailOffset.y;
        this.dashBurst.playSystem(); // Emission happens immediately for a burst

        // Determine dash direction based on last movement or default
        const dir = this.lastDirection;
        const magnitude = Math.sqrt(dir.x ** 2 + dir.y ** 2);
        if (magnitude === 0) {
            this.dashDirection = { x: 1, y: 0 }; // Default to facing right
        } else {
            this.dashDirection = { x: dir.x / magnitude, y: dir.y / magnitude };
        }

        // Initialize dash state
        this.isDashing = true;
        this.dashElapsedTime = 0;

        // Start dash cooldown
        this.dashCooldownTimer = this.dashCooldown;

        // Start the recharge timer if not at max charges and timer isn't already running
        if (this.currentDashCharges < this.maxDashCharges && this.dashRechargeTimer <= 0) {
            this.dashRechargeTimer = this.dashChargeRechargeDuration;
            if (this.debugLogs) {
                console.log(`Dash recharge timer started: ${this.dashRechargeTimer} seconds.`);
            }
        }

        // Modify SquashAndStretch for dash effect
        if (this.sAndS) {
            this.sAndS.setConfig({
                squashScale: 1.2,          // Squash to 1.2
                stretchScale: 0.8,         // Stretch to 0.8
                duration: this.dashDuration / 2, // Adjust duration as needed
                easingFunction: EasingFunctions.easeInOutQuad,
                loop: false,               // No looping during dash
            });
        }

        // Trigger controller rumble
        this.inputHandler.triggerRumble(200, 200, 1, 1);

        // Trigger screen shake
        if (ScreenShake.instance) {
            ScreenShake.instance.trigger(
                0.3,   // duration in seconds
                0,     // blendInTime in seconds
                0.2,   // blendOutTime in seconds
                4,     // amplitude
                20     // frequency
            );
        }

        if (this.debugLogs) {
            console.log(`Dash initiated in direction (${this.dashDirection.x.toFixed(2)}, ${this.dashDirection.y.toFixed(2)})`);
        }
    }

    handleDashRecharge(deltaTime) {
        // Use a single recharge timer
        if (this.dashRechargeTimer > 0) {
            this.dashRechargeTimer -= deltaTime;

            if (this.dashRechargeTimer <= 0) {
                this.dashRechargeTimer = 0;
                if (this.currentDashCharges < this.maxDashCharges) {
                    this.currentDashCharges += 1;
                    if (this.debugLogs) {
                        console.log(`Dash charge recharged. Current Dash Charges: ${this.currentDashCharges}`);
                    }

                    // Restart the timer if still below max charges
                    if (this.currentDashCharges < this.maxDashCharges) {
                        this.dashRechargeTimer = this.dashChargeRechargeDuration;
                        if (this.debugLogs) {
                            console.log(`Dash recharge timer restarted: ${this.dashRechargeTimer} seconds.`);
                        }
                    }
                }
            }
        }
    }

    /**
     * Handles the player's interaction.
     * @param {Gamepad|GameObject} collector - The source of the interact action.
     */
    interact(collector) {
        if (this.isDead) return;
        if (!this.playerCanMove) {
            if (this.debugLogs) {
                console.log("Interact attempted while player cannot move (menu active).");
            }
            return;
        }

        // console.log(`${this.name} interacted with ${collector.name}!`);
        // Implement interaction logic, e.g., open a door, pick up an item
        if (this.isInSpaceshipZone) {
            console.log("PLAYER INTERACTED WITH SPACESHIP");
            UIManager.instance.openShipMenu();
        }
    }

    /**
     * Handles the pause action.
     * @param {Gamepad|GameObject} collector - The source of the pause action.
     */
    pause(collector) {
        if (this.isDead) return;
        if (!this.playerCanMove) {
            if (this.debugLogs) {
                console.log("Pause attempted while player cannot move (menu active).");
            }
            return;
        }

        // console.log(`${this.name} paused the game!`);
        // Implement pause logic, e.g., show pause menu
        UIManager.instance.openPauseMenu();
    }

    /**
     * Handles the help action.
     * @param {Gamepad|GameObject} collector - The source of the help action.
     */
    help(collector) {
        if (this.isDead) return;
        if (!this.playerCanMove) {
            if (this.debugLogs) {
                console.log("Help attempted while player cannot move (menu active).");
            }
            return;
        }

        // console.log(`${this.name} requested help!`);
        // Implement help logic, e.g., display help screen
        UIManager.instance.openHelpMenu();
    }

    /**
     * Handles the back action.
     * @param {Gamepad|GameObject} collector - The source of the back action.
     */
    back(collector) {
        if (this.isDead) return;
        // console.log(`${this.name} went back!`);
        // Implement back logic, e.g., close a menu, return to previous state
        if (!this) return;
        UIManager.instance.closeMenu();
    }

    /**
     * Enables debug logging for the Player.
     */
    enableDebugLogs() {
        this.debugLogs = true;
        console.log("Player debug logs enabled.");
    }

    /**
     * Disables debug logging for the Player.
     */
    disableDebugLogs() {
        this.debugLogs = false;
        console.log("Player debug logs disabled.");
    }

    /**
     * Heals the player by 1 HP, not exceeding max health.
     */
    heal() {
        if (this.currentHealth < this.maxHealth) {
            this.currentHealth += 1;
            console.log(`Player healed. Current Health: ${this.currentHealth}/${this.maxHealth}`);
        } else if (this.debugLogs) {
            console.log("Player health is already at maximum.");
        }
    }

    /**
     * Upgrades the player's dash speed by a fixed increment of 300 units.
     */
    upgradeDashSpeed() {
        this.dashSpeed += 250;
        console.log(`Dash speed upgraded. Current Dash Speed: ${this.dashSpeed}`);
    }

    /**
     * Upgrades the player's dash cooldown by reducing it by 0.5 seconds.
     * Ensures that the cooldown does not go below zero.
     */
    upgradeDashCooldown() {
        this.dashChargeRechargeDuration = Math.max(0, this.dashChargeRechargeDuration - 0.5);
        console.log(`Dash cooldown upgraded. Current Dash Cooldown: ${this.dashChargeRechargeDuration}s`);
    }

    repairShip() {
        this.shipLevel += 1;
        console.log("PLAYER REPAIRED SHIP TO ", this.shipLevel);
        if (this.shipLevel == 2) {
            console.log("PPLAYER HAS BEATEN TEH GSAME !!!");
        }
    }

    /**
     * The main update loop called every frame.
     * @param {number} deltaTime - Time elapsed since the last frame.
     */
    update(deltaTime) {
        super.update(deltaTime);

        this.trail.transform.position.x = this.transform.position.x + this.trailOffset.x;
        this.trail.transform.position.y = this.transform.position.y + this.trailOffset.y;
        this.dashTrail.transform.position.x = this.transform.position.x + this.trailOffset.x;
        this.dashTrail.transform.position.y = this.transform.position.y + this.trailOffset.y;
        // Handle invulnerability timer
        this.updateInvulnerability(deltaTime);

        // Update dash cooldown timer
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= deltaTime;
            if (this.dashCooldownTimer < 0) this.dashCooldownTimer = 0;
        }

        // Handle dash charge recharge
        this.handleDashRecharge(deltaTime);

        if (this.isDashing) {
            // Update dash timer
            this.dashElapsedTime += deltaTime;
            let progress = this.dashElapsedTime / this.dashDuration;

            if (progress >= 1) {
                progress = 1;
                this.isDashing = false; // Dash complete
                this.dashTrail.stopSystem();
                if (this.debugLogs) {
                    console.log("Dash completed.");
                }

                // Restore original SquashAndStretch config
                if (this.sAndS) {
                    this.sAndS.setConfig({
                        squashScale: this.originalSquashScale,
                        stretchScale: this.originalStretchScale,
                        duration: 2, // Original duration
                        easingFunction: EasingFunctions.easeInOutQuad,
                        loop: true,    // Re-enable looping
                    });
                }

                // Optionally, trigger a subtle screen shake upon dash completion
                // Uncomment if desired
                /*
                if (ScreenShake.instance) {
                    ScreenShake.instance.trigger(
                        0.1,  // duration in seconds
                        0.02, // blendInTime in seconds
                        0.02, // blendOutTime in seconds
                        5,    // amplitude
                        20    // frequency
                    );
                }
                */
            }

            // Apply easing function to progress (easeOutQuad for smooth deceleration)
            const easingFactor = EasingFunctions.easeOutQuad(progress);

            // Calculate current dash speed with easing
            const currentDashSpeed = this.dashSpeed * easingFactor;

            // Move the player in dash direction
            this.transform.position.x += this.dashDirection.x * currentDashSpeed * deltaTime;
            this.transform.position.y += this.dashDirection.y * currentDashSpeed * deltaTime;

            // During dash, skip normal movement updates
            return;
        }

        // Check if player can move
        if (!this.playerCanMove) {
            // Optionally, reset movement states or other relevant variables
            // For example:
            // this.movementState = "idle";
            // this.currentFactor = 0;
            return; // Skip movement logic
        }

        // Get normalized direction from InputHandler
        const direction = this.inputHandler.getNormalizedDirection();
        const isMoving = (direction.x !== 0 || direction.y !== 0);

        // Explicitly control flipping based on input
        if (isMoving) {
            if (direction.x > 0) {
                this.horizontalFlip.setFacingRight(true); // Facing right
            } else if (direction.x < 0) {
                this.horizontalFlip.setFacingRight(false); // Facing left
            }
        }

        // State transitions for normal movement
        if (isMoving) {
            this.trail.playSystem();
            // Update lastDirection every frame we have a nonzero direction
            this.lastDirection = { ...direction };

            // If we're not already at full speed, make sure we're accelerating
            if (this.movementState === "idle" || this.movementState === "decelerating") {
                this.movementState = "accelerating";
                this.currentTime = 0; // Restart easing timer
            }

            // Accelerating: move currentFactor from 0 → 1
            if (this.movementState === "accelerating") {
                this.currentTime += deltaTime;
                const progress = Math.min(1, this.currentTime / this.easeInDuration);
                this.currentFactor = this.easingFunctionIn(progress);

                if (progress >= 1) {
                    this.movementState = "full"; // Reached full speed
                    this.currentFactor = 1;
                }
            }
            // If already "full" speed, just keep factor at 1
            else if (this.movementState === "full") {
                this.currentFactor = 1;
            }

        } else {
            this.trail.stopSystem();
            // If no input, transition to decelerating if we were moving
            if (this.movementState === "accelerating" || this.movementState === "full") {
                this.movementState = "decelerating";
                this.currentTime = 0;
            }

            if (this.movementState === "decelerating") {
                this.currentTime += deltaTime;
                const progress = Math.min(1, this.currentTime / this.easeOutDuration);

                // Easing from 1 → 0
                this.currentFactor = 1 - this.easingFunctionOut(progress);

                if (progress >= 1) {
                    this.movementState = "idle";
                    this.currentFactor = 0;
                }
            }
        }

        // Adjust SquashAndStretch component based on movement
        if (this.sAndS) {
            if (isMoving) {
                this.sAndS.setConfig({ duration: 0.1, squashScale: 0.9, stretchScale: 1.1 });
            }
            else {
                this.sAndS.setConfig({ duration: 2, squashScale: 0.95, stretchScale: 1.05 });
            }
        }

        // Apply normal movement
        const effectiveSpeed = this.speed * this.currentFactor;
        this.transform.position.x += direction.x * effectiveSpeed * deltaTime;
        this.transform.position.y += direction.y * effectiveSpeed * deltaTime;
    }
}
