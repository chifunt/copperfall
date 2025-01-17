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

export class Player extends GameObject {
    constructor() {
        super("Player");

        // Initial position and scale
        this.transform.position = { x: 0, y: 0 };
        this.transform.scale = { x: 0.03, y: 0.03 };
        this.transform.rotation = 10;

        // Movement
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
        this.dashDuration = 0.2;          // 200ms dash
        this.dashElapsedTime = 0;
        this.dashSpeed = 1200;             // Dash speed
        this.dashDirection = { x: 1, y: 0 }; // Default dash direction (facing right)
        this.debugLogs = false;           // Debug logging flag

        // Optional: Dash cooldown (prevent spamming)
        this.dashCooldown = 0.4;          // 300ms cooldown
        this.dashCooldownTimer = 0;

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
        };

        // Add CircleCollider (trigger)
        const triggerCollider = new CircleCollider({
            radius: 30,
            offset: { x: 2.5, y: 19 },
            isTrigger: true,
        });
        this.addComponent(triggerCollider);

        triggerCollider.onTriggerEnter = (other) => {
            console.log("Player trigger triggered by:", other.gameObject.name);
            // e.g., if player enters the sight range of an enemy
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
    }

    /**
     * Initiates the dash action.
     * @param {Gamepad|GameObject} collector - The source of the dash action.
     */
    startDash(collector) {
        if (this.isDashing || this.dashCooldownTimer > 0) {
            // Already dashing or cooldown active; ignore additional dash inputs
            if (this.debugLogs) {
                console.log("Dash attempted while already dashing or cooldown active.");
            }
            return;
        }

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

        this.inputHandler.triggerRumble(200, 200, 0.5, 0.2);

        if (this.debugLogs) {
            console.log(`Dash initiated in direction (${this.dashDirection.x.toFixed(2)}, ${this.dashDirection.y.toFixed(2)})`);
        }
    }

    /**
     * Handles the interact action.
     * @param {Gamepad|GameObject} collector - The source of the interact action.
     */
    interact(collector) {
        console.log(`${this.name} interacted with ${collector.name}!`);
        // Implement interaction logic, e.g., open a door, pick up an item
    }

    /**
     * Handles the pause action.
     * @param {Gamepad|GameObject} collector - The source of the pause action.
     */
    pause(collector) {
        console.log(`${this.name} paused the game!`);
        // Implement pause logic, e.g., show pause menu
    }

    /**
     * Handles the help action.
     * @param {Gamepad|GameObject} collector - The source of the help action.
     */
    help(collector) {
        console.log(`${this.name} requested help!`);
        // Implement help logic, e.g., display help screen
    }

    /**
     * Handles the back action.
     * @param {Gamepad|GameObject} collector - The source of the back action.
     */
    back(collector) {
        console.log(`${this.name} went back!`);
        // Implement back logic, e.g., close a menu, return to previous state
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

    update(deltaTime) {
        super.update(deltaTime);

        // Update dash cooldown timer
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= deltaTime;
            if (this.dashCooldownTimer < 0) this.dashCooldownTimer = 0;
        }

        if (this.isDashing) {
            // Update dash timer
            this.dashElapsedTime += deltaTime;
            let progress = this.dashElapsedTime / this.dashDuration;

            if (progress >= 1) {
                progress = 1;
                this.isDashing = false; // Dash complete
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
