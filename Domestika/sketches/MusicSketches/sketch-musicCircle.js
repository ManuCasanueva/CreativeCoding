const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const eases = require("eases");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let audio;
let audioContext, audioData, sourceNode, analyserNode;
let manager;
let minDb, maxDb;

const sketch = () => {
  const colors = [
    'rgba(255, 99, 71, 0.8)',    // Rojo tomate
    'rgba(255, 165, 0, 0.8)',    // Naranja
    'rgba(255, 215, 0, 0.8)',    // Amarillo
    'rgba(255, 255, 255, 0.8)',  // Blanco
  ];

  const numCircles = 7;
  const numSlices = 1;
  const slice = (Math.PI * 2) / numSlices;
  const radius = 100;

  const bins = [];
  const lineWidths = [];
  const rotationOffsets = [];

  let lineWidth, bin, mapped, phi;

  for (let i = 0; i < numCircles * numSlices; i++) {
    bin = random.rangeFloor(4, 64);
    bins.push(bin);
  }

  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * 150 + 5;
    lineWidths.push(lineWidth);
  }

  for (let i = 0; i < numCircles; i++) {
    rotationOffsets.push(
      random.range(Math.PI * -0.25, Math.PI * 0.25) - Math.PI * 0.5
    );
  }

  return ({ context, width, height }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(width * 0.5, height * 0.5);

    let cradius = radius;

    for (let i = 0; i < numCircles; i++) {
      context.save();
      context.rotate(rotationOffsets[i]);

      cradius += lineWidths[i] * 0.5 + 2;

      // Asignar un color de la paleta a cada círculo
      const colorIndex = i % colors.length; // Obtener el índice del color basado en el número de círculos
      context.strokeStyle = colors[colorIndex];

      for (let j = 0; j < numSlices; j++) {
        context.rotate(slice);
        context.lineWidth = lineWidths[i];

        bin = bins[i * numSlices + j];
        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
        phi = slice * mapped;

        context.beginPath();
        context.arc(0, 0, cradius, 0, phi);
        context.stroke();
      }

      cradius += lineWidths[i] * 0.5;
      context.restore();
    }

    context.restore();
  };
};

const addListeners = () => {
  let timeoutId; // Variable para almacenar el ID del timeout

  window.addEventListener("mouseup", () => {
    if (!audioContext) createAudio();

    // Cancelar el timeout existente si hay un clic rápido
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Iniciar la música después de 2 segundos
    timeoutId = setTimeout(() => {
      if (audio.paused) {
        audio.play();
        manager.play();
      } else {
        audio.pause();
        manager.pause();
      }
    }, 2000); // 2000 milisegundos = 2 segundos
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

  // console.log(audioData.length);
};

const getAverage = (data) => {
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }

  return sum / data.length;
};

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();
