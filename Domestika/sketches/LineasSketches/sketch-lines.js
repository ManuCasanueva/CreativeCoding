const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const colormap = require('colormap');

const settings = {
  duration: 5, // Establecer la duración deseada en segundos
  dimensions: [1080, 2400],
  fps: 30, // Reducir el número de fotogramas por segundo
  playbackRate: 1, // Mantener una reproducción normal
  animate: true,
};

// Resto del código del sketch...


const colors = colormap({
  colormap: 'greys',
  nshades: 10, // Definir la cantidad de colores que quieres usar
  format: 'hex',
});

// Start the sketch
canvasSketch(({ update }) => {
  return ({ context, frame, width, height, playhead }) => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const gridSize = 50;
    const padding = width * -0.1;
    const tileSize = (width - padding * 2) / gridSize;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const u = gridSize <= 1 ? 0.5 : x / (gridSize - 2);
        const v = gridSize <= 1 ? 0.5 : y / (gridSize - 2);

        const tx = lerp(padding, width - padding, u);
        const ty = lerp(padding, height - padding, v);

        const offset = u * -1 + v * 20;
        const t = (playhead + offset) % 1;
        let mod = Math.sin(t * Math.PI);
        mod = Math.pow(mod, 3);

        const length = tileSize * 2
        const thickness = tileSize * 2;
        const initialRotation = Math.PI * 2
        const rotation = initialRotation + mod * Math.PI;

        // Obtener un índice de color basado en la posición
        const colorIndex = Math.floor(Math.abs(mod) * (colors.length - 2));
        context.fillStyle = colors[colorIndex];
        

        draw(context, tx, ty, length, thickness, rotation);
      }
    }
  };

  function draw(context, x, y, length, thickness, rotation) {
    context.save();
    // No necesitas establecer el color aquí, se define en la iteración del bucle principal
    context.translate(x, y);
    context.rotate(rotation);
    context.translate(-x, -y);

    context.fillRect(x - length / 2, y - thickness / 2, length, thickness);
    context.restore();
  }
}, settings);
