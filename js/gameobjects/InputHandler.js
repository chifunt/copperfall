import { GameObject } from "../core/GameObject.js";

export class InputHandler extends GameObject {
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
        super("InputHandler");

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

    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        if (this.keyMap[key]) {
            event.preventDefault(); // Prevent default behavior for mapped keys
            const { axis, value } = this.keyMap[key];
            this.addKey(axis, value);
            this.updateDirection();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        if (this.keyMap[key]) {
            event.preventDefault(); // Prevent default behavior for mapped keys
            const { axis, value } = this.keyMap[key];
            this.removeKey(axis, value);
            this.updateDirection();
        }
    }

    addKey(axis, value) {
        if (!this.activeKeys[axis].includes(value)) {
            this.activeKeys[axis].push(value);
        }
    }

    removeKey(axis, value) {
        this.activeKeys[axis] = this.activeKeys[axis].filter((key) => key !== value);
    }

    updateDirection() {
        // Get the last active key for each axis
        const lastX = this.activeKeys.x[this.activeKeys.x.length - 1] || 0;
        const lastY = this.activeKeys.y[this.activeKeys.y.length - 1] || 0;

        // Set direction based on active keys
        this.direction.x = lastX;
        this.direction.y = lastY;

        // Normalize direction if necessary
        const magnitude = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2);
        if (magnitude > 1) {
            this.direction.x /= magnitude;
            this.direction.y /= magnitude;
        }
    }

    getNormalizedDirection() {
        return this.direction;
    }

    // Gamepad Handling

    handleGamepadConnected(event) {
        const gamepad = event.gamepad;
        this.gamepads[gamepad.index] = gamepad;
        console.log(`Gamepad connected: ${gamepad.id}`);
    }

    handleGamepadDisconnected(event) {
        const gamepad = event.gamepad;
        delete this.gamepads[gamepad.index];
        console.log(`Gamepad disconnected: ${gamepad.id}`);
    }

    /**
     * Polls connected gamepads and updates the direction accordingly.
     * This should be called every frame within the update method.
     */
    pollGamepads() {
        const connectedGamepads = navigator.getGamepads ? navigator.getGamepads() : [];

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

                // Directly set the direction based on gamepad input
                this.direction.x = combinedX;
                this.direction.y = combinedY;
            }
        }

        // Normalize the final direction to ensure it's within the unit circle
        const finalMagnitude = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2);
        if (finalMagnitude > 1) {
            this.direction.x /= finalMagnitude;
            this.direction.y /= finalMagnitude;
        }
    }

    /**
     * Override the update method to include gamepad polling.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // First, handle keyboard inputs (already managed via event listeners)
        // Now, handle gamepad inputs
        this.pollGamepads();

        // After updating direction, normalize it to ensure consistent movement speed
        const magnitude = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2);
        if (magnitude > 1) {
            this.direction.x /= magnitude;
            this.direction.y /= magnitude;
        }
    }
}
