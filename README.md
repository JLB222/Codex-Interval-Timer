# Interval — Workout Timer

A lightweight, browser-based workout timer with three modes: standard intervals, pyramid intervals, and EMOM. It uses plain HTML, CSS, and JavaScript, with no build step or dependencies.

## Getting started

Open `interval-timer.html` in a modern web browser. The timer runs locally; no server or account is required.

## Timer modes

### Intervals

Set the number of rounds, active duration, and rest duration. Each round contains an active interval followed by rest, including the final round.

### Pyramid

Set a peak duration, step increment, and rest duration. The timer counts up from the increment to the peak, then counts back down through the earlier steps. Each step is followed by rest. If the peak is not an exact multiple of the increment, the peak is included as its own step.

For example, a 300-second peak with a 30-second increment creates steps of 30, 60, 90, and so on up to 300, then 270 down to 30 seconds.

### EMOM

Set the total workout duration in minutes and the period length in seconds. The large clock counts down to the next chime, and the line below it shows total time remaining. Do your reps at each chime; rest for the remainder of the period.

The planned period count rounds up. If the total duration is not evenly divisible by the period length, the final period is shorter.

## Controls and sounds

- **Start workout** starts or resumes the timer; while running, the button becomes **Pause**.
- **Reset** returns the current mode to its starting values.
- Changing modes resets the timer. Each mode keeps its own settings.
- **Keep screen awake during workout** is optional. When enabled, it prevents supported mobile browsers from turning off the screen while a workout is running. It releases on pause, reset, and completion, and can use extra battery.
- A sound plays when intervals switch between active and rest, at EMOM period boundaries, and when a workout completes.

The original sound effects are dedicated to the public domain under CC0 1.0. See [SOUND_ASSETS.md](SOUND_ASSETS.md) for details.

## Project files

- `interval-timer.html` — page structure and mode settings
- `interval-timer.css` — layout and styling
- `interval-timer.js` — timer behavior
- `assets/` — sound effect files
- `SOUND_ASSETS.md` — sound asset licensing notes
