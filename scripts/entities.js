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
    this.draw(ctx);
    this.detectMovement(deltaTime);
    this.animate()
  };
  animate() {
    this.getMovementType();
    this.getImage();
  };
  getMovementType() {
    //getting movement direction
    if (this.velocity.x != 0) {
      this.movementDirection = this.velocity.x > 0 ? "right" : "left";
    };
    //getting movement type
    this.movementType = (this.velocity.y === 0 && this.velocity.x === 0) ? "idle" : "walking";
  };
  getImage() {
    let image;
    if (this.movementType === "idle") {
      image = this.images[this.movementDirection][0];
      this.animationIndex = 0;
    } else if (this.movementType === "walking") {
      const currentTime = Date.now();
      if (currentTime - this.lastAnimationTime > 130) {
        this.animationIndex = (this.animationIndex >= this.images[this.movementDirection].length - 1) ? 0 : this.animationIndex + 1;
        image = this.images[this.movementDirection][this.animationIndex];
        this.lastAnimationTime = currentTime;
      } else {
        image = this.images[this.movementDirection][this.animationIndex];
      };
    };
    this.image = image;
  };
};

export class Animal extends Entity {
  constructor(name, images, imageSize, collisionSize, enclosure) {
    super(name, images, enclosure.position, imageSize, collisionSize)
    this.owner = enclosure;
    this.happiness = 100;
    this.startPosition()
    this.owner.image.addEventListener('load', () => {
      this.startPosition()
    }, true);
    this.waitTime = 0
  };
  startPosition() {
    let enclosureFenceSize = this.owner.imageSize.x / this.owner.image.height * 14
    this.boundPosition = {
      x: this.owner.collisionPosition.x - this.imageSize.x + this.collisionSize.x,
      y: this.owner.collisionPosition.y - this.imageSize.y + this.collisionSize.y
    };
    this.boundSize = {
      x: this.owner.collisionSize.x,
      y: this.owner.collisionSize.y - enclosureFenceSize
    };
    this.pickRandomLocation()
    this.position = this.randomLocation
  };
  pickRandomLocation() {
    this.randomLocation = {
      x: (this.boundPosition.x) + Math.random() * ((this.boundPosition.x + this.boundSize.x - this.collisionSize.x) - this.boundPosition.x),
      y: (this.boundPosition.y) + Math.random() * ((this.boundPosition.y + this.boundSize.y - this.collisionSize.y) - this.boundPosition.y)
    };
  };
  moveTowardsLocation() {
    this.velocity = {
      x: (0.05 * this.movementVector.x),
      y: (0.05 * this.movementVector.y)
    }
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  };
  detectMovement(deltaTime) {
    if (this.waitTime > 0) {
      this.waitTime -= 1
    } else {
      if (Math.floor(10 * this.position.x) === Math.floor(10 * this.randomLocation.x) && Math.floor(10 * this.position.y) === Math.floor(10 * this.randomLocation.y)) {
        console.log("got therer")
        this.pickRandomLocation();
        this.waitTime = Math.floor(Math.random() * 100)
        this.movementVector = {
          x: this.randomLocation.x - this.position.x,
          y: this.randomLocation.y - this.position.y
        }
      };
      this.moveTowardsLocation();
    }
  };
};