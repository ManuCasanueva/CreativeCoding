const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");

const settings = {
  dimensions: [1080, 2400],
  animate: true,
};

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  getDistance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Agent {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1)); // Valores de velocidad mayores para un movimiento más rápido

    this.radius = random.range(10, 25);
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  bounce(width, height) {
    if (this.pos.x <= 0 || this.pos.x >= width) this.vel.x *= -1;
    if (this.pos.y <= 0 || this.pos.y >= height) this.vel.y *= -1;
  }

  draw(context) {
    context.save();
    context.translate(this.pos.x, this.pos.y);

    // Crear un degradado radial para simular luz
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
gradient.addColorStop(0, 'rgba(0, 128, 128, 1)'); // Cyan oscuro
// Cyan intermedio
gradient.addColorStop(1, 'rgba(0, 255, 255, 1)'); // Cyan claro

context.fillStyle = gradient;



    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}

const sketch = ({ context, width, height }) => {
  const agents = [];

  for (let i = 0; i < 100; i++) {
    const x = random.range(0, width);
    const y = random.range(0, height);

    agents.push(new Agent(x, y));
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j];

        const dist = agent.pos.getDistance(other.pos);

        if (dist > 200) continue;

        const opacity = math.mapRange(dist, 0, 200, 1, 0); // Opacidad basada en la distancia
        const lineWidth = math.mapRange(dist, 0, 200, 5, 1); // Grosor de línea basado en la distancia

        context.strokeStyle = `rgba(0, 0, 255, ${opacity})`;
 // Línea roja con opacidad variable
        context.lineWidth = lineWidth;
        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.stroke();
      }

      agent.update();
      agent.draw(context);
      agent.bounce(width, height);
    }
  };
};

canvasSketch(sketch, settings);

