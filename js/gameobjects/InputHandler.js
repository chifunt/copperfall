// /js/gameobjects/InputHandler.js
import { GameObject } from "../core/GameObject.js";

export class InputHandler extends GameObject {
    static instance = null;

    /**
     * @param {Object} config
     * @param {Object} config.keyBindings - An object mapping directions to arrays of keys.
     * Example:
     * {
     *   up: ["w", "arrowup"],
     *   down: ["s", "arrowdown"],
     *   left: ["a", "arrowleft"],
     *   right: ["d", "arrowright"]
     * }
     */
    constructor(config = {}) {
        if (InputHandler.instance) {
            console.warn("InputHandler is a singleton and has already been created.");
            return InputHandler.instance;
        }

        super("InputHandler");

        InputHandler.instance = this;

        // Define default key bindings if not provided
        this.keyBindings = config.keyBindings || {
            up: ["w", "arrowup"],
            down: ["s", "arrowdown"],
            left: ["a", "arrowleft"],
            right: ["d", "arrowright"],
        };

        // Reverse mapping: key -> axis and value
        this.keyMap = this.generateKeyMap(this.keyBindings);

        // Direction tracking with active keys
        this.activeKeys = {
            x: [], // Keys for horizontal movement
            y: [], // Keys for vertical movement
        };
        this.direction = { x: 0, y: 0 }; // Final normalized direction

        // Separate direction vectors for keyboard and gamepad
        this.keyboardDirection = { x: 0, y: 0 };
        this.gamepadDirection = { x: 0, y: 0 };

        // Flag to determine which input source to use
        this.usingController = false;

        // Gamepad handling
        this.gamepads = {}; // Store connected gamepads
        this.deadzone = 0.2; // Deadzone for analog sticks

        // Attach event listeners
        window.addEventListener("keydown", (e) => this.handleKeyDown(e));
        window.addEventListener("keyup", (e) => this.handleKeyUp(e));
        window.addEventListener("gamepadconnected", (e) => this.handleGamepadConnected(e));
        window.addEventListener("gamepaddisconnected", (e) => this.handleGamepadDisconnected(e));
    }

    /**
     * Retrieves the singleton instance of InputHandler.
     * @returns {InputHandler}
     */
    static getInstance() {
        if (!InputHandler.instance) {
            InputHandler.instance = new InputHandler();
        }
        return InputHandler.instance;
    }

    /**
     * Generates a reverse mapping from key to movement axis and value.
     * @param {Object} keyBindings
     * @returns {Object} keyMap
     */
    generateKeyMap(keyBindings) {
        const map = {};
        for (const direction in keyBindings) {
            const keys = keyBindings[direction];
            keys.forEach(key => {
                const lowerKey = key.toLowerCase();
                if (direction === "up") {
                    map[lowerKey] = { axis: "y", value: 1 };
                } else if (direction === "down") {
                    map[lowerKey] = { axis: "y", value: -1 };
                } else if (direction === "left") {
                    map[lowerKey] = { axis: "x", value: -1 };
                } else if (direction === "right") {
                    map[lowerKey] = { axis: "x", value: 1 };
                }
            });
        }
        return map;
    }

    /**
     * Handles keydown events for keyboard input.
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        if (this.keyMap[key]) {
            event.preventDefault(); // Prevent default behavior for mapped keys
            const { axis, value } = this.keyMap[key];
            this.addKey(axis, value);
            this.updateKeyboardDirection();
            this.usingController = false; // Switch to keyboard input
        }
    }

    /**
     * Handles keyup events for keyboard input.
     * @param {KeyboardEvent} event
     */
    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        if (this.keyMap[key]) {
            event.preventDefault(); // Prevent default behavior for mapped keys
            const { axis, value } = this.keyMap[key];
            this.removeKey(axis, value);
            this.updateKeyboardDirection();
            this.usingController = false; // Switch to keyboard input
        }
    }

    /**
     * Adds a key to the activeKeys tracking.
     * @param {string} axis
     * @param {number} value
     */
    addKey(axis, value) {
        if (!this.activeKeys[axis].includes(value)) {
            this.activeKeys[axis].push(value);
        }
    }

    /**
     * Removes a key from the activeKeys tracking.
     * @param {string} axis
     * @param {number} value
     */
    removeKey(axis, value) {
        this.activeKeys[axis] = this.activeKeys[axis].filter((key) => key !== value);
    }

    /**
     * Updates the keyboardDirection based on activeKeys.
     */
    updateKeyboardDirection() {
        // Get the last active key for each axis
        const lastX = this.activeKeys.x[this.activeKeys.x.length - 1] || 0;
        const lastY = this.activeKeys.y[this.activeKeys.y.length - 1] || 0;

        // Set keyboard direction based on active keys
        this.keyboardDirection.x = lastX;
        this.keyboardDirection.y = lastY;

        // Normalize direction if necessary
        const magnitude = Math.sqrt(this.keyboardDirection.x ** 2 + this.keyboardDirection.y ** 2);
        if (magnitude > 1) {
            this.keyboardDirection.x /= magnitude;
            this.keyboardDirection.y /= magnitude;
        }
    }

    /**
     * Retrieves the normalized direction vector.
     * @returns {Object} direction
     */
    getNormalizedDirection() {
        return this.direction;
    }

    // -------------------- Gamepad Handling --------------------

    /**
     * Handles gamepad connection events.
     * @param {GamepadEvent} event
     */
    handleGamepadConnected(event) {
        const gamepad = event.gamepad;
        this.gamepads[gamepad.index] = gamepad;
        console.log(`Gamepad connected: ${gamepad.id}`);
    }

    /**
     * Handles gamepad disconnection events.
     * @param {GamepadEvent} event
     */
    handleGamepadDisconnected(event) {
        const gamepad = event.gamepad;
        delete this.gamepads[gamepad.index];
        console.log(`Gamepad disconnected: ${gamepad.id}`);
    }

    /**
     * Polls connected gamepads and updates the gamepadDirection accordingly.
     * This should be called every frame within the update method.
     */
    pollGamepads() {
        const connectedGamepads = navigator.getGamepads ? navigator.getGamepads() : [];

        let anyGamepadInput = false;
        // Reset gamepadDirection
        this.gamepadDirection = { x: 0, y: 0 };

        for (let gp of connectedGamepads) {
            if (gp) {
                // Process Left Stick (axes[0], axes[1])
                let lsX = gp.axes[0];
                let lsY = gp.axes[1];

                // Apply deadzone
                if (Math.abs(lsX) < this.deadzone) lsX = 0;
                if (Math.abs(lsY) < this.deadzone) lsY = 0;

                // In many gamepad APIs, up is -1 on Y axis
                lsY = -lsY;

                // Process DPad (buttons 12: up, 13: down, 14: left, 15: right)
                const dpadUp = gp.buttons[12]?.pressed;
                const dpadDown = gp.buttons[13]?.pressed;
                const dpadLeft = gp.buttons[14]?.pressed;
                const dpadRight = gp.buttons[15]?.pressed;

                // Map DPad to direction
                let dpadX = 0;
                let dpadY = 0;
                if (dpadLeft) dpadX -= 1;
                if (dpadRight) dpadX += 1;
                if (dpadUp) dpadY += 1;
                if (dpadDown) dpadY -= 1;

                // Combine Left Stick and DPad
                let combinedX = lsX + dpadX;
                let combinedY = lsY + dpadY;

                // Clamp combined values to [-1, 1]
                combinedX = Math.max(-1, Math.min(1, combinedX));
                combinedY = Math.max(-1, Math.min(1, combinedY));

                // Normalize if necessary
                const magnitude = Math.sqrt(combinedX ** 2 + combinedY ** 2);
                if (magnitude > 1) {
                    combinedX /= magnitude;
                    combinedY /= magnitude;
                }

                // Accumulate gamepad direction
                this.gamepadDirection.x += combinedX;
                this.gamepadDirection.y += combinedY;

                // Check if any gamepad input is active
                if (combinedX !== 0 || combinedY !== 0) {
                    anyGamepadInput = true;
                }
            }
        }

        // If any gamepad has input, set 'usingController' to true and set gamepadDirection
        if (anyGamepadInput) {
            this.usingController = true;
            // If multiple gamepads, average their inputs
            const numGamepads = Object.keys(this.gamepads).length;
            if (numGamepads > 1) {
                this.gamepadDirection.x /= numGamepads;
                this.gamepadDirection.y /= numGamepads;
            }

            // Normalize gamepadDirection if necessary
            const magnitude = Math.sqrt(this.gamepadDirection.x ** 2 + this.gamepadDirection.y ** 2);
            if (magnitude > 1) {
                this.gamepadDirection.x /= magnitude;
                this.gamepadDirection.y /= magnitude;
            }

        } else {
            // No gamepad input detected
            this.usingController = false;
            this.gamepadDirection = { x: 0, y: 0 };
        }
    }

    /**
     * Override the update method to include gamepad polling.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // Poll gamepads every frame
        this.pollGamepads();

        // Update direction based on active input source
        if (this.usingController) {
            this.direction.x = this.gamepadDirection.x;
            this.direction.y = this.gamepadDirection.y;
        } else {
            this.direction.x = this.keyboardDirection.x;
            this.direction.y = this.keyboardDirection.y;
        }

        // No need to normalize here, as it's done in updateKeyboardDirection and pollGamepads
    }
}
