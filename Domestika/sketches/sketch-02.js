const canvasSketch = require('canvas-sketch');
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [1080, 1080]
};

const sketch = () => {
  return ({ context, width, height }) => {
    // Establecer el fondo en negro
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const w = width * 0.01;
    const h = height * 0.1;
    let x, y;

    const num = 30;
    const radius = width * 0.3;

    for (let i = 0; i < num; i++) {
      const slice = math.degToRad(360 / num);
      const angle = slice * i;

      x = cx + radius * Math.sin(angle);
      y = cy + radius * Math.cos(angle);

      context.save();
      context.translate(x, y);
      context.rotate(-angle);
      context.scale(random.range(0.1, 2), random.range(0.2, 0.5));

      // Colores más vivos para los rectángulos exteriores
      context.fillStyle = `hsl(${random.range(0, 360)}, 80%, 60%)`;
      context.beginPath();
      context.rect(-w * 0.5, random.range(0, -h * 0.5), w, h);
      context.fill();
      context.restore();

      context.save();
      context.translate(cx, cy);
      context.rotate(-angle);

      context.lineWidth = random.range(1, 4);

      // Colores más vivos para los círculos exteriores
      context.strokeStyle = `hsl(${random.range(0, 360)}, 80%, 60%)`;
      context.beginPath();
      context.arc(0, 0, radius * random.range(0.7, 1.3), slice * random.range(0, -8), slice * random.range(1, 5));
      context.stroke();

      // Agregar un contorno de círculos más pequeños
      const smallRadius = radius * 0.5;
      const smallcenter = radius * 1.5;
      const numSmallCircles = 1;
      for (let j = 0; j < numSmallCircles; j++) {
        const smallAngle = slice * j;
        const smallX = smallRadius * Math.sin(smallAngle);
        const smallY = smallRadius * Math.cos(smallAngle);

        context.beginPath();
        context.arc(smallX, smallY, random.range(2, 5), 0, Math.PI * 2);
        context.stroke();
      }
      for (let k = 0; k < numSmallCircles; k++) {
        const smallAngle = slice * k;
        const smallX = smallcenter * Math.sin(smallAngle);
        const smallY = smallcenter * Math.cos(smallAngle);

        context.beginPath();
        context.arc(smallX, smallY, random.range(2, 5), 0, Math.PI * 2);
        context.stroke();
      }


      context.restore();
    }
  };
};

canvasSketch(sketch, settings);

