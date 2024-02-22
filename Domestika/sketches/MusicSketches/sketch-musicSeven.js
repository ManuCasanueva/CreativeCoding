const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const eases = require("eases");
const palettes = require('nice-color-palettes');

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

let audio;
let audioContext, audioData, sourceNode, analyserNode;
let manager;
let minDb, maxDb;

const colorPalette = palettes[random.rangeFloor(0, palettes.length)];

const sketch = () => {
  const colors = colorPalette.slice(0);

  const numLines = 8;
  const numSegments = 5;
  const segmentAngle = Math.PI * 2 / numSegments;
  const lineLength = 200;

  const bins = [];
  const lineThicknesses = [];

  let lineThickness, bin, mapped;

  for (let i = 0; i < numLines * numSegments; i++) {
    bin = random.rangeFloor(4, 64);
    if (random.value() > 0.8) bin = 0;
    bins.push(bin);
  }

  for (let i = 0; i < numLines; i++) {
    const t = i / (numLines - 1);
    lineThickness = eases.quadOut(t) * 10 + 10;
    lineThicknesses.push(lineThickness);
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(width * 0.5, height * 0.5);

    for (let i = 0; i < numLines; i++) {
      context.save();
      context.rotate((Math.PI * 2 / numLines) * i);

      for (let j = 0; j < numSegments; j++) {
        context.rotate(segmentAngle);
        context.lineWidth = lineThicknesses[i];

        bin = bins[i * numSegments + j];
        if (!bin) continue;

        mapped = Math.abs(audioData[bin]) / 128; // Normalize the audio data

        lineThickness = lineThicknesses[i] * mapped;
        if (lineThickness < 0.1) continue;

        const colorIndex = i % colors.length;
        context.strokeStyle = colors[colorIndex];

        context.lineWidth = lineThickness;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(lineLength, 0);
        context.stroke();
      }

      context.restore();
    }

    context.restore();
  };
};

const addListeners = () => {
  window.addEventListener("mouseup", () => {
    if (!audioContext) createAudio();

    if (audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    }
  });
};

const createAudio = () => {
  audio = document.createElement("audio");
  audio.src = "audio/seven.mp3";

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyserNode);

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

  audioData = new Float32Array(analyserNode.frequencyBinCount);
};

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();
