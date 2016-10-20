
function Ball() {
  this.loc = createVector(random(width), random(height));
  this.vel = createVector(random(-5, 5), random(-5, 5));
  this.rad = random(10, 30);
  this.clr = color(220, 150, 20);

  this.run = function() {
    this.move();
    this.bounce();
    this.render();
  }
  this.render = function() {
    //fill(this.clr);
    //ellipse(this.loc.x, this.loc.y, this.rad, this.rad);
  }

  this.bounce = function() {
    if (this.loc.x > width || this.loc.x < 0) {
      this.vel.x *= (-1);
    }

    if (this.loc.y > height || this.loc.y < 0) {
      this.vel.y *= -1;
    }
  }
  if (collideCirclePoly(this.loc.x, this.loc.y, this.rad, vert) === true) {
    this.vel *= -1;
    this.clr = color(255);
  }

  this.move = function() {
    this.loc.add(this.vel);
  }
}