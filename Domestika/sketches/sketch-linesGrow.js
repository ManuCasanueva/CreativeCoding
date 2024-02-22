const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [800, 800],
  animate: true,
  duration: 10,
  fps: 24,
};

const sketch = ({ context, width, height }) => {
  const cols = 20;
  const rows = 20;
  const grid = [];
  const resolutionX = width / cols;
  const resolutionY = height / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * resolutionX;
      const y = j * resolutionY;
      const angle = Math.random() * Math.PI * 2; // Generate a random angle between 0 and 2 * PI

      grid.push({
        x,
        y,
        angle,
      });
    }
  }

  return ({ context, width, height, playhead }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    grid.forEach(point => {
      const { x, y, angle } = point;

      // Use playhead to modify the angle over time for animation
      const timeAngle = angle + playhead * 2 * Math.PI; // Adjust the multiplier to change the speed of animation

      const x1 = x + Math.cos(timeAngle) * resolutionX * 0.5;
      const y1 = y + Math.sin(timeAngle) * resolutionY * 0.5;

      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x1, y1);
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
