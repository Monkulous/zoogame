import { GameObject } from "./gameObjects.js";
import { pressedKeys } from "./input.js"

export class Entity extends GameObject {
  constructor(name, images, position, imageSize, collisionSize) {
    super(name, images["left"][0], position, imageSize, collisionSize);
    this.images = images
    this.velocity = { x: 0, y: 0 };
    this.movementType = "idle";
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
      if (currentTime - this.lastAnimationTime > 130) { //130ms between images
        this.animationIndex = (this.animationIndex >= this.images[this.movementDirection].length - 1) ? 0 : this.animationIndex + 1; //chooses next image
        image = this.images[this.movementDirection][this.animationIndex];
        this.lastAnimationTime = currentTime; //reset time from last animation frame
      } else {
        image = this.images[this.movementDirection][this.animationIndex];
      };
    };
    this.image = image;
  };
};

const animalCardSources = {
  "tiger": "images/ui/shop/tigerShopCard.png",
  "giraffe": "images/ui/shop/giraffeShopCard.png"
}

export class Animal extends Entity {
  constructor(name, images, imageSize, collisionSize, enclosure) {
    super(name, images, enclosure.position, imageSize, collisionSize)
    this.owner = enclosure;
    this.happiness = 100;
    this.startPosition()
    this.image.addEventListener('load', () => {
      this.startPosition()
    }, true);
    this.waitTime = 0
    this.cardSrc = animalCardSources[name]
  };
  startPosition() { //generates a random starting position inside the enclosure
    console.log(this.imageSize)
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
    this.imageSize.y = this.image.height / this.image.width * this.imageSize.x; //makes sure this.imageSize is correct
  };
  pickRandomLocation() {
    this.randomLocation = { //picks any random location inside the enclosure
      x: (this.boundPosition.x) + Math.random() * ((this.boundPosition.x + this.boundSize.x - this.collisionSize.x) - this.boundPosition.x),
      y: (this.boundPosition.y) + Math.random() * ((this.boundPosition.y + this.boundSize.y - this.collisionSize.y) - this.boundPosition.y)
    };
  };
  moveTowardsLocation() {
    this.velocity = { //move 1/20 of the way to the random location
      x: (0.05 * this.movementVector.x),
      y: (0.05 * this.movementVector.y)
    }
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  };
  detectMovement(deltaTime) {
    if (this.waitTime > 0) {
      this.waitTime -= 1 //count down wait time if its not 0
    } else {
      console.log("--------------")
      console.log("position: ", this.position)
      console.log("random location: ", this.randomLocation)
      if (Math.floor(10 * this.position.x) === Math.floor(10 * this.randomLocation.x) && Math.floor(10 * this.position.y) === Math.floor(10 * this.randomLocation.y)) { //if this position is the random position
        this.pickRandomLocation(); //create new location
        this.waitTime = Math.floor(Math.random() * 100) //wait for a period
        this.movementVector = {
          x: this.randomLocation.x - this.position.x,
          y: this.randomLocation.y - this.position.y
        }
      };
      this.moveTowardsLocation(); //move towards random location
    }
  };
};