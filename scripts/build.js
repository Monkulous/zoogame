import { mousePos, leftMousePressed } from "./input.js";
import { Enclosure, loadCollisions } from "./collisions.js";
import { player } from "./player.js";
import { canvas, ctx } from "./main.js";
import { UIContainer } from "./ui.js";

export const buildStates = {
  all: false,
  smallEnclosure: false
};

export function build(collisions, state) {
  if (buildStates.all) { //draws build lines if the player is building
    drawBuildLines(state.zoom);
  }
  collisions = placeSmallEnclosure(collisions, state)
  return collisions
}

function placeSmallEnclosure(collisions, state) {
  if (leftMousePressed && buildStates.all) { //places an enclosure if the mouse is clicked
    let enclosureType = "smallEnclosure";
    let enclosureImage = new Image();
    let location = "foreground";
    enclosureImage.src = "images/blocks/smallEnclosureBackgroundOther.png";
    let enclosureImageForeground = new Image();
    enclosureImageForeground.src = "images/blocks/smallEnclosureForegroundOther.png";
    collisions = placeBlock(player, collisions, state.zoom, enclosureType, enclosureImage, enclosureImageForeground, location);
  } else if (!leftMousePressed && buildStates.all) { //places a see-through temporary enclosure before the mouse is clicked
    let enclosureType = "temporaryEnclosure";
    let enclosureImage = new Image();
    let location = "temporary";
    enclosureImage.src = "images/blocks/smallEnclosure.png";
    let enclosureImageForeground = new Image();
    enclosureImageForeground.src = "images/blocks/smallEnclosure.png";
    collisions = placeBlock(player, collisions, state.zoom, enclosureType, enclosureImage, enclosureImageForeground, location);
  }
  return collisions
}



//each tile will be 9*9 pixels and 35*35 on screen.

function placeBlock(player, collisions, zoom, enclosureType, enclosureImage, enclosureImageForeground, location) {
  enclosureImage.onload = () => {
    let imageWidth = 245;
    let imageHeight = enclosureImage.height / enclosureImage.width * imageWidth;

    let intendedPosition = { //mouse position relative to player for a position of the enclosure to be placed
      x: (((mousePos.x / zoom) - canvas.width / (2 * zoom) + player.position.x + player.imageSize.x / 2) - imageWidth / 2),
      y: (((mousePos.y / zoom) - canvas.height / (2 * zoom) + player.position.y + player.imageSize.y * 3 / 4) - imageHeight * 3 / 4)
    };

    let newBlockPosition = { //the bottom left of the enclosure has to always be divisible by 35.
      x: (Math.round((intendedPosition.x) / 35) * 35),
      y: (Math.round((intendedPosition.y + imageHeight) / 35) * 35 - imageHeight)
    };

    let scale = 1

    let newCollision = new Enclosure(enclosureType, newBlockPosition, { x: imageWidth * scale, y: imageHeight * scale }, enclosureImage, enclosureImageForeground, true, { x: 245 * scale, y: 176 * scale });

    if (location === "temporary") { //when the enclosure hasnt been placed yet.
      newCollision.hasCollisions = false;
      newCollision.drawOpacity = 0.4; //see through
      collisions["temporary"].push(newCollision);
    } else if (location === "foreground") {
      loadCollisions(collisions["foreground"], newCollision, true); //detects collisions with the new enclosure position and other collisions, so a new enclosure cannot be placed on top of an old one.
      if (!(newCollision.isColliding.left || newCollision.isColliding.right | newCollision.isColliding.up | newCollision.isColliding.down)) {
        newCollision.hasCollisions = true;
        resetUIContainer()
        collisions = sortCollisions(newCollision, collisions, "foreground");
      }
    } else if (location === "background") {
      loadCollisions(collisions["background"], newCollision, true);
      if (!(newCollision.isColliding.left || newCollision.isColliding.right | newCollision.isColliding.up | newCollision.isColliding.down)) {
        newCollision.hasCollisions = false;
        resetUIContainer()
        collisions = sortCollisions(newCollision, collisions, "background");
      };
    }
  };

  return collisions;
}


function sortCollisions(newCollision, collisions, location) { //makes it so that collisions are drawn in order, so ones lower down are on top of ones higher up.
  collisions[location].push(newCollision);
  collisions[location].sort((a, b) => a.position.y - b.position.y);
  return collisions;
}

export function drawBuildLines(zoom) { //draws a grid pattern on the screen, with squares of 35px relative to zoom.
  const gridSize = 35;

  const playerX = player.position.x;
  const playerY = player.position.y;
  const canvasWidth = canvas.width / zoom
  const canvasHeight = canvas.height / zoom

  const topLeftX = playerX + player.imageSize.x / 2 - canvasWidth / 2 - player.velocity.x;
  const topLeftY = playerY + player.imageSize.y * 3 / 4 - canvasHeight / 2 - player.velocity.y;

  // ctx.beginPath();
  // ctx.arc(topLeftX, topLeftY, 17.5, 0, 2 * Math.PI);
  // ctx.stroke();

  // const lineOpacity = Math.min(1, zoom);
  // ctx.globalAlpha = lineOpacity;

  const startX = Math.floor(topLeftX / gridSize) * gridSize; //closest points to the top left divisible by 35
  const startY = Math.floor(topLeftY / gridSize) * gridSize;

  ctx.strokeStyle = '#0F0F0F';
  for (let x = startX; x < startX + canvasWidth + gridSize; x += gridSize) { //vertical lines
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, startY + canvasHeight + gridSize);
    ctx.stroke();
  }

  for (let y = startY; y < startY + canvasHeight + gridSize; y += gridSize) { //horizontal lines
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + canvasWidth + gridSize, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}
export function resetUIContainer() { //makes it so that buttons arent transparent, and makes all properties in buildStates equal to false, resetting building.
  UIContainer.classList.remove("disabledButton")
  for (let key in buildStates) { //sets each property in buildStates to false, closing the building menu
    if (buildStates.hasOwnProperty(key)) {
      buildStates[key] = false;
    }
  }
}