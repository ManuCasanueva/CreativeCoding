const canvasSketch = require('canvas-sketch');
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const Color = require("canvas-sketch-util/color");
const risoColors = require("riso-colors");

const seed = random.getRandomSeed();

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const sketch = ({ context, width, height }) => {
  random.setSeed(seed);

  let x, y, w, h, fill, stroke, blend;

  const num = 30;
  const degrees = 30;

  const rects = [];

  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors),
  ];
  
  const bgColor = random.pick(risoColors).hex;

  const mask = {
    radius: width * 0.4,
    sides: 7,
    x: width * 0.5,
    y: height * 0.50
  };

  for (let i = 0; i < num; i++) {
    x = random.range(-width * 0.5, width * 1.5); // Generar x entre -width/2 y width*1.5
    y = random.range(-height * 0.5, height * 1.5); // Generar y entre -height/2 y height*1.5
    w = random.range(600, width);
    h = random.range(40, 200);

    fill = random.pick(rectColors).hex;
    stroke = random.pick(rectColors).hex;

    blend = (random.value() > 0.5) ? "overlay" : "source-over";

    rects.push({ x, y, w, h, fill, stroke, blend });
  }

  function updateRects() {
    const speed = 1; // Velocidad de movimiento
  
    rects.forEach(rect => {
      // Actualizar la posición X para mover hacia la izquierda
      rect.x -= speed; // Restar a la posición X para mover a la izquierda
      // Actualizar la posición Y para mover hacia arriba
      rect.y -= speed; // Restar a la posición Y para mover hacia arriba
  
      // Si el rectángulo se mueve más allá del borde izquierdo o superior, reinicia su posición
      if (rect.x < -rect.w || rect.y < -rect.h) {
        rect.x = width + random.range(0, 100); // Reinicia la posición en el lado derecho del lienzo
        rect.y = height + random.range(0, 100); // Reinicia la posición en la parte inferior del lienzo
      }
  
      // Comprobar superposición con otros rectángulos
      rects.forEach(otherRect => {
        if (otherRect !== rect) {
          const minDistance = 100;
          if (
            Math.abs(rect.x - otherRect.x) < minDistance &&
            Math.abs(rect.y - otherRect.y) < minDistance
          ) {
            rect.x += minDistance * 2;
            rect.y += minDistance * 2;
          }
        }
      });
    });
  }
  
  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    context.save();

    context.translate(mask.x, mask.y);
    drawPolygon({ context, radius: mask.radius, sides: mask.sides });
    context.clip();

    rects.forEach(rect => {
      const { x, y, w, h, fill, stroke, blend } = rect;
      let shadowColor;

      context.save();
      context.translate(-mask.x, -mask.y);
      context.translate(x, y);
      context.strokeStyle = stroke;
      context.fillStyle = fill;
      context.lineWidth = 5;

      context.globalCompositeOperation = blend;

      drawRect({ context, w, h, degrees });

      shadowColor = "rgba(0, 0, 0, 0.5)"; // Color de sombra negro difuminado
      context.shadowColor = shadowColor;
      context.shadowOffsetX = 10; // Offset X de la sombra
      context.shadowOffsetY = 10; // Offset Y de la sombra
      context.shadowBlur = 20; // Difuminado de la sombra
      context.fill();

      context.shadowColor = null;
      context.stroke();

      context.globalCompositeOperation = "source-over";

      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.stroke();

      context.restore();
    });

    context.restore();

    context.save();
    context.translate(mask.x, mask.y);
    context.lineWidth = 11;

    drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides });

    context.globalCompositeOperation = "color-burn";
    context.strokeStyle = rectColors[0].hex;
    context.stroke();

    context.restore();

    // Actualizar las posiciones de los rectángulos en cada fotograma
    updateRects();
  };
};

const drawRect = ({ context, w = 600, h = 200, degrees = -45 }) => {
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;

  context.save();
  context.translate(rx * -0.5, (ry + h) * -0.5);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + h);
  context.lineTo(0, h);
  context.closePath();
  context.stroke();
  context.restore();
};

const drawPolygon = ({ context, radius = 100, sides = 3 }) => {
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for (let i = 1; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;

    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }
  context.closePath();
};

canvasSketch(sketch, settings);
