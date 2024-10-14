import { mousePos, leftMousePressed } from "./input.js";
import { Enclosure, loadCollisions, sortCollisions } from "./collisions.js";
import { player } from "./player.js";
import { canvas, ctx } from "./main.js";
import { UIContainer } from "./ui.js";
import { applyZoom } from "./canvasUtils.js";

const gridSize = 35 //size of the building grid

export const buildStates = {
  hasAnyTrue: function() {
    return Object.values(this)
      .some(value => value === true);
  },
  smallEnclosure: false,
  mediumEnclosure: false
};

export const enclosureSources = {
  smallEnclosure: {
    background: "images/blocks/smallEnclosureBackgroundOther.png",
    foreground: "images/blocks/smallEnclosureForegroundOther.png",
    collisionSize: { x: 245, y: 176 },
    scale: 7 / 7,
    size: "small",
    price: 10000
  },
  mediumEnclosure: {
    background: "images/blocks/smallEnclosureBackgroundOther.png",
    foreground: "images/blocks/smallEnclosureForegroundOther.png",
    collisionSize: { x: 245, y: 176 },
    scale: 16 / 7,
    size: "medium",
    price: 20000
  },
  largeEnclosure: {
    background: "images/blocks/smallEnclosureBackgroundOther.png",
    foreground: "images/blocks/smallEnclosureForegroundOther.png",
    collisionSize: { x: 245, y: 176 },
    scale: 25 / 7,
    size: "large",
    price: 40000
  }
};

export function checkBuild(collisions, state) {
  if (buildStates.hasAnyTrue()) { //draws build lines if the player is building
    drawBuildGrid(state.zoom)
    collisions = gatherBuildInfo(collisions, state) //builds an enclosure
  }
  return collisions
}

function checkBuildType() { //checks which enclosure is being build and returns result.
  for (let buildType in buildStates) { //loop through each property in buildStates
    if (buildStates[buildType] && buildType != "hasAnyTrue") { //checks if a specific build type is correct
      return buildType;
    }
  }
}

function gatherBuildInfo(collisions, state) { //this function is run when an enclosure is placed

  let buildType = checkBuildType() //this checks which enclosure is being placed

  //create image for the foreground and background of the enclosure using enclosureSourcs
  let buildImageBackground = new Image()
  buildImageBackground.src = enclosureSources[buildType]["background"]
  let buildImageForeground = new Image()
  buildImageForeground.src = enclosureSources[buildType]["foreground"]

  let location = leftMousePressed ? "foreground" : "temporary" //will store the location in collisions where the enclosure is places (foreground - on the ground, temporary - holds the transparent enclosure, showing the user where it will be placed)


  collisions = placeBuilding(player, collisions, state.zoom, buildType, buildImageBackground, buildImageForeground, location); //place the enclosure, using the values gathered.
  return collisions;
}

//each tile will be 9*9 pixels and 35*35 on screen.

function placeBuilding(player, collisions, zoom, buildType, buildImageBackground, buildImageForeground, location) {
  buildImageBackground.onload = () => { //can only access image properties when the image is loaded
    let scale = enclosureSources[buildType].scale

    let imageWidth = buildImageBackground.width * 35 / 9 //ensures pixels in each enclosure will be the same size
    let imageHeight = buildImageBackground.height / buildImageBackground.width * imageWidth //adjust the height of the image, so pixels are the correct size


    let collisionWidth = enclosureSources[buildType].collisionSize.x
    let collisionHeight = enclosureSources[buildType].collisionSize.y //use enclosureSources for the collisionSize

    imageWidth *= scale
    imageHeight *= scale


    collisionWidth *= scale
    collisionHeight *= scale

    let collisionSize = { x: collisionWidth, y: collisionHeight }

    let unroundedPosition = { //mouse position relative to player for a position of the enclosure to be placed
      x: mousePos.x / zoom - canvas.width / 2 / zoom + player.position.x + player.imageSize.x / 2 - (imageWidth / 2),
      y: mousePos.y / zoom - canvas.height / 2 / zoom + player.position.y + player.imageSize.y * 3 / 4 - (imageHeight * 3 / 4)
    }

    let roundedPosition = { //makes it so that the bottom left of the enclosure has to always be divisible by 35.
      x: (Math.round((unroundedPosition.x) / gridSize) * gridSize),
      y: (Math.round((unroundedPosition.y + imageHeight) / gridSize) * gridSize - imageHeight)
    }

    let newCollision = new Enclosure(buildType, roundedPosition, { x: imageWidth, y: imageHeight }, buildImageBackground, buildImageForeground, true, collisionSize, enclosureSources[buildType].size, enclosureSources[buildType].price) //creates the new collision, but it is not added to the canvas yet

    if (location === "temporary") { //when the enclosure hasnt been placed yet.
      newCollision.hasCollisions = false
      newCollision.drawOpacity = 0.4 //see through
      collisions["temporary"].push(newCollision)
    } else {
      loadCollisions(collisions[location], newCollision, true); //detects collisions with the new enclosure position and other collisions, so a new enclosure cannot be placed on top of an old one.
      let newCollisionColliding = (newCollision.isColliding.left || newCollision.isColliding.right | newCollision.isColliding.up | newCollision.isColliding.down) //true or false value to see if the collision is colliding with something, so wont be placed.
      if (!newCollisionColliding) {
        newCollision.hasCollisions = (location === "foreground") ? true : false
        resetBuildingUI()
        collisions[location].push(newCollision);
        //collisions = sortCollisions(collisions[location])
      }
    }
  }
  return collisions;
};


export function drawBuildGrid(zoom) { //draws a grid pattern on the screen, with squares of 35px relative to zoom.
  const playerX = player.position.x;
  const playerY = player.position.y;
  const canvasWidth = canvas.width / zoom
  const canvasHeight = canvas.height / zoom

  const topLeftX = playerX + player.imageSize.x / 2 - canvasWidth / 2 - player.velocity.x;
  const topLeftY = playerY + player.imageSize.y * 3 / 4 - canvasHeight / 2 - player.velocity.y;

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

}

export function resetBuildingUI() { //makes it so that buttons arent transparent, and makes all properties in buildStates equal to false, resetting building.
  UIContainer.classList.remove("disabledButton")
  document.body.style.cursor = "auto"
  for (let key in buildStates) {
    if (key != "hasAnyTrue") {
      buildStates[key] = false
    }
  }
}