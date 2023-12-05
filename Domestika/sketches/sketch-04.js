// Importar bibliotecas
const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

// Configuración del lienzo
const settings = {
  dimensions: [1080, 2400],
  animate: true
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  freq: 0.001,
  amp: 0.2,
  animate: true,
  frame: 0,
  lineCap: 'butt',
  background: '#FFFFFF', // Color por defecto del fondo del canvas (blanco)
  shape: 'square',
  elementColor: '#000000' // Color por defecto de los elementos generados (negro)
};

// Función principal del sketch
const sketch = () => {
  // Crear una instancia de Tweakpane
  const pane = createPane();

  return ({ context, width, height, frame }) => {
    context.fillStyle = params.background;
    context.fillRect(0, 0, width, height);

    const cols = params.cols;
    const rows = params.rows;
    const numCells = cols * rows;

    const gridW = width * 0.8;
    const gridH = height * 0.8;
    const cellW = gridW / cols;
    const cellH = gridH / rows;
    const margX = (width - gridW) * 0.5;
    const margY = (height - gridH) * 0.5;

    context.strokeStyle = params.elementColor; // Establecer el color de los elementos generados

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cellW;
      const y = row * cellH;
      const w = cellW * 0.8;

      const f = params.animate ? frame : params.frame;

      const n = random.noise3D(x, y, f * 10, params.freq);
      const angle = n * Math.PI * params.amp;

      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax, 30);

      context.save();

      context.translate(x + margX + cellW * 0.5, y + margY + cellH * 0.5);
      context.rotate(angle);

      context.lineWidth = scale;
      context.lineCap = params.lineCap;

      if (params.shape === 'circle') {
        context.beginPath();
        context.arc(0, 0, w * 0.5, 0, Math.PI * 2);
        context.stroke();
      } else {
        context.beginPath();
        context.moveTo(w * -0.5, 0);
        context.lineTo(w * 0.5, 0);
        context.stroke();
      }

      context.restore();
    }
  };
};

// Función para crear una instancia de Tweakpane
const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: 'Grid' });
  folder.addInput(params, 'lineCap', { options: { butt: 'butt', round: 'round', square: 'square' } });
  folder.addInput(params, 'cols', { min: 2, max: 50, step: 1 });
  folder.addInput(params, 'rows', { min: 2, max: 50, step: 1 });
  folder.addInput(params, 'scaleMin', { min: 1, max: 100, step: 1 });
  folder.addInput(params, 'scaleMax', { min: 1, max: 100, step: 1 });

  folder = pane.addFolder({ title: 'Noise' });
  folder.addInput(params, 'freq', { min: -0.01, max: 0.01 });
  folder.addInput(params, 'amp', { min: 0, max: 1 });
  folder.addInput(params, 'animate');
  folder.addInput(params, 'frame', { min: 0, max: 999 });

  folder = pane.addFolder({ title: 'Appearance' });
  folder.addInput(params, 'background', { label: 'Canvas Background', expanded: true, type: 'color' });
  folder.addInput(params, 'shape', { options: { square: 'Square', circle: 'Circle' } });
  folder.addInput(params, 'elementColor', { label: 'Element Color', type: 'color' });

  return pane;
};

// Ejecutar la función para crear el panel
createPane();

// Crear y ejecutar el sketch
canvasSketch(sketch, settings);
