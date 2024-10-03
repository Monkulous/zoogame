import { ctx, canvas, zoo } from "./main.js"
import { player } from "./player.js";

export function translate(deltaTime, player, state) { //translates the canvas so the player is always centred
  ctx.setTransform(1, 0, 0, 1, 0, 0); //reset any previous transformations
  applyZoom(state); //scale the canvas
  ctx.translate((-player.position.x - player.imageSize.x / 2 + canvas.width / 2), (-player.position.y - player.imageSize.y * 3 / 4 + canvas.height / 2)); //translate the canvas, so the player is always centred
};

export function applyZoom(state) { //scale the canvas relative to the centre
  const centreX = canvas.width / 2;
  const centreY = canvas.height / 2;
  ctx.translate(centreX, centreY); //move the centre of the canvas to 0,0
  ctx.scale(state.zoom, state.zoom); //scale by the zoom factor
  ctx.translate(-centreX, -centreY); //move the centre of the canvas back
};

export function clearView() { //clears the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
};

export function displayInfo(deltaTime, player, state, zoo) {
  //ctx.fillText(zoo.totalHappiness, player.position.x - player.velocity.x + 0.5 * player.imageSize.x, player.position.y - player.velocity.y, 300);
  let hours = Math.floor((zoo.time / 60) % 24)
  let minutes = Math.floor(zoo.time % 60)
  let timeDisplay = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0')

  sayPlayerMessages()

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  showNightSky(zoo)

  ctx.font = "70px Silkscreen";
  ctx.fillText(timeDisplay, canvas.width - 110, 50, 300);
  ctx.font = "50px Silkscreen";
  ctx.textAlign = "left"
  ctx.fillText("£" + Math.floor(zoo.money), 140, 50, 300);
  ctx.textAlign = "center"
  ctx.font = "30px Silkscreen";
  ctx.fillText("x" + Math.round(zoo.timeSpeed * 2) / 2, canvas.width - 110, 87, 300);
}

export function speedUpTime() {
  zoo.timeSpeed = Math.min(250, zoo.timeSpeed * 2.5)
}

export function slowDownTime() {
  zoo.timeSpeed = Math.max(0.4096, zoo.timeSpeed / 2.5)
}

function sayPlayerMessages() {
  if (player.messageTimer > 0) {
    ctx.font = "20px Silkscreen";
    ctx.fillText(player.message, player.position.x - player.velocity.x + 0.5 * player.imageSize.x, player.position.y - player.velocity.y, 500);
    ctx.font = "30px Silkscreen";
  }
}

function showNightSky(zoo) {
  let hours = (zoo.time / 60) % 24
  ctx.globalAlpha = Math.max(Math.min(0.9, (hours ** 2 - 24 * (hours) + 135) * 0.0057), 0)
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1
  ctx.fillStyle = "#FFFFFF"
}