import { ctx, animals, state, zoo } from "./main.js"
import { GameObject } from "./gameObjects.js";
import { player, Player } from "./player.js";
import { mouseHoveringOverObject, leftMousePressed } from "./input.js"
import { Animal } from "./entities.js";
import { Visitor } from "./visitor.js";
import { menuExitButton, menuStates, openMenu } from "./ui.js"
import { buildStates } from "./build.js"

export function updateAllCollisions(ctx, collisions, visitors, player, deltaTime) {
  player.isColliding = { //reset player collisions
    up: false,
    down: false,
    left: false,
    right: false
  };

  collisions["background"].forEach((collision) => {
    collision.draw(ctx);
  });

  collisions["temporary"].forEach((collision) => {
    collision.draw(ctx);
  });

  collisions.temporary = [];

  let orderedCollisions = orderCollisions([collisions["foreground"], visitors], player)
  orderedCollisions.forEach((collision) => {

    if (collision instanceof Visitor) {
      if (!((zoo.time / 60) % 24 > 17 || (zoo.time / 60) % 24 < 10)) {
        collision.update(ctx, deltaTime, collisions["foreground"])
      } else {
        collision.position = {
          x: collision.startPositionCoordinates.x,
          y: collision.startPositionCoordinates.y
        }
      }
    } else if (collision instanceof Collision) {
      collision.draw(ctx); //draw the collision once
      collision.update(ctx, player, true) //test if the player is colliding with the collision
    } else if (collision instanceof Player) {
      collision.draw(ctx) //the player is not updated yet, because all enclosures need to be checked if the player is colliding first
    };
  });
};

function orderCollisions(arrays, player) {
  let orderedCollisions = []
  arrays.forEach((array) => {
    array.forEach((collision) => {
      orderedCollisions.push(collision)
    })
  })
  orderedCollisions.push(player);
  sortCollisions(orderedCollisions)
  return orderedCollisions
}

export function loadCollisions(collisions, other, includeAllCollisions) { //includeAllCollisions ignores whether the player can collide with the collision, and includes every collision when changing the isColliding value
  other.isColliding = {
    up: false,
    down: false,
    left: false,
    right: false
  };
  collisions.forEach((collision) => {
    collision.update(ctx, other, includeAllCollisions);
  });
}

export function sortCollisions(collisions) { //makes it so that collisions are drawn in order, so ones lower down are on top of ones higher up.
  collisions.sort((a, b) => (a.position.y + a.imageSize.y) - (b.position.y + b.imageSize.y));
  return collisions;
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
    this.collides(other, includeAllCollisions);
  };
};

export class Enclosure extends Collision { //this will have a list of the animals inside the enclosure and a different draw function, so that it draws the enclosure then it draws the animals then it draws the front railing
  constructor(name, position, imageSize, image, foregroundImage, hasCollisions, collisionSize, size) {
    super(name, position, imageSize, image, hasCollisions, collisionSize);
    this.foregroundImage = foregroundImage
    this.size = size
    this.animals = []
    this.happiness = 0
    this.desiredNumAnimals = 0
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
    this.collides(other, includeAllCollisions);
    this.checkInteraction()
    this.calculateEnclosureHappiness()
  };
  checkInteraction() {
    if (mouseHoveringOverObject(this, player) && state.click && this.hasCollisions && !menuStates.hasAnyTrue() && !buildStates.hasAnyTrue()) {
      openMenu("enclosureMenu", this)
    }
  }
  calculateEnclosureHappiness() {
    let enclosureHappiness = 100
    let numAnimals = this.animals.length
    if (this.size === "small") {
      enclosureHappiness *= 0.6
      this.desiredNumAnimals = 2
    } else if (this.size === "medium") {
      enclosureHappiness *= 0.75
      this.desiredNumAnimals = 4
    } else {
      this.desiredNumAnimals = 6
    }
    if (this.animals.length > 0) {
      enclosureHappiness *= Math.exp(-Math.abs(numAnimals - this.desiredNumAnimals))
    } else {
      enclosureHappiness = 0
    }
    this.happiness = Math.round(enclosureHappiness)
    //size of enclosure. The bigger the better.
    //number of animals in enclosure. 2 for small. 4 for medium. 6 for big one.
  }
};

export function addAnimal(newCollision, animalName, money) {
  if (zoo.money >= money) {
    zoo.money -= money
    if (animalName === "giraffe") {
      addGiraffe(newCollision)
    } else if (animalName === "tiger") {
      addTiger(newCollision)
    } else if (animalName === "elephant") {
      addElephant(newCollision)
    }
    newCollision.calculateEnclosureHappiness()
    openMenu("enclosureMenu", newCollision)
  } else {
    menuExitButton()
    player.say("I can't afford this", 100)
  }
}

function addTiger(newCollision) {
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
    let giraffe = new Animal("giraffe", giraffeImages, { x: 373.333333333, y: 299.444444445 }, { x: 136.1111111111, y: 35 }, newCollision) //multiply number of pixels for x and y by 3.88888889
    newCollision.animals.push(giraffe)
    animals.push(giraffe)
  }
}

function addElephant(newCollision) {
  let elephantImageRight = new Image()
  elephantImageRight.src = "images/elephantRight.png"
  let elephantImageLeft = new Image()
  elephantImageLeft.src = "images/elephantLeft.png"
  let elephantImages = { left: [elephantImageLeft], right: [elephantImageRight] }

  for (let i = 0; i < 1; i++) {
    let elephant = new Animal("elephant", elephantImages, { x: 373.333333333, y: 221.666667 }, { x: 210, y: 35 }, newCollision)
    newCollision.animals.push(elephant)
    animals.push(elephant)
  }
}