import { checkBounds, moveParticle, getParticle, setParticle } from "./canvas.js";
import { getRandomInt } from "./util.js";

/**
 * Base particle class
 */
class Particle {
    constructor() {
        this.color = "";
        this.type = "";
    }

    /**
     * Returns true if the particle should swap with other when trying
     * to move onto the same grid location as {@link other}.
     * 
     * EX: Let sand sink below water
     * 
     * @param {Particle} other 
     * @returns {boolean} Should the particle swap
     */
    swap(other) {
        return false;
    }

    /**
     * Update the particle at location (row, col)
     * 
     * @param {number} row 
     * @param {number} col 
     */
    update(row, col) {

    }
}

/**
 * Sand particle
 */
export class Sand extends Particle {
    constructor() {
        super();
        this.color = "orange";
        this.type = "sand";
    }

    swap(other) {
        // Make sand fall under the water
        return other.type == "water";

    }

    update(row, col) {
        let newRow = row + 1;

        // Try to move down
        if (!moveParticle(row, col, newRow, col, this.swap)) {
            // If cannot move down, try to move left
            if (!moveParticle(row, col, newRow, col-1, this.swap)) {
                // If cannot move left, try to move right
                moveParticle(row, col, newRow, col+1, this.swap)
            }
        }
        
    }
}

export class Water extends Particle {
    constructor() {
        super();
        this.color = "blue";
        this.type = "water";
    }

    update(row, col) {
        // Move to random location
        if (!getRandomInt(0, 63)) {
            moveParticle(row, col, getRandomInt(0, canvas.width), getRandomInt(0, canvas.height), super.swap)
        }

        // Try to move up
        if (!getRandomInt(0,63) && !getParticle(row-1, col)) {
            moveParticle(row, col, row-1, col, super.swap)
        }

        // Try to move diagonal
        if (!getRandomInt(0,3) && !getParticle(row+1, col-1)) {
            moveParticle(row, col, row+1, col-1, super.swap)
        }
        if (!getRandomInt(0,3) && !getParticle(row+1, col+1)) {
            moveParticle(row, col, row+1, col+1, super.swap)
        }

        // Try to move down
        if (getRandomInt(0,2) && !getParticle(row+1, col)) {
            moveParticle(row, col, row+1, col, super.swap);
        }

        // Move left or right
        if (getRandomInt(0, 1) && !getParticle(row, col+1)) {
            moveParticle(row, col, row, col+1, super.swap);
        }
        else if (!getParticle(row, col-1)) {
            moveParticle(row, col, row, col-1, super.swap);
        }
    }
}

/**
 * Create particle based on dropdown name
 * 
 * @param {string} value 
 * @returns 
 */
export function checkParticleType(value) {
    if (value == "Sand") {
        return new Sand();
    } 
    if (value == "Water") {
        return new Water();
    }
    // TODO create new particles
}