const $ = id => document.getElementById(id);
    const inputs = { rounds:$('rounds'), active:$('active'), rest:$('rest') };
    let round = 1, phase = 'active', remaining = 30, running = false, finished = false, tick = null;
    const sounds = {
      activeToRest: new Audio('assets/active-to-rest.wav'),
      restToActive: new Audio('assets/rest-to-active.wav'),
      complete: new Audio('assets/workout-complete.wav')
    };
    Object.values(sounds).forEach(sound => { sound.preload = 'auto'; });
    function playSound(sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
    const limit = (input, min, max) => Math.max(min, Math.min(max, Number.parseInt(input.value,10) || min));
    const config = () => ({ rounds:limit(inputs.rounds,1,50), active:limit(inputs.active,1,5999), rest:limit(inputs.rest,1,5999) });
    const format = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
    function render() {
      const c=config(), panel=$('timerPanel');
      $('clock').textContent=format(remaining);
      panel.classList.toggle('rest',phase==='rest'); panel.classList.toggle('complete',finished);
      $('phaseText').textContent=finished?'Complete':running?(phase==='active'?'Active':'Rest'):'Ready';
      $('roundText').innerHTML=finished?'Nice work — workout complete':`Round <strong>${round}</strong> of <strong>${c.rounds}</strong>`;
      $('startBtn').textContent=finished?'Start again':running?'Pause':'Start workout';
      $('progress').innerHTML=Array.from({length:Math.min(c.rounds,20)},(_,i)=>`<span class="${i<round-1?'done':''}"></span>`).join('');
    }
    function reset() { clearInterval(tick); tick=null; running=false; finished=false; round=1; phase='active'; remaining=config().active; render(); }
    function advance() {
      if(phase==='active') { phase='rest'; remaining=config().rest; playSound(sounds.activeToRest); }
      else if(round<config().rounds) { round++; phase='active'; remaining=config().active; playSound(sounds.restToActive); }
      else { clearInterval(tick); tick=null; running=false; finished=true; remaining=0; playSound(sounds.complete); }
      render();
    }
    function start() {
      if(finished) reset();
      if(running) { clearInterval(tick); tick=null; running=false; render(); return; }
      running=true; render();
      tick=setInterval(()=>{ if(remaining>0) remaining--; if(remaining===0) advance(); else render(); },1000);
    }
    $('startBtn').addEventListener('click',start); $('resetBtn').addEventListener('click',reset);
    Object.values(inputs).forEach(input=>input.addEventListener('change',()=>{ const [min,max]=input===inputs.rounds?[1,50]:[1,5999]; input.value=limit(input,min,max); if(!running) reset(); else render(); }));
    reset();
