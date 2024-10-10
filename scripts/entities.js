import { GameObject } from "./gameObjects.js";
import { zoo, visitors } from "./main.js"

export class Entity extends GameObject {
  constructor(name, images, position, imageSize, collisionSize) {
    super(name, images["left"][0], position, imageSize, collisionSize);
    this.images = images
    this.velocity = { x: 0, y: 0 };
    this.movementType = "idle";
    this.messageTimer = 0
    this.message = ""
    this.movementDirection = "left";
    this.lastAnimationTime = Date.now();
    this.animationIndex = 0;
    this.isColliding = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
  };
  update(ctx, deltaTime) {
    this.updateMessage()
    this.detectMovement(deltaTime);
    this.animate()
  };
  animate() {
    this.getMovementType();
    this.getImage();
  };
  getMovementType() {
    //getting movement direction (either right or left)
    if (this.velocity.x != 0) {
      this.movementDirection = this.velocity.x > 0 ? "right" : "left";
    };
    //getting movement type (either idle or walking)
    this.movementType = (this.velocity.y === 0 && this.velocity.x === 0) ? "idle" : "walking";
  };
  getImage() {
    let image;
    if (this.movementType === "idle") {
      image = this.images[this.movementDirection][0]; //use the first image in the image list if idle
      this.animationIndex = 0;
    } else if (this.movementType === "walking") { //scroll through images in the image list relative to deltaTime
      const currentTime = Date.now();
      if (currentTime - this.lastAnimationTime > this.frameInterval) { //130ms between images
        this.animationIndex = (this.animationIndex >= this.images[this.movementDirection].length - 1) ? 0 : this.animationIndex + 1; //chooses next image
        image = this.images[this.movementDirection][this.animationIndex];
        this.lastAnimationTime = currentTime; //reset time from last animation frame
      } else {
        image = this.images[this.movementDirection][this.animationIndex];
      };
    };
    this.image = image;
  };
  moveTowardsLocation(deltaTime) {
    this.movementVector = {
      x: this.randomLocation.x - this.position.x,
      y: this.randomLocation.y - this.position.y
    }

    const distance = Math.sqrt(this.movementVector.x ** 2 + this.movementVector.y ** 2)

    if (distance < this.movementSpeed * deltaTime) { //if this position is the random position
      this.position.x = this.randomLocation.x
      this.position.y = this.randomLocation.y
      this.reachedDestination()
    } else {
      this.velocity = {
        x: this.movementVector.x / distance * deltaTime * this.movementSpeed,
        y: this.movementVector.y / distance * deltaTime * this.movementSpeed
      }
    }
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  };
  say(text, time) {
    this.message = text
    this.messageTimer = time
  }
  updateMessage() {
    if (this.messageTimer === 0) {
      this.message = ""
    } else {
      this.messageTimer -= 1
    }
  }
};

const animalCardSources = {
  "tiger": "images/ui/shop/tigerShopCard.png",
  "giraffe": "images/ui/shop/giraffeShopCard.png",
  "elephant": "images/ui/shop/elephantShopCard.png"
}

export const animalPrices = {
  "tiger": 40000,
  "giraffe": 50000,
  "elephant": 50000
}

export class Animal extends Entity {
  constructor(name, images, imageSize, collisionSize, enclosure) {
    super(name, images, enclosure.position, imageSize, collisionSize)
    this.movementSpeed = 100 * zoo.timeSpeed;
    this.frameInterval = 130 / zoo.timeSpeed //130ms between frames
    this.owner = enclosure;
    this.happiness = 100;
    this.startPosition()
    this.waitTime = 0
    this.cardSrc = animalCardSources[name]
  };
  startPosition() { //generates a random starting position inside the enclosure
    this.adjustImageSize()
    this.boundPosition = { //top left position inside enclosure
      x: this.owner.collisionPosition.x + 0.5 * (- this.imageSize.x + this.collisionSize.x), //this includes 0.5 because the collision is in the middle of the image on the x axis
      y: this.owner.collisionPosition.y - this.imageSize.y + this.collisionSize.y
    };
    this.boundSize = { //size of the enclosure
      x: this.owner.collisionSize.x,
      y: this.owner.collisionSize.y
    };
    this.pickRandomLocation() //picks random start position
    this.position = this.randomLocation
  };
  pickRandomLocation() {
    this.randomLocation = { //picks any random location inside the enclosure
      x: (this.boundPosition.x) + Math.random() * ((this.boundSize.x - this.collisionSize.x)),
      y: (this.boundPosition.y) + Math.random() * ((this.boundSize.y - this.collisionSize.y))
    };
  };
  reachedDestination() {
    this.velocity = { x: 0, y: 0 }
    this.pickRandomLocation(); //create new location
    this.waitTime = Math.floor(Math.random() * 100) + 10 //wait for a period
  }
  detectMovement(deltaTime) {
    this.movementSpeed = 100 * zoo.timeSpeed //update, so change due to timeSpeed
    this.frameInterval = 130 / zoo.timeSpeed
    if (this.waitTime > 0) {
      this.waitTime -= 1 * zoo.timeSpeed //count down wait time if its not 0
    } else {
      this.moveTowardsLocation(deltaTime); //move towards random location
    };
  };
};