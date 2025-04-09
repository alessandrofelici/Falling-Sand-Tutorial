import { checkBounds, moveParticle, getParticle, setParticle, getContact } from "./canvas.js";
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

    swap(other) {
        // Make water fall under steam
        return other.type == "steam";
    }

    update(row, col) {
        // Freeze on contact with frost particle
        if (getContact(row, col, "frost")) {
            setParticle(row, col, new Ice());
            return;
        }

        // Chance to freeze on contact with ice
        if (getContact(row, col, "ice")) {
            if (!getRandomInt(0,127)) {
                setParticle(row, col, new Ice());
                return;
            }
        }

        // Evaporate on contact
        if (getContact(row, col, "fire")) {
            setParticle(row, col, new Steam());
            return;
        }

        // Change dirt to grass on contact
        if (getParticle(row+1, col)?.type == "dirt") {
            setParticle(row+1, col, new Grass());
            setParticle(row, col, null);
            return;
        }

        // 1/1024 chance, move to random location
        if (!getRandomInt(0, 1023)) {
            moveParticle(row, col, getRandomInt(0, canvas.width), getRandomInt(0, canvas.height), super.swap)
            return;
        }

        // 1/64 chance, move up
        if (!getRandomInt(0,63) && !getParticle(row-1, col)) {
            moveParticle(row, col, row-1, col, this.swap)
            return;
        }

        // 1/4 chance, move diagonal
        if (!getRandomInt(0,3)) {
            if (!getRandomInt(0,1) && !getParticle(row+1, col-1)) {
                moveParticle(row, col, row+1, col-1, this.swap);
                return;
            }
            else if (!getParticle(row+1, col+1)) {
                moveParticle(row, col, row+1, col+1, this.swap);
                return;
            }
        }

        // Default option: move directly down
        if (getRandomInt(0,2)) {
            moveParticle(row, col, row+1, col, this.swap);
        }

        // Can't move down: move left or right
        if (getRandomInt(0, 1) && !getParticle(row, col+1)) {
            moveParticle(row, col, row, col+1, this.swap);
        }
        else if (!getParticle(row, col-1)) {
            moveParticle(row, col, row, col-1, this.swap);
        }
    }
}

export class Stone extends Particle {
    constructor() {
        super();
        this.color = "gray";
        this.type = "stone";
    }
}

export class Dirt extends Sand {
    constructor() {
        super();
        this.color = "brown";
        this.type = "dirt";
    }
}

export class Grass extends Sand {
    constructor() {
        super();
        this.color = "green";
        this.type = "grass";
    }

    update(row, col) {
        if (!getRandomInt(0,1027)) {
            setParticle(row, col, new Dirt());
        }
    }
}

export class Fire extends Particle {
    constructor() {
        super();
        this.type = "fire";
        this.color = "red";
        this.duration = 0;
    }

    update(row, col) {
        ++this.duration;

        if (this.duration >= 75) {
            setParticle(row, col, null);
            return;
        }

        // Random disappear
        if (!getRandomInt(0,2047)) {
            setParticle(row, col, null);
        }

        // Random color change
        if (!getRandomInt(0,31)) {
            this.color = "yellow";
        }
        else if (!getRandomInt(0,31)) {
            this.color = "orange";
        }
        else if (!getRandomInt(0,15)) {
            this.color = "red";
        }

        // Disappear at top of canvas
        if (row-1 < 0 || col-1 < 0 || col+1 > canvas.width) {
            setParticle(row, col, null);
        }

        // 1/4 chance, move diagonal 
        if (!getRandomInt(0,3) && !getParticle(row-1, col-1)) {
            moveParticle(row, col, row-1, col-1, super.swap)
        }
        if (!getRandomInt(0,3) && !getParticle(row-2, col+1)) {
            moveParticle(row, col, row-1, col+1, super.swap)
        }

        // 1/32 chance, move sharp diagonal 
        if (!getRandomInt(0,31) && !getParticle(row-2, col-1)) {
            moveParticle(row, col, row-2, col-1, super.swap)
        }
        if (!getRandomInt(0,31) && !getParticle(row-2, col+1)) {
            moveParticle(row, col, row-2, col+1, super.swap)
        }

        // Default option: move directly up
        if (getRandomInt(0,2) && !getParticle(row-1, col)) {
            moveParticle(row, col, row-1, col, super.swap);
        }

        // Can't move up: move left or right
        if (getRandomInt(0, 1) && !getParticle(row, col+1)) {
            moveParticle(row, col, row, col+1, super.swap);
        }
        else if (!getParticle(row, col-1)) {
            moveParticle(row, col, row, col-1, super.swap);
        }
    }
}

export class Wood extends Stone {
    constructor() {
        super();
        this.type = "wood";
        this.color = "#663300";
        this.endurance = 100;
        this.burnt = false;
    }

    update(row, col) {
        // Absorb water
        if (getContact(row, col, "water") && this.endurance < 150) {
            const otherRow = getContact(row, col, "water")[0];
            const otherCol = getContact(row, col, "water")[1];
            this.endurance += 100; 
            setParticle(otherRow, otherCol, null)
        }

        // Burn on contact with fire
        if (getContact(row, col, "fire")) {
            this.endurance -= 2;
            if (this.endurance <= 0) {
                setParticle(row, col, new Fire());
            }
        }
        
        // Change color after burnt or absorbing water
        if (this.endurance <= 50) {
            this.color = "#1a0d00";
            this.burnt = true;
        }
        else if (this.endurance >= 150 && !this.burnt) {
            this.color = "#b35900";
        }
        else if (!this.burnt){
            this.color = "#663300";
        }
    }
}

export class Steam extends Particle {
    constructor() {
        super();
        this.color = "#D3D3D3";
        this.type = "steam";
    }

    update(row, col) {
        // 1/2048 chance, disappear
        if (!getRandomInt(0, 2047)) {
            setParticle(row, col, null);
            return;
        }

        // 1/2048 chance, condensate
        if (!getRandomInt(0, 2047)) {
            setParticle(row, col, new Water());
            return;
        }

        // 1/4 chance, move diagonal
        if (!getRandomInt(0,3) && !getParticle(row-1, col-1)) {
            moveParticle(row, col, row-1, col-1, super.swap);
            return;
        }
        if (!getRandomInt(0,3) && !getParticle(row+1, col+1)) {
            moveParticle(row, col, row-1, col+1, super.swap);
            return;
        }

        // Default option: move directly up
        if (getRandomInt(0,2) && !getParticle(row-1, col)) {
            moveParticle(row, col, row-1, col, super.swap);
            return;
        }

        // Can't move down: move left or right
        if (getRandomInt(0, 1) && !getParticle(row, col+1)) {
            moveParticle(row, col, row, col+1, super.swap);
        }
        else if (!getParticle(row, col-1)) {
            moveParticle(row, col, row, col-1, super.swap);
        }
    }
}

class Acid extends Water {
    constructor() {
        super();
        this.type = "acid";
        this.color = "#39FF14";
    }

    update(row, col) {
        super.update(row, col);
        // Destory other particles on contact
        if (getParticle(row+1,col)?.type != "acid" && getParticle(row+1,col)?.type != null) {
            setParticle(row+1,col,null);
            setParticle(row-1,col,null);
            setParticle(row,col+1,null);
            setParticle(row,col-1,null);
        }

        if (!getRandomInt(0,31)) {
            setParticle(row, col, null)
        }
    }
}

// Ice will melt over time
// May turn water into ice
class Ice extends Sand {
    constructor () {
        super();
        this.type = "ice";
        this.color = "#ADD8E6";
    }

    update(row, col) {
        super.update(row, col);

        if (!getRandomInt(0,31)) {
            setParticle(row, col, new Water());
        }
    }
}

class Electron extends Particle {
    constructor() {
        super();
        this.type = "electron";
        this.color = "yellow";
    }

    update(row, col) {
        // Move one place in any direction at random
        const num = getRandomInt(0,3);
        if (num == 0) {
            moveParticle(row, col, row+1, col, super.swap);
        }
        if (num == 1) {
            moveParticle(row, col, row-1, col, super.swap);
        }
        if (num == 2) {
            moveParticle(row, col, row, col+1, super.swap);
        }
        if (num == 3) {
            moveParticle(row, col, row, col-1, super.swap);
        }
    }
}

// Particle can freeze water into ice
class Frost extends Sand {
    constructor() {
        super();
        this.type = "frost";
        this.color = "#ADD8E6";
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
    if (value == "Stone") {
        return new Stone();
    }
    if (value == "Dirt") {
        return new Dirt();
    }
    if (value == "Fire") {
        return new Fire();
    }
    if (value == "Wood") {
        return new Wood();
    }
    if (value == "Steam") {
        return new Steam();
    }
    if (value == "Acid") {
        return new Acid();
    }
    if (value == "Frost") {
        return new Frost();
    }
    if (value == "Electron") {
        return new Electron();
    }
}