import { player } from "./player.js";
import { updateAllCollisions, Enclosure } from "./collisions.js";
import { build } from "./build.js";
import { addButton, UIContainer } from "./ui.js"
import { Animal } from "./entities.js"

export let state = {
    zoom: 1
};

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let collisions = {
    background: [],
    foreground: [],
    temporary: []
};

addButton('open-mainShop-menu-button', 'unhighlightable', 'images/ui/buttons/openMainShop.png', { x: 100, y: 100 }, { x: 7.2, y: 12 }, UIContainer); //each pixel is 0.75 x 0.45
addButton('open-buildInventory-menu-button', 'unhighlightable', 'images/ui/buttons/openBuildMenu.png', { x: 92.05, y: 100 }, { x: 7.2, y: 12 }, UIContainer); //each pixel is 0.75 x 0.45

let lastTime = Date.now();

function update(ctx) { //draws each frame
    let deltaTime = (Date.now() - lastTime) / 1000;
    lastTime = Date.now();
    clearView();
    translate(deltaTime);
    updateAllCollisions(ctx, collisions, player, deltaTime);
    player.update(ctx, deltaTime);
    collisions = build(collisions, state.zoom);
    requestAnimationFrame(() => update(ctx));
};

function translate(deltaTime) { //translates the canvas so the player is always centred
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    displayInfo(deltaTime);
    applyZoom();
    ctx.translate((-player.position.x - player.imageSize.x / 2 + canvas.width / 2), (-player.position.y - player.imageSize.y * 3 / 4 + canvas.height / 2));
};

function applyZoom() {
    const centreX = canvas.width / 2;
    const centreY = canvas.height / 2;
    ctx.translate(centreX, centreY);
    ctx.scale(state.zoom, state.zoom);
    ctx.translate(-centreX, -centreY);
};

function clearView() {
    const topLeft = {
        x: player.position.x + player.imageSize.x / 2 - canvas.width / 2 / state.zoom - player.velocity.x,
        y: player.position.y + player.imageSize.y * 3 / 4 - canvas.height / 2 / state.zoom - player.velocity.y,
    };
    ctx.clearRect(topLeft.x, topLeft.y, canvas.width / state.zoom, canvas.height / state.zoom);
};

function displayInfo(deltaTime) {
    ctx.font = "30px Silkscreen";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("(" + Math.floor(player.position.x / 35) + ", " + Math.floor(player.position.y / 35) + ")", 500, 40, 300);
    ctx.fillText(collisions["foreground"].length, 700, 100, 300);
    ctx.fillText(state.zoom, 900, 40, 300);
    ctx.fillText(Math.floor(1 / deltaTime), 100, 20, 300);
};

update(ctx);