const canvasSketch = require('canvas-sketch');
const { random } = require('canvas-sketch-util');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  duration: 4,
  fps: 24,
  context: '2d',
};

const num = 1000;
const particles = [];
const noiseScale = 0.01 / 2;

const sketch = ({ width, height }) => {
  for (let i = 0; i < num; i++) {
    particles.push({
      x: random.range(0, width),
      y: random.range(0, height),
    });
  }

  return ({ context, width, height, playhead }) => {
    context.clearRect(0, 0, width, height);

    for (let i = 0; i < num; i++) {
      const particle = particles[i];
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';
      context.beginPath();
      context.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
      context.fill();

      const noise = random.noise3D(particle.x * noiseScale, particle.y * noiseScale, playhead * noiseScale * noiseScale);
      const angle = Math.PI * 2 * noise;

      particle.x += Math.cos(angle);
      particle.y += Math.sin(angle);

      if (!onScreen(particle.x, particle.y, width, height)) {
        particle.x = random.range(0, width);
        particle.y = random.range(0, height);
      }
    }
  };
};

function onScreen(x, y, width, height) {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

canvasSketch(sketch, settings);
