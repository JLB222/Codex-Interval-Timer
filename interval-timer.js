const $ = id => document.getElementById(id);
const inputs = {
  rounds: $('rounds'),
  active: $('active'),
  rest: $('rest'),
  pyramidMax: $('pyramidMax'),
  pyramidIncrement: $('pyramidIncrement'),
  pyramidRest: $('pyramidRest'),
  emomDuration: $('emomDuration'),
  emomPeriod: $('emomPeriod')
};
let mode = 'intervals';
let round = 1;
let phase = 'active';
let remaining = 30;
let totalRemaining = 20 * 60;
let emomPeriod = 1;
let running = false;
let finished = false;
let tick = null;

const sounds = {
  activeToRest: new Audio('assets/active-to-rest.wav'),
  restToActive: new Audio('assets/rest-to-active.wav'),
  complete: new Audio('assets/workout-complete.wav')
};
Object.values(sounds).forEach(sound => { sound.preload = 'auto'; });

const limit = (input, min, max) => Math.max(min, Math.min(max, Number.parseInt(input.value, 10) || min));
const intervalConfig = () => ({
  rounds: limit(inputs.rounds, 1, 50),
  active: limit(inputs.active, 1, 5999),
  rest: limit(inputs.rest, 1, 5999)
});
const pyramidConfig = () => ({
  peak: limit(inputs.pyramidMax, 1, 5999),
  increment: limit(inputs.pyramidIncrement, 1, 5999),
  rest: limit(inputs.pyramidRest, 1, 5999)
});
const emomConfig = () => ({
  duration: limit(inputs.emomDuration, 1, 5999) * 60,
  period: limit(inputs.emomPeriod, 1, 359940)
});
const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function activeSteps() {
  if (mode === 'intervals') {
    const config = intervalConfig();
    return Array(config.rounds).fill(config.active);
  }

  const { peak, increment } = pyramidConfig();
  const climb = [];
  for (let duration = increment; duration < peak; duration += increment) {
    climb.push(duration);
  }
  climb.push(peak);
  for (let index = climb.length - 2; index >= 0; index--) {
    climb.push(climb[index]);
  }
  return climb;
}

function restDuration() {
  return mode === 'intervals' ? intervalConfig().rest : pyramidConfig().rest;
}

function render() {
  const emom = emomConfig();
  const emomPeriods = Math.ceil(emom.duration / emom.period);
  $('emomPeriodCount').textContent = emomPeriods;
  const steps = mode === 'emom' ? [] : activeSteps();
  const panel = $('timerPanel');
  $('clock').textContent = format(remaining);
  panel.classList.toggle('rest', phase === 'rest');
  panel.classList.toggle('complete', finished);
  $('phaseText').textContent = finished
    ? 'Complete'
    : running
      ? mode === 'emom' ? 'EMOM' : phase === 'active' ? 'Active' : 'Rest'
      : 'Ready';
  if (finished) {
    $('roundText').textContent = 'Nice work — workout complete';
  } else if (mode === 'emom') {
    $('roundText').innerHTML = `Period <strong>${emomPeriod}</strong> of <strong>${emomPeriods}</strong> · Total ${format(totalRemaining)} left`;
  } else {
    const label = mode === 'intervals' ? 'Round' : 'Step';
    $('roundText').innerHTML = `${label} <strong>${round}</strong> of <strong>${steps.length}</strong>`;
  }
  $('startBtn').textContent = finished ? 'Start again' : running ? 'Pause' : 'Start workout';
  $('progress').innerHTML = Array.from(
    { length: Math.min(mode === 'emom' ? emomPeriods : steps.length, 20) },
    (_, index) => `<span class="${index < (mode === 'emom' ? emomPeriod : round) - 1 ? 'done' : ''}"></span>`
  ).join('');
}

function reset() {
  clearInterval(tick);
  tick = null;
  running = false;
  finished = false;
  round = 1;
  emomPeriod = 1;
  phase = 'active';
  if (mode === 'emom') {
    const config = emomConfig();
    totalRemaining = config.duration;
    remaining = Math.min(config.period, totalRemaining);
  } else {
    remaining = activeSteps()[0];
  }
  render();
}

function advance() {
  if (phase === 'active') {
    phase = 'rest';
    remaining = restDuration();
    playSound(sounds.activeToRest);
  } else if (round < activeSteps().length) {
    round++;
    phase = 'active';
    remaining = activeSteps()[round - 1];
    playSound(sounds.restToActive);
  } else {
    clearInterval(tick);
    tick = null;
    running = false;
    finished = true;
    remaining = 0;
    playSound(sounds.complete);
  }
  render();
}

function start() {
  if (finished) reset();
  if (running) {
    clearInterval(tick);
    tick = null;
    running = false;
    render();
    return;
  }
  running = true;
  render();
  tick = setInterval(() => {
    if (mode === 'emom') {
      if (remaining > 0) remaining--;
      if (totalRemaining > 0) totalRemaining--;
      if (totalRemaining === 0) {
        clearInterval(tick);
        tick = null;
        running = false;
        finished = true;
        remaining = 0;
        playSound(sounds.complete);
      } else if (remaining === 0) {
        emomPeriod++;
        remaining = Math.min(emomConfig().period, totalRemaining);
        playSound(sounds.restToActive);
      }
      render();
      return;
    }

    if (remaining > 0) remaining--;
    if (remaining === 0) advance();
    else render();
  }, 1000);
}

function setMode(nextMode) {
  mode = nextMode;
  const intervalsSelected = mode === 'intervals';
  const pyramidSelected = mode === 'pyramid';
  $('intervalSettings').hidden = !intervalsSelected;
  $('pyramidSettings').hidden = !pyramidSelected;
  $('emomSettings').hidden = mode !== 'emom';
  $('intervalModeBtn').classList.toggle('selected', intervalsSelected);
  $('pyramidModeBtn').classList.toggle('selected', pyramidSelected);
  $('emomModeBtn').classList.toggle('selected', mode === 'emom');
  $('intervalModeBtn').setAttribute('aria-pressed', String(intervalsSelected));
  $('pyramidModeBtn').setAttribute('aria-pressed', String(pyramidSelected));
  $('emomModeBtn').setAttribute('aria-pressed', String(mode === 'emom'));
  reset();
}

$('startBtn').addEventListener('click', start);
$('resetBtn').addEventListener('click', reset);
$('intervalModeBtn').addEventListener('click', () => setMode('intervals'));
$('pyramidModeBtn').addEventListener('click', () => setMode('pyramid'));
$('emomModeBtn').addEventListener('click', () => setMode('emom'));

Object.entries(inputs).forEach(([name, input]) => {
  input.addEventListener('change', () => {
    const [min, max] = name === 'rounds'
      ? [1, 50]
      : name === 'emomPeriod'
        ? [1, 359940]
        : [1, 5999];
    input.value = limit(input, min, max);
    if (!running) reset();
    else render();
  });
});

reset();
