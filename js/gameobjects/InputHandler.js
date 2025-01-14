import { GameObject } from "../core/GameObject.js";

export class InputHandler extends GameObject {
    constructor() {
        super("InputHandler");

        // Direction tracking with active keys
        this.activeKeys = {
            x: [], // Keys for horizontal movement (e.g., "a" and "d")
            y: [], // Keys for vertical movement (e.g., "w" and "s")
        };
        this.direction = { x: 0, y: 0 }; // Final normalized direction

        // Attach event listeners
        window.addEventListener("keydown", (e) => this.handleKeyDown(e));
        window.addEventListener("keyup", (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        switch (key) {
            case "w": // Move up
                this.addKey("y", 1);
                break;
            case "s": // Move down
                this.addKey("y", -1);
                break;
            case "d": // Move right
                this.addKey("x", 1);
                break;
            case "a": // Move left
                this.addKey("x", -1);
                break;
        }

        this.updateDirection();
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        switch (key) {
            case "w":
                this.removeKey("y", 1);
                break;
            case "s":
                this.removeKey("y", -1);
                break;
            case "d":
                this.removeKey("x", 1);
                break;
            case "a":
                this.removeKey("x", -1);
                break;
        }

        this.updateDirection();
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
