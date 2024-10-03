import { Animal, Entity } from "./entities.js"
import { loadCollisions } from "./collisions.js";
import { zoo, visitors } from "./main.js"

export class Visitor extends Entity {
  constructor(name, images, imageSize, collisionSize, startPositionCoordinates) {
    super(name, images, { x: 0, y: 0 }, imageSize, collisionSize)
    this.startPositionCoordinates = startPositionCoordinates
    this.movementSpeed = 100 * zoo.timeSpeed;
    this.frameInterval = 130 / zoo.timeSpeed //130ms between frames
    this.startPosition()
    this.waitTime = 0
  };
  update(ctx, deltaTime, collisions) {
    this.imageSize.y = 126.55555
    loadCollisions(collisions, this, true)
    this.detectMovement(deltaTime, ctx);
    this.animate()
    this.draw(ctx)
  };
  startPosition() {
    this.position = { x: this.startPositionCoordinates.x, y: this.startPositionCoordinates.y }
    this.pickRandomLocation()
  }
  pickRandomLocation() {
    this.randomLocation = { //picks any random location in a square around the visitor
      x: (this.position.x) + (Math.random() * (400) - 200),
      y: (this.position.y) + (Math.random() * (400) - 200)
    };
  };
  reachedDestination() {
    this.decideMessage()

    this.velocity = { x: 0, y: 0 }
    this.pickRandomLocation(); //create new location
    this.waitTime = Math.floor(Math.random() * 100) + 10 //wait for a period
  }
  detectMovement(deltaTime, ctx) {
    this.movementSpeed = 100 * zoo.timeSpeed //update, so change due to timeSpeed
    this.frameInterval = 130 / zoo.timeSpeed
    if ((zoo.time / 60) % 24 > 16.9) {
      this.randomLocation = { x: this.startPositionCoordinates.x, y: this.startPositionCoordinates.y }
    }
    if (this.waitTime > 0) {
      this.say(ctx)
      this.waitTime -= 1 * zoo.timeSpeed //count down wait time if its not 0
    } else {
      if ((this.isColliding.left || this.isColliding.right | this.isColliding.up | this.isColliding.down)) {
        this.pickRandomLocation()
      }
      this.moveTowardsLocation(deltaTime); //move towards random location
    };
  };
  say(ctx) {
    ctx.font = "20px Silkscreen";
    ctx.fillText(this.message, this.position.x - this.velocity.x + this.imageSize.x / 2, this.position.y - this.velocity.y, 900);
    ctx.font = "30px Silkscreen";
  }
  decideMessage() {
    let randomChance = Math.random()
    if (randomChance > 0.85) {
      if (zoo.numAnimals === 0) {
        this.message = emptyZooVisitorMessages[Math.floor(Math.random() * emptyZooVisitorMessages.length)]
      } else if (zoo.averageHappiness < 40) {
        this.message = negativeVisitorMessages[Math.floor(Math.random() * negativeVisitorMessages.length)]
      } else if (zoo.totalHappiness > 1000) {
        this.message = positiveVisitorMessages[Math.floor(Math.random() * positiveVisitorMessages.length)]
      } else {
        this.message = neutralVisitorMessages[Math.floor(Math.random() * neutralVisitorMessages.length)]
      }
    } else {
      this.message = ""
    }
  }
};

const negativeVisitorMessages = [
  "this zoo is terrible",
  "i hate this zoo",
  "im leaving a bad review",
  "im never coming back here again",
  "i hate these animals",
  "these animals are the worst",
  "i hope this zoo shuts down",
  "i want my money back",
  "these animals look miserable",
  "ive never seen a worse zoo",
  "the enclosures are too small",
  "this zoo is a scam",
  "shut this place down",
  "i hate this place",
  "i need a refund",
  "they need to shut this place down",
  "these animals look so sad"
]

const positiveVisitorMessages = [
  "i love happy animals",
  "i love this zoo",
  "wahoo",
  "best zoo ever",
  "i cant wait to come back",
  "this zoo is great",
  "i love it",
  "im leaving a good review",
  "these animals are so cool"
]

const neutralVisitorMessages = [
  "this zoo is ok",
  "ive seen better zoos",
  "i dont mind this zoo",
  "its aight",
  "i expected more",
  "nothing special",
  "its just okay",
  "decent zoo",
  "not worth the price"
]

const emptyZooVisitorMessages = [
  "this isnt even a zoo",
  "where are the animals",
  "why are there no animals",
  "im leaving a bad review",
  "i want my money back",
  "this is false advertising",
  "where did all the animals go",
  "this zoo is a scam",
  "is this a joke",
  "this is sad",
  "i need a refund"
]

export function addVisitor(numVisitors, position) {
  const visitorImageSources = { //list of sources for player images
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

  const visitorImages = {};

  for (const direction in visitorImageSources) {
    visitorImages[direction] = [];
    visitorImageSources[direction].forEach(source => {
      const image = new Image();
      image.src = source;
      visitorImages[direction].push(image);
    });
  };

  for (let i = 0; i < numVisitors; i++) {
    let visitor = new Visitor("visitor", visitorImages, { x: 70, y: 120.55555 }, { x: 35, y: 30 }, position)
    visitors.push(visitor)
  }
}