const cat = document.querySelector('.cat');
const button = document.querySelector('#toggle-button');
const spotlight = document.querySelector('.spotlight');

let chasing = false;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let purrNodes = null;

const engageSprint = () => {
  cat.classList.add('fast');
  button.textContent = 'Glide Mode';
  chasing = true;
  spotlight.style.transform = 'translate(-50%, -50%) scale(1.2)';
  startPurr();
};

const disengageSprint = () => {
  cat.classList.remove('fast');
  button.textContent = 'Start Sprint';
  chasing = false;
  spotlight.style.transform = 'translate(-50%, -50%) scale(1)';
  stopPurr();
};

const toggleSprint = () => {
  if (chasing) {
    disengageSprint();
  } else {
    engageSprint();
  }
};

const startPurr = () => {
  if (purrNodes) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const baseGain = audioContext.createGain();
  const tremolo = audioContext.createOscillator();
  const tremoloGain = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = 38;

  tremolo.frequency.value = 7;
  tremolo.type = 'sine';

  baseGain.gain.value = 0;
  tremoloGain.gain.value = 0.2;

  tremolo.connect(tremoloGain);
  tremoloGain.connect(baseGain.gain);

  oscillator.connect(baseGain);
  baseGain.connect(audioContext.destination);

  oscillator.start();
  tremolo.start();

  baseGain.gain.setTargetAtTime(0.16, audioContext.currentTime, 0.4);

  purrNodes = {
    oscillator,
    baseGain,
    tremolo,
    tremoloGain,
  };
};

const stopPurr = () => {
  if (!purrNodes) {
    return;
  }
  const nodes = purrNodes;
  purrNodes = null;
  const releaseTime = 0.35;
  const currentTime = audioContext.currentTime;

  nodes.baseGain.gain.setTargetAtTime(0, currentTime, releaseTime);

  setTimeout(() => {
    try {
      nodes.oscillator.stop();
      nodes.tremolo.stop();
    } catch (error) {
      // no-op: oscillator already stopped
    }
    nodes.oscillator.disconnect();
    nodes.baseGain.disconnect();
    nodes.tremolo.disconnect();
    nodes.tremoloGain.disconnect();
  }, releaseTime * 1000 + 120);
};

button.addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  toggleSprint();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && chasing) {
    disengageSprint();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    toggleSprint();
  }
});
