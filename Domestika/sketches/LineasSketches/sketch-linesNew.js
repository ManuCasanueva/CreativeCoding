const canvasSketch = require('canvas-sketch');
const convexHull = require('convex-hull');
const cameraProject = require('camera-project');
const createCamera = require('perspective-camera');
const { mat4, vec3 } = require('gl-matrix');
const BezierEasing = require('bezier-easing');
const Random = require('canvas-sketch-util/random');
const colormap = require('colormap');

const settings = {
  duration: 8,
  animate: true,
  playbackRate: 'throttle',
  fps: 90,
  dimensions: [1080, 1080]
};

const createMesh = () => {
  const pointCount = 1000;
  const radius = 1;
  const positions = Array.from(new Array(pointCount)).map(() => {
    return Random.onSphere(radius);
  });

  const centroid = positions.reduce((sum, pos) => {
    return vec3.add(sum, sum, pos);
  }, [0, 0, 0]);
  if (positions.length >= 1) {
    vec3.scale(centroid, centroid, 1 / positions.length);
  }

  positions.forEach(pos => {
    vec3.sub(pos, pos, centroid);
  });

  const cells = convexHull(positions);
  return { cells, positions };
};

const drawSolidMesh = (context, positions, cells, colors) => {
  cells.forEach((cell, index) => {
    const color = colors[index]; // Usar un color del colormap para esta cara

    context.fillStyle = color;
    context.beginPath();
    cell.forEach((index, i) => {
      const position = positions[index];
      const [x, y] = position;
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.closePath();
    context.fill();
  });
};

const sketch = async ({ width, height }) => {
  Random.setSeed(1);

  const camera = createCamera({
    fov: 80 * Math.PI / 180,
    near: 0.01,
    far: 1000,
    viewport: [0, 0, width, height]
  });

  const { positions, cells } = createMesh();

  const easeA = new BezierEasing(0.20, 0.8, 0.9, 0.90);
  const easeB = new BezierEasing(0.20, 0.8, 0.9, 0.90);

  // Obtener un colormap de 'n' colores
  const colors = colormap({
    colormap: 'greys', // Puedes cambiar el colormap aquí (jet, viridis, etc.)
    nshades: cells.length,
    format: 'hex',
    alpha: 1
  });

  return ({ context, playhead, width, height }) => {
    context.fillStyle = '#17202A';
    context.fillRect(0, 0, width, height);

    const viewport = [0, 0, width, height];
    camera.viewport = viewport;

    const zOffset = Math.sin(playhead * Math.PI * -2) * 0.3;

    camera.identity();
    camera.translate([0, 0, 2 + zOffset]);
    camera.lookAt([0, 0, 0]);
    camera.update();

    const projection = camera.projection;
    const view = camera.view;
    const model = mat4.identity([]);

    mat4.rotateY(model, model, easeA(playhead) * Math.PI * 2);
    mat4.rotateX(model, model, easeB(playhead) * Math.PI * 2);

    const combined = mat4.identity([]);
    mat4.multiply(combined, view, model);
    mat4.multiply(combined, projection, combined);

    const points = positions.map(position => {
      return cameraProject([], position, viewport, combined);
    });

    context.fillStyle = '#ffffff';
    context.strokeStyle = 'none';
    drawSolidMesh(context, points, cells, colors);
  };
};

canvasSketch(sketch, settings);
