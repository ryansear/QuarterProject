movers = [];
vals = [];
vals2 = [];
mm = 100;
level = 0;
areas = [];
a1 = 0;
var score = 0;
var s;
var a;
var c;
var headMax;
var cl = 40;
var sMax = 5;
var aMax = 5;
var cMax = 5;
vert = [];
x = [];
y = [];
segNum = 33;
segLength = 12;
var head;

for (var i = 0; i < segNum; i++) {
  x.push(i);
  y.push(i);
}

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);
  newMovers();
  newArea();
  s = 0;
  a = 2;
  c = 3;
  headMax = 2;
  mid = createVector(650, 200);
  sepSlider = createSlider(0, 100, 0);
  sepSlider.position(100, 150);
  cohSlider = createSlider(0, 100, 0);
  cohSlider.position(100, 250);
  aliSlider = createSlider(0, 100, 0);
  aliSlider.position(100, 350);
  hSlider = createSlider(0, 100, 20);
  hSlider.position(100, 450)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function newArea() {
  vert[0] = createVector(500, 50);
  vert[1] = createVector(800, 50);
  vert[2] = createVector(800, 350);
  vert[3] = createVector(500, 350);

}

function newMovers() {
  for (i = 0; i < mm; i++) {
    movers[i] = new Boid()
    movers[i].pos = createVector(random(300, 500), random(300));
    movers[i].vel = createVector(random(10), random(10));
    movers[i].acc = createVector(0, 0);
    movers[i].col = color(random(254), random(254), random(254));
    movers[i].r = 10;
    movers[i].maxSpeed = 2;
    movers[i].maxForce = 0.05;
  }
  repeller = new Repeller();
  repeller.pos = createVector(random(300, 500), random(300));
  repeller.r = random(30, 100);
  repeller.col = color(random(255), random(255), random(255));
  repeller.maxForce = 30;

  head = new Ball();
  head.pos = createVector(random(300, 400), random(300));
  head.vel = createVector(random(-5, 5), random(-5, 5));
  head.r = random(10, 30);
  head.col = color(220, 150, 20);
  head.maxSpeed = headMax;
}

function runMovers() {
  for (i = 0; i < mm; i++) {
    movers[i].run();
  }
  repeller.update();
  repeller.render();
  head.bounce();
  head.update();
}

function draw() {
  background(0);
  fill(random(255), random(255), random(255))
  quad(500, 50, 800, 50, 800, 350, 500, 350);
  runMovers();
  dragSegment(0, head.pos.x, head.pos.y, 0);
  for (var i = 0; i < x.length - 1; i++) {
    dragSegment(i + 1, x[i], y[i], i);
  }
  s = map(sepSlider.value(), 0, 100, 0, sMax);
  a = map(aliSlider.value(), 0, 100, 0, aMax);
  c = map(cohSlider.value(), 0, 100, 0, cMax);
  headMax = map(hSlider.value(), 0, 100, 0, 10);
  displayText();
}

function displayText() {
  textSize(24);
  fill(10, 20, 100);
  text("Separation = " + floor(s * 100), 20, 150);
  text("Cohesion = " + cohSlider.value() + "% of " + cMax, 20, 250)
  text("Alignment = " + aliSlider.value() + "% of " + aMax, 20, 350);
  text("Head Max Speed = " + hSlider.value(), 20, 450)
  text("Score = " + score, 20, 550);
}

Mover.prototype.flock = function(movers) {
  var sep = this.separate(movers); // Separation
  var ali = this.align(movers); // Alignment
  var coh = this.cohesion(movers); // Cohesion
  // Use sliders weight these forces
  if (collideCirclePoly(this.pos.x, this.pos.y, this.r, vert, true) === true) {
    sep.mult(s);
    ali.mult(a);
    coh.mult(c);
  } else {
    sep.mult(0);
    ali.mult(0);
    coh.mult(0);
  }
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

Mover.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target, this.pos); // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxSpeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.maxForce); // Limit to maximum steering force
  return steer;
}

Mover.prototype.separate = function(movers) {
  var desiredseparation = 55.0;
  var steer = createVector(0, 0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < movers.length; i++) {
    var d = p5.Vector.dist(this.pos, movers[i].pos);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.pos, movers[i].pos);
      diff.normalize();
      diff.div(d); // Weight by distance
      steer.add(diff);
      count++; // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.vel);
    steer.limit(this.maxForce);
  }
  return steer;
}

Mover.prototype.align = function(movers) {
  var neighbordist = 50;
  var sum = createVector(0, 0);
  var count = 0;
  for (var i = 0; i < movers.length; i++) {
    var d = p5.Vector.dist(this.pos, movers[i].pos);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(movers[i].vel);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);
    var steer = p5.Vector.sub(sum, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

Mover.prototype.cohesion = function(movers) {
  var neighbordist = 50;
  var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < movers.length; i++) {
    var d = p5.Vector.dist(this.pos, movers[i].pos);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(movers[i].pos); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum); // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}

function Mover() {
  this.pos = 0;
  this.vel = 0;
  this.acc = 0;
  this.col = 0;
  this.r = 0;
  this.maxSpeed = 0;
  this.maxForce = 0;
  this.t = 0;
}

Mover.prototype.run = function() {
  this.flock(movers);
  this.update();
  this.checkEdges();
  this.render();
}
Mover.prototype.applyForce = function(force) {
  this.acc.add(force);
}

Mover.prototype.update = function() {
  
  this.atr = new p5.Vector.sub(repeller.pos, this.pos);
  this.atr.normalize();
  this.atr.mult(3);

  this.rpl = new p5.Vector.sub(this.pos, repeller.pos);
  this.rpl.normalize();
  this.rpl.mult(3);
if(mouseIsPressed === false){
  if (this.pos.dist(repeller.pos) < 100) {
    this.applyForce(this.rpl);
  }
}
if(mouseIsPressed === true){
  if(this.pos.dist(repeller.pos) < 100){
    this.applyForce(this.atr);
  }
}
  this.arr = new p5.Vector.sub(mid, this.pos);
  this.arr.normalize();
  this.arr.mult(3);
  this.arrl = new p5.Vector.sub(this.pos, mid);
  this.arrl.normalize();

  if (collideCirclePoly(this.pos.x, this.pos.y, this.r, vert) === true) {
    this.applyForce(this.arrl);
  }
  if (this.t > 200) {
    this.r *= (1 / this.t);
  }
  if (this.t === 250) {
    score += 1;
    this.pos = createVector(random(300, 500), random(300));
    this.col = color(random(254), random(254), random(254));
    this.r = 10;
    this.t = 0;
  }

  if (collideCirclePoly(this.pos.x, this.pos.y, this.r, vert, true) === true) {
    this.t += 1;
  }

  if (this.pos.dist(head.pos) < 5) {
    score -= 2;
    this.r = 0.0001;
    this.t = 250;
    
  }

  this.vel.add(this.acc);
  this.vel.limit(this.maxSpeed);
  this.pos.add(this.vel);
  this.acc.mult(0);
}

Mover.prototype.checkEdges = function() {
  if (this.pos.x > width) {
    this.pos.x = 300;
  } else if (this.pos.x < 300) {
    this.pos.x = width;
  }

  if (this.pos.y > height) {
    this.pos.y = 0;
  } else if (this.pos.y < 0) {
    this.pos.y = height;
  }
}

Mover.prototype.render = function() {
  stroke(0);
  fill(this.col);
  ellipse(this.pos.x, this.pos.y, this.r, this.r);
}

Boid.prototype = new Mover();

function Boid() {}

Repeller.prototype = new Mover();

function Repeller() {
  this.update = function() {
    this.pos.x = mouseX;
    this.pos.y = mouseY;
  }
}

Attractor.prototype = new Mover();

function Attractor() {
  this.update = function() {
    this.applyForce = function(force) {
      this.acc.add(force);
    }
    this.rpl = new p5.Vector.sub(this.pos, repeller.pos);
    this.rpl.normalize();
    this.rpl.mult(2);

    if (this.pos.dist(repeller.pos) < 100) {
      this.applyForce(this.rpl);
    }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}

function dragSegment(i, xin, yin, ind) {
  var dx = xin - x[i];
  var dy = yin - y[i];
  var angle = atan2(dy, dx);
  x[i] = xin - cos(angle) * segLength;
  y[i] = yin - sin(angle) * segLength;
  segment(x[i], y[i], angle, ind);
}

function segment(x, y, a, ind) {
  push();
  translate(x, y);
  strokeWeight(15 - (ind / 2));
  fill(255 - 10 * ind, 0, 0, 200 - ind * 10);
  stroke(255, 0, 0, 100);
  rotate(a);
  line(0, 0, segLength, 0);
  pop();
}

Ball.prototype = new Mover();

function Ball() {
  this.update = function() {
    this.brep = new p5.Vector.sub(this.pos, mid);
    this.brep.normalize();
    this.brep.mult(4);
    if (collideCirclePoly(this.pos.x, this.pos.y, this.r, vert) === true) {
      this.vel.add(this.brep);
    }

    for (i = 0; i < movers.length; i++) {
      if (this.pos.dist(movers[i].pos) < 50) {
        this.batt = new p5.Vector.sub(movers[i].pos, this.pos);
        this.batt.normalize();
        this.vel.add(this.batt);
      }

    }
    this.vel.limit(headMax);
    this.pos.add(this.vel);
    
  }

  this.bounce = function() {
    if (this.pos.x > width || this.pos.x < 300) {
      this.vel.x *= -1;
    }

    if (this.pos.y > height || this.pos.y < 0) {
      this.vel.y *= -1;
    }
  }
}