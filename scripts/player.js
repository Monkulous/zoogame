import { Entity } from "./entities.js";
import { mousePos, pressedKeys } from "./input.js";
import { canvas, ctx } from "./main.js";

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

class Player extends Entity {
  constructor(position, images, imageSize, collisionSize) {
    super("player", images, position, imageSize, collisionSize);
    this.movementSpeed = 200
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
      this.velocity.x *= 1.5;
      this.velocity.y *= 1.5;
    };

    let letters = ""
    pressedKeys.forEach((letter) => {
      letters += letter
    })
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(letters, this.position.x + player.imageSize.x / 2, this.position.y, 300);

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  };
};

export const player = new Player({ x: 0, y: 0 }, playerImages, { x: 70, y: null }, { x: 35, y: 30 });