const canvasSketch = require("canvas-sketch");
const Random = require("canvas-sketch-util/random");
const { linspace } = require("canvas-sketch-util/math");
const palettes = require("nice-color-palettes");

Random.setSeed(Random.getRandomSeed());

console.log("Random Seed:", Random.getSeed());

const settings = {
  animate: true,
  duration: 100,
  dimensions: [1080, 1080],
  fps: 60,
  suffix: Random.getSeed(),
  orientation: "portrait",
  pixelsPerInch: 300
};

const sketch = ({ width, height }) => {
  const pageSize = Math.min(width, height);

  const margin = pageSize * 0.15;
  const gridSize = 105;
  const background = "black";

  const cells = linspace(gridSize, true)
    .map(v => linspace(gridSize, true).map(u => [u, v]))
    .flat();

  const colorPalette = palettes[Math.floor(Math.random() * palettes.length)];
  const cellColors = cells.map((_, index) => colorPalette[index % colorPalette.length]);

  return ({ context, playhead }) => {
    context.fillStyle = background;
    context.globalAlpha = 1;
    context.fillRect(0, 0, width, height);

    const innerSize = pageSize - margin * 1;
    cells.forEach((cell, index) => {
      const [u, v] = cell;

      let x = u * innerSize + (width - innerSize) / 2;
      let y = v * innerSize + (height - innerSize) / 2;

      context.strokeStyle = cellColors[index];

      const frequency = 1;
      const n = Random.noise2D(u * 1 + 6, v * 1 - 4, frequency + playhead * 1.2);
      const angle = n * Math.PI * 5.8;
      const length = pageSize * 0.08;
      const lineWidth = pageSize * 0.004;
      segment(context, x, y, angle, length, lineWidth);
    });
  };
};

function segment(context, x, y, angle = 0, length = 1, lineWidth = 1) {
  const halfLength = length / 9;
  const u = Math.cos(angle) * halfLength;
  const v = Math.sin(angle) * halfLength;

  context.beginPath();
  context.moveTo(x - u, y - v);
  context.lineTo(x + u, y + v);
  context.lineWidth = lineWidth;
  context.stroke();
}

canvasSketch(sketch, settings);
