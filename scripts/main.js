import { player } from "./player.js";
import { updateAllCollisions, loadCollisions, Enclosure } from "./collisions.js";
import { checkBuild } from "./build.js";
import { clearView, translate, displayInfo } from "./canvasUtils.js"
import { addVisitor } from "./visitor.js";

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.textAlign = "center"
ctx.font = "30px Silkscreen";
ctx.fillStyle = "#FFFFFF";

export let state = {
    zoom: 1,
    click: false //only true the frame when the left mouse button is released
};

export let zoo = {
    money: 200000,
    time: 600,
    timeSpeed: 1.024,
    totalHappiness: 0,
    averageHappiness: 0,
    numEnclosures: 0,
    numAnimals: 0,
    numAnimalTypes: 0,
    rating: 0,
    numVisitors: 0
}

let collisions = {
    background: [],
    foreground: [],
    temporary: []
};

export let animals = []
export let visitors = []

addVisitor(100, { x: 0, y: 0 })

let lastTime = Date.now();

function update(ctx) { //draws each frame
    let deltaTime = (Date.now() - lastTime) / 1000; //time from last frame in seconds

    lastTime = Date.now();

    zoo.time += deltaTime * zoo.timeSpeed

    calculateZooProfit()

    clearView(state); //clears the canvas for a new frame
    translate(deltaTime, player, state); //translates the canvas, so the player is in the centre.

    updateAllCollisions(ctx, collisions, visitors, player, deltaTime); //draws all collisions and player in correct places
    collisions = checkBuild(collisions, state); //checks if the player is building and updates the collisions if the player is.
    updateAllEntities(deltaTime) //update the player and entities (the player is not drawn again)

    calculateZooStats(collisions)

    displayInfo(deltaTime, player, state, zoo)

    state.click = false //reset state.click for the next frame, as it is only true for the frame the left mouse is released

    requestAnimationFrame(() => update(ctx));
};

function updateAllEntities(deltaTime) { //update the animals, so they are in the right position for the next frame
    animals.forEach((animal) => { animal.update(ctx, deltaTime) }) //draw and move each animal
    player.update(ctx, deltaTime)
}

function calculateZooStats(collisions) {
    let totalHappiness = 0
    let numEnclosures = 0
    let numAnimals = 0
    let animalTypes = []
    collisions["foreground"].forEach((collision) => {
        if (collision instanceof Enclosure) {
            numEnclosures += 1
            totalHappiness += collision.happiness
            collision.animals.forEach((animal) => {
                numAnimals += 1
                if (!animalTypes.includes(animal.name)) {
                    animalTypes.push(animal.name)
                }
            })
        }
    });
    zoo.totalHappiness = totalHappiness
    zoo.averageHappiness = Math.floor(totalHappiness / numEnclosures * 20) / 20
    if (isNaN(zoo.averageHappiness)) { zoo.averageHappiness = 0 }
    zoo.numEnclosures = numEnclosures
    zoo.numAnimals = numAnimals
    zoo.numAnimalTypes = animalTypes.length

    zoo.rating = (Math.min(5, ((zoo.totalHappiness / 150) * zoo.averageHappiness / 100) * zoo.numAnimalTypes * 10))
}

function calculateZooProfit() {
    let hours = (zoo.time / 60) % 24
    if (hours >= 10 && hours < 17) {
        zoo.money += ((zoo.rating / 2) * zoo.timeSpeed) * Math.exp(-1 / 5 * (hours - 10))
    }
}

update(ctx);