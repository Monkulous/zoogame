import { player } from "./player.js";
import { updateAllCollisions, Enclosure } from "./collisions.js";
import { build } from "./build.js";
import { addButton, UIContainer } from "./ui.js"
import { Animal } from "./entities.js"
import { mouseHoveringOverObject } from "./input.js"

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

export let state = {
    zoom: 1,
    click: false //only true the frame when the left mouse button is released
};

let collisions = {
    background: [],
    foreground: [],
    temporary: []
};

export let animals = []

addButton('open-mainShop-menu-button', 'unhighlightable', 'images/ui/buttons/openMainShop.png', { x: 15.15, y: 100 }, { x: 7.2, y: 12 }, UIContainer); //each pixel is 0.75 x 0.45
addButton('open-buildInventory-menu-button', 'unhighlightable', 'images/ui/buttons/openBuildMenu.png', { x: 7.2, y: 100 }, { x: 7.2, y: 12 }, UIContainer); //each pixel is 0.75 x 0.45

let lastTime = Date.now();

function update(ctx) { //draws each frame
    let deltaTime = (Date.now() - lastTime) / 1000; //time from last frame in seconds
    lastTime = Date.now();
    clearView();
    translate(deltaTime);
    updateAllCollisions(ctx, collisions, player, deltaTime);
    updateAllEntities(deltaTime)
    collisions = build(collisions, state);
    state.click = false //reset state.click for the next frame
    requestAnimationFrame(() => update(ctx));
};

function translate(deltaTime) { //translates the canvas so the player is always centred
    ctx.setTransform(1, 0, 0, 1, 0, 0); //reset any previous transformations
    displayInfo(deltaTime);
    applyZoom(); //scale the canvas
    ctx.translate((-player.position.x - player.imageSize.x / 2 + canvas.width / 2), (-player.position.y - player.imageSize.y * 3 / 4 + canvas.height / 2)); //translate the canvas, so the player is always centred
};

function applyZoom() { //scale the canvas relative to the centre
    const centreX = canvas.width / 2;
    const centreY = canvas.height / 2;
    ctx.translate(centreX, centreY); //move the centre of the canvas to 0,0
    ctx.scale(state.zoom, state.zoom); //scale by the zoom factor
    ctx.translate(-centreX, -centreY); //move the centre of the canvas back
};

function clearView() { //clears the canvas
    const topLeft = { //calculates the top left point on the canvas
        x: player.position.x + player.imageSize.x / 2 - canvas.width / 2 / state.zoom - player.velocity.x,
        y: player.position.y + player.imageSize.y * 3 / 4 - canvas.height / 2 / state.zoom - player.velocity.y,
    };
    ctx.clearRect(topLeft.x, topLeft.y, canvas.width / state.zoom, canvas.height / state.zoom); //clear canvas
};

function displayInfo(deltaTime) {
    ctx.font = "30px Silkscreen";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("(" + Math.floor(player.position.x / 35) + ", " + Math.floor(player.position.y / 35) + ")", 500, 40, 300);
    ctx.fillText(collisions["foreground"].length, 700, 100, 300);
    ctx.fillText(state.zoom, 900, 40, 300);
    ctx.fillText(Math.floor(1 / deltaTime), 100, 20, 300);
};

function updateAllEntities(deltaTime) { //update the player and animals, so they are in the right position for the next frame
    player.update(ctx, deltaTime);
    animals.forEach((animal) => { animal.update(ctx, deltaTime) })
}

update(ctx);