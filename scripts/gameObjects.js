export class GameObject {
  constructor(name, image, position, imageSize, collisionSize) {
    this.name = name;
    this.image = image;
    this.position = position;
    this.imageSize = imageSize;
    this.collisionSize = collisionSize;
    this.drawOpacity = 1;
    this.adjustImageSize();
  };
  update(ctx) {
    this.draw(ctx);
  };
  draw(ctx) { //draws the image, with the image height always being proportional to the width
    ctx.globalAlpha = this.drawOpacity;
    ctx.drawImage(this.image, this.position.x, this.position.y, this.imageSize.x, this.imageSize.y);
    ctx.globalAlpha = 1;
    /*
    //draw collision boxes
    let collisionPosition = {
      x: this.position.x + (this.imageSize.x - this.collisionSize.x) / 2,
      y: this.position.y + this.imageSize.y - this.collisionSize.y
    }
    ctx.fillRect(collisionPosition.x, collisionPosition.y, this.collisionSize.x, this.collisionSize.y)
    */
  };
  adjustImageSize() {
    this.image.addEventListener('load', () => {
      this.imageSize.y = this.image.height / this.image.width * this.imageSize.x; //always proportional to width
    }, true);
  };
  get collisionPosition() {
    return {
      x: this.position.x + 0.5 * (this.imageSize.x - this.collisionSize.x),
      y: this.position.y + this.imageSize.y - this.collisionSize.y
    };
  };
};