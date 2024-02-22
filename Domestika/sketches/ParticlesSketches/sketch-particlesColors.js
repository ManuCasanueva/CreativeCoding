const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const eases = require("eases");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const particles = [];

let elCanvas;
let cursor = { x: 0, y: 0 }; // Define la variable cursor aquí

const colorPalette = palettes[Math.floor(random.range(0, palettes.length))];
const sketch = ({ width, height, canvas }) => {
  let x, y, particle, radius;
  let pos = [];

  const numCircles = 21;
  const gapCircle = -29;
  const gapDot = 1;
  let dotRadius = 7;
  let cirRadius = 0;
  const fitRadius = dotRadius;

  elCanvas = canvas;
  canvas.addEventListener("mousedown", onMouseDown);

  for (let i = 0; i < numCircles; i++) {
    const circunference = Math.PI * 2 * cirRadius - 3;
    let numFit = 10;

    if (cirRadius < width * 0.1) {
      numFit = i ? Math.floor(circunference / (fitRadius * 2 + gapDot)) : 1;
    } else {
      numFit = i ? Math.floor(circunference / (fitRadius * 2 + gapDot)) : 1;
    }

    const fitSlice = Math.PI * 2 / numFit;

    for (let j = 0; j < numFit; j++) {
      const theta = fitSlice * j;

      x = Math.cos(theta) * cirRadius;
      y = Math.sin(theta) * cirRadius;

      x += width * 0.5;
      y += height * 0.5;

      radius = dotRadius;

      particle = new Particle({
        x,
        y,
        radius,
        color: colorPalette[Math.floor(random.range(0, colorPalette.length))],
      });
      particles.push(particle);
    }

    cirRadius += fitRadius * 8 + gapCircle - 1;
    dotRadius = (1-eases.quadOut(i / numCircles)) * fitRadius
  }

  return ({ context, width, height, playhead }) => {
    const time = playhead * 5000;
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      const maxOrder = particles.length - 1;
      const order = index / maxOrder;
      const currentCircle = Math.floor(order * numCircles) + 1;
      const animationTime = time % 5000;

      const circleScale = currentCircle + (animationTime / 5000);
      particle.radiusScale = Math.min(circleScale, numCircles);

      particle.update();
      particle.draw(context);
    });
  };
};

const onMouseDown = (e) => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  onMouseMove(e);
};

const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;
  cursor.x = x;
  cursor.y = y;
};

const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
  cursor.x = 9999;
  cursor.y = 9999;
};

canvasSketch(sketch, settings);

class Particle {
  constructor({ x, y, radius = 20, color }) {
    this.x = x;
    this.y = y;
    this.ax = 0;
    this.ay = 0;
    this.vx = 0;
    this.vy = 0;
    this.ix = x;
    this.iy = y;
    this.radius = radius;
    this.scale = 10;
    this.color = color;
    this.minDist = random.range(100, 200);
    this.pushFactor = random.range(0.01, 0.2);
    this.pullFactor = random.range(0.002, 0.006);
    this.dampFactor = random.range(0.9, 0.95);
    this.initialRadius = 10;
    this.radiusScale = 10;
    this.radiusSpeed = random.range(0.002, 0.007);
    this.maxScale = 6;
  }

  update() {
    let dx, dy, dd, distDelta;

    dx = this.ix - this.x;
    dy = this.iy - this.y;
    dd = Math.sqrt(dx * dx + dy * dy);
    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;
    this.scale = math.mapRange(dd, 0, 100, 1, 2);
    dx = this.x - cursor.x;
    dy = this.y - cursor.y;
    dd = Math.sqrt(dx * dx + dy * dy);
    distDelta = this.minDist - dd;

    if (dd < this.minDist) {
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
    }

    this.ax += 0.001;
    this.vx += this.ax;
    this.vy += this.ay;
    this.vx *= this.dampFactor;
    this.vy *= this.dampFactor;
    this.x += this.vx;
    this.y += this.vy;
    this.radiusScale = Math.abs(Math.sin(Date.now() * this.radiusSpeed * 0.2));
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.color;
    context.beginPath();
    const currentRadius = this.initialRadius * this.scale * 0.78 * this.radiusScale;

    context.arc(0, 0, currentRadius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}
