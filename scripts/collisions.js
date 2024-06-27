import { ctx } from "./main.js"
import { GameObject } from "./gameObjects.js";
import { player } from "./player.js";

export function updateAllCollisions(ctx, collisions, player, deltaTime) {
  loadCollisions(collisions["background"], player, false);
  loadCollisions(collisions["temporary"], player, false);
  collisions.temporary = [];
  collisions["foreground"].forEach((collision) => {
    if ((collision.position.y + collision.imageSize.y - collision.collisionSize.y) < (player.position.y + player.imageSize.y)) {
      collision.update(ctx, player, true);
    };
  });
  player.draw(ctx);
  collisions["foreground"].forEach((collision) => {
    if ((collision.position.y + collision.imageSize.y - collision.collisionSize.y) >= (player.position.y + player.imageSize.y)) {
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


export class Collision extends GameObject {
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

      // Check if there's overlap and handle collisions
      if (overlapX >= 0 && overlapY >= 0) {
        // Determine collision direction
        if (overlapX < overlapY) {
          // Colliding left or right
          if (otherCollisionPosition.x < this.collisionPosition.x) {
            otherCollisionPosition.x = this.collisionPosition.x - other.collisionSize.x;
            other.isColliding.right = true;
          } else {
            otherCollisionPosition.x = this.collisionPosition.x + this.collisionSize.x;
            other.isColliding.left = true;
          };
        } else {
          // Colliding top or bottom
          if (otherCollisionPosition.y < this.collisionPosition.y) {
            other.position.y = this.collisionPosition.y - other.imageSize.y
            other.isColliding.down = true;
          } else {
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