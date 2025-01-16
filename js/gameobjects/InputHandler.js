// /js/gameobjects/InputHandler.js
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

        // Attach event listeners
        window.addEventListener("keydown", (e) => this.handleKeyDown(e));
        window.addEventListener("keyup", (e) => this.handleKeyUp(e));
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
            const { axis, value } = this.keyMap[key];
            this.addKey(axis, value);
            this.updateDirection();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        if (this.keyMap[key]) {
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
        this.direction.x = this.activeKeys.x[this.activeKeys.x.length - 1] || 0;
        this.direction.y = this.activeKeys.y[this.activeKeys.y.length - 1] || 0;

        // Normalize direction if necessary
        const magnitude = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2);
        if (magnitude > 0) {
            this.direction.x /= magnitude;
            this.direction.y /= magnitude;
        }
    }

    getNormalizedDirection() {
        return this.direction;
    }
}
