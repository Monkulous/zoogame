import { ctx, animals, state } from "./main.js"
import { GameObject } from "./gameObjects.js";
import { player } from "./player.js";
import { mouseHoveringOverObject, leftMousePressed } from "./input.js"
import { Animal } from "./entities.js";
import { menuStates, toggleMenu } from "./ui.js"
import { buildStates } from "./build.js"

export function updateAllCollisions(ctx, collisions, player, deltaTime) {
  loadCollisions(collisions["background"], player, false);
  loadCollisions(collisions["temporary"], player, false);
  collisions.temporary = [];
  collisions["foreground"].forEach((collision) => {
    if ((collision.position.y + collision.imageSize.y) - 1 < (player.position.y + player.imageSize.y - player.collisionSize.y)) {
      collision.update(ctx, player, true);
    };
  });
  player.draw(ctx);
  collisions["foreground"].forEach((collision) => {
    if ((collision.position.y + collision.imageSize.y) - 1 >= (player.position.y + player.imageSize.y - player.collisionSize.y)) {
      collision.update(ctx, player, false);
    };
  });
};

export function loadCollisions(collisions, other, includeAllCollisions) { //includeAllCollisions ignores whether the player can collide with the collision, and includes every collision when changing the isColliding value
  other.isColliding = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  collisions.forEach((collision) => {
    collision.update(ctx, other, includeAllCollisions);
  });
}

export function calculateDistanceFromCollision(collision, otherCollision) {
  let collisionCenterX = collision.position.x + collision.collisionSize.x / 2;
  let collisionCenterY = collision.position.y + collision.collisionSize.y / 2;

  let distanceX = Math.abs(collisionCenterX - otherCollision.position.x - otherCollision.collisionSize.x / 2);
  let distanceY = Math.abs(collisionCenterY - otherCollision.position.y - otherCollision.collisionSize.y / 2);
  let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  return distance;
}


class Collision extends GameObject {
  constructor(type, position, imageSize, image, hasCollisions, collisionSize) {
    super(type, image, position, imageSize, collisionSize)
    this.hasCollisions = hasCollisions;
  }
  collides(other, includeAllCollisions) {
    if (this.hasCollisions === true || includeAllCollisions) {
      const otherCollisionPosition = other.collisionPosition;

      // Calculate overlap in X and Y directions
      let overlapX = Math.min(this.collisionPosition.x + this.collisionSize.x, otherCollisionPosition.x + other.collisionSize.x) - Math.max(this.collisionPosition.x, otherCollisionPosition.x);
      let overlapY = Math.min(this.collisionPosition.y + this.collisionSize.y, otherCollisionPosition.y + other.collisionSize.y) - Math.max(this.collisionPosition.y, otherCollisionPosition.y);

      const epsilon = 1e-10;  //any value smaller than this will be set to 0, preventing floating point precision errors from affecting the outcome

      if (Math.abs(overlapY) < epsilon) {
        overlapY = 0;
      }

      if (Math.abs(overlapX) < epsilon) {
        overlapX = 0;
      }

      // Check if there's overlap and handle collisions
      if (overlapX >= 0 && overlapY >= 0) {
        // Determine collision direction
        if (overlapX < overlapY) {
          // Colliding left or right
          if (otherCollisionPosition.x < this.collisionPosition.x) {
            other.position.x = this.collisionPosition.x - other.collisionSize.x - 0.5 * (other.imageSize.x - other.collisionSize.x);
            other.isColliding.right = true;
          } else {
            other.position.x = this.collisionPosition.x + this.collisionSize.x - 0.5 * (other.imageSize.x - other.collisionSize.x)
            other.isColliding.left = true;
          };
        } else {
          // Colliding top or bottom
          if (otherCollisionPosition.y < this.collisionPosition.y) {
            //colliding top
            other.position.y = this.position.y + this.imageSize.y - this.collisionSize.y - other.imageSize.y;
            other.isColliding.down = true;
          } else {
            //colliding bottom
            other.position.y = this.collisionPosition.y + this.collisionSize.y - other.imageSize.y + other.collisionSize.y;
            other.isColliding.up = true;
          };
        };
      };
    };
  };
  update(ctx, other, includeAllCollisions) {
    this.draw(ctx);
    this.collides(other, includeAllCollisions);
  };
};

export class Enclosure extends Collision { //this will have a list of the animals inside the enclosure and a different draw function, so that it draws the enclosure then it draws the animals then it draws the front railing
  constructor(name, position, imageSize, image, foregroundImage, hasCollisions, collisionSize) {
    super(name, position, imageSize, image, hasCollisions, collisionSize);
    this.foregroundImage = foregroundImage
    this.animals = []
  };
  draw(ctx) { //draws background, then animals, then foreground
    ctx.globalAlpha = this.drawOpacity;
    ctx.drawImage(this.image, this.position.x, this.position.y, this.imageSize.x, this.imageSize.y);
    ctx.globalAlpha = 1;

    this.animals.sort((a, b) => (a.position.y + a.imageSize.y) - (b.position.y + b.imageSize.y)); //make sure all the animals in the enclosure appear behind ones infont of them

    this.animals.forEach((animal) => {
      animal.draw(ctx) //draw animal
    });

    ctx.globalAlpha = this.drawOpacity;
    ctx.drawImage(this.foregroundImage, this.position.x, this.position.y, this.imageSize.x, this.imageSize.y);
    ctx.globalAlpha = 1;
  };
  update(ctx, other, includeAllCollisions) {
    this.draw(ctx);
    this.collides(other, includeAllCollisions);
    this.checkInteraction()
  };
  checkInteraction() {
    if (mouseHoveringOverObject(this, player) && state.click && this.hasCollisions && !menuStates.all && !buildStates.all) {
      toggleMenu("enclosureMenu", this)
    }
  }
};

export function addAnimal(newCollision, animalName) {
  let random = Math.round(Math.random() * 1) + 1
  if (random === 1) {
    addTiger(newCollision)
  } else if (random === 2) {
    addGiraffe(newCollision)
  }
}

function addTiger(newCollision) {
  //let tigerGeneticChanges = Math.floor(Math.random() * 10000)
  let tigerImageRight = new Image()
  tigerImageRight.src = "images/tigerRight.png"
  let tigerImageLeft = new Image()
  tigerImageLeft.src = "images/tigerLeft.png"
  let tigerImages = { left: [tigerImageLeft], right: [tigerImageRight] }

  for (let i = 0; i < 1; i++) {
    let tiger = new Animal("tiger", tigerImages, { x: 136.1111111111, y: 85.55555556 }, { x: 136.1111111111, y: 35 }, newCollision)
    newCollision.animals.push(tiger)
    animals.push(tiger)
  }
}

function addGiraffe(newCollision) {
  let giraffeImageRight = new Image()
  giraffeImageRight.src = "images/giraffeRight.png"
  let giraffeImageLeft = new Image()
  giraffeImageLeft.src = "images/giraffeLeft.png"
  let giraffeImages = { left: [giraffeImageLeft], right: [giraffeImageRight] }

  for (let i = 0; i < 1; i++) {
    let giraffe = new Animal("giraffe", giraffeImages, { x: 373.333333333, y: 299.444444445 }, { x: 136.1111111111, y: 35 }, newCollision)
    newCollision.animals.push(giraffe)
    animals.push(giraffe)
  }
}