const canvasSketch = require("canvas-sketch");
const Random = require("canvas-sketch-util/random");
const { linspace } = require("canvas-sketch-util/math");
const palettes = require("nice-color-palettes");

Random.setSeed(Random.getRandomSeed());

console.log("Random Seed:", Random.getSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: "letter",
  orientation: "portrait",
  pixelsPerInch: 300
};

const sketch = ({ width, height }) => {
  const pageSize = Math.min(width, height);

  const margin = pageSize * 0.15;
  const gridSize = 50;
  const background = "hsl(0, 0%, 5%)";

  const cells = linspace(gridSize, true)
    .map(v => linspace(gridSize, true).map(u => [u, v]))
    .flat();

  const colorPalette = palettes[Math.floor(Random.range(0, palettes.length))];

  const segmentCount = 66; // Número de segmentos en cada línea
  const frequency = 0.5; // Frecuencia para el ruido

  let frame = 10; // Variable para la animación

  return ({ context }) => {
    context.fillStyle = background;
    context.globalAlpha = 1;
    context.fillRect(0, 0, width, height);

    frame++; // Incrementar el frame en cada renderizado

    const innerSize = pageSize - margin * 1;
    cells.forEach(cell => {
      const [u, v] = cell;

      let x = u * innerSize + (width - innerSize) / 2;
      let y = v * innerSize + (height - innerSize) / 2;

      for (let i = 0; i < segmentCount; i++) {
        context.strokeStyle = colorPalette[Math.floor(Random.range(0, colorPalette.length))];
        const n = Random.noise2D(u * 2 - 1, v * 2 - 8, frequency + i * 0.1); // Cambia la frecuencia con base en el índice para cada segmento
        const angle = n * Math.PI * 2 * (frame * 0.01); // Usar el frame para animar los palos
        const length = pageSize * 0.1;
        const lineWidth = pageSize * 0.00175;
        segment(context, x, y, angle, length, lineWidth);
        x += Math.cos(angle) * (length / 6); // Actualiza las coordenadas para el próximo segmento
        y += Math.sin(angle) * (length / 6);
      }
    });
  };
};

function segment(context, x, y, angle = 0, length = 1, lineWidth = 1) {
  const halfLength = length / 6;
  const u = Math.cos(angle) * halfLength;
  const v = Math.sin(angle) * halfLength;

  context.beginPath();
  context.moveTo(x - u, y - v);
  context.lineTo(x + u, y + v);
  context.lineWidth = lineWidth;
  context.stroke();
}

canvasSketch(sketch, settings);
