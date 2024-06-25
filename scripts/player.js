import { GameObject } from "./gameObjects.js";
import { pressedKeys } from "./input.js";

const playerImageSources = { //list of sources for player images
  left: [
    'images/knightImages/knightLeft0.png',
    'images/knightImages/knightLeft1.png',
    'images/knightImages/knightLeft0.png',
    'images/knightImages/knightLeft2.png'
  ],
  right: [
    'images/knightImages/knightRight0.png',
    'images/knightImages/knightRight1.png',
    'images/knightImages/knightRight0.png',
    'images/knightImages/knightRight2.png'
  ]
};

const playerImages = {};

for (const direction in playerImageSources) {
  playerImages[direction] = [];
  playerImageSources[direction].forEach(source => {
    const image = new Image();
    image.src = source;
    playerImages[direction].push(image);
  });
};

class Player extends GameObject {
  constructor(position, imageSize, collisionSize) {
    super("player", playerImages["left"][0], position, imageSize, collisionSize);
    this.velocity = { x: 0, y: 0 };
    this.movementSpeed = 200;
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
  };
  detectMovement(deltaTime) {
    this.velocity = { x: 0, y: 0 };
    if ((pressedKeys.includes("w") || pressedKeys.includes("arrowup")) && this.isColliding.up === false) {
      this.velocity.y -= 1;
    } if ((pressedKeys.includes("a") || pressedKeys.includes("arrowleft")) && this.isColliding.left === false) {
      this.velocity.x -= 1;
    } if ((pressedKeys.includes("s") || pressedKeys.includes("arrowdown")) && this.isColliding.down === false) {
      this.velocity.y += 1;
    } if ((pressedKeys.includes("d") || pressedKeys.includes("arrowright")) && this.isColliding.right === false) {
      this.velocity.x += 1;
    };

    const magnitude = Math.sqrt((this.velocity.x ** 2) + (this.velocity.y ** 2));

    if (magnitude !== 0) {
      this.velocity.x *= deltaTime * this.movementSpeed / magnitude;
      this.velocity.y *= deltaTime * this.movementSpeed / magnitude;
    };

    if (pressedKeys.includes("shift")) {
      this.velocity.x *= 100;
      this.velocity.y *= 100;
    };

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
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
      image = playerImages[this.movementDirection][0];
      this.animationIndex = 0;
    } else if (this.movementType === "walking") {
      const currentTime = Date.now();
      if (currentTime - this.lastAnimationTime > 130) {
        this.animationIndex = (this.animationIndex >= playerImages[this.movementDirection].length - 1) ? 0 : this.animationIndex + 1;
        image = playerImages[this.movementDirection][this.animationIndex];
        this.lastAnimationTime = currentTime;
      } else {
        image = playerImages[this.movementDirection][this.animationIndex];
      };
    };
    this.image = image;
  };
};

export const player = new Player({ x: 0, y: 0 }, { x: 70, y: null }, { x: 35, y: 30 });