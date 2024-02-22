const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const eases = require('eases');
const palettes = require('nice-color-palettes');

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

const particles = [];
let audioContext, audioData, sourceNode, analyserNode;

const colorPalette = palettes[random.rangeFloor(0, palettes.length)];
const sketch = ({ width, height }) => {
  const particleCount = 500;
  const circleRadius = width * 0.4;

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const x = width / 2 + Math.cos(angle) * circleRadius;
    const y = height / 2 + Math.sin(angle) * circleRadius;

    const color = colorPalette[random.rangeFloor(0, colorPalette.length)];
    particles.push(new Particle({ x, y, color }));
  }

  return ({ context, playhead }) => {
    const time = playhead * 5000;
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    if (audioData) {
      analyserNode.getFloatFrequencyData(audioData);
      const bin = random.rangeFloor(4, 64);
      const mapped = Math.abs(audioData[bin]);

      particles.forEach((particle, index) => {
        const maxOrder = particles.length - 1;
        const order = index / maxOrder;
        const currentCircle = Math.floor(order * 15) + 1;
        const animationTime = time % 5000;

        const circleScale = currentCircle + animationTime / 5000;
        particle.radiusScale = Math.min(circleScale, 15);

        const speed = mapped * 0.05;
        particle.update(speed);
        particle.draw(context);
      });
    }
  };
};

const createAudio = () => {
  const audio = document.createElement('audio');
  audio.src = 'audio/seven.mp3';

  audioContext = new AudioContext();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyserNode);

  audioData = new Float32Array(analyserNode.frequencyBinCount);

  audio.play();
};

canvasSketch(sketch, settings);

class Particle {
  constructor({ x, y, color }) {
    this.x = x;
    this.y = y;
    this.ix = x;
    this.iy = y;
    this.color = color;
    this.radius = 2;
    this.radiusScale = 1;
  }

  update(speed) {
    const dx = this.ix - this.x;
    const dy = this.iy - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
  }

  draw(context) {
    context.fillStyle = this.color;
    context.beginPath();
    const currentRadius = this.radius * this.radiusScale;
    context.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    context.fill();
  }
}

createAudio(); // Inicia el audio
