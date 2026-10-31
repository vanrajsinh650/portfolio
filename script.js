(function () {
  'use strict';

  const windows = [...document.querySelectorAll('[data-window-panel]')];
  const windowButtons = document.querySelectorAll('[data-window]');
  const menu = document.querySelector('.menu-toggle');
  const headerLinks = document.querySelector('.header-links');

  function openWindow(name) {
    const target = windows.find((item) => item.dataset.windowPanel === name) || windows[0];
    windows.forEach((item) => { item.hidden = item !== target; item.classList.toggle('is-open', item === target); });
    if (window.innerWidth <= 620) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  windowButtons.forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.window)));
  document.querySelectorAll('[data-close-window]').forEach((button) => button.addEventListener('click', () => {
    windows.forEach((item) => { item.hidden = true; item.classList.remove('is-open'); });
  }));

  const projectButtons = [...document.querySelectorAll('[data-project]')];
  const projectPanels = [...document.querySelectorAll('[data-project-panel]')];
  function selectProject(name) {
    projectButtons.forEach((button) => {
      const active = button.dataset.project === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    projectPanels.forEach((panel) => { panel.hidden = panel.dataset.projectPanel !== name; });
  }
  projectButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectProject(button.dataset.project));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
      const next = projectButtons[(index + direction + projectButtons.length) % projectButtons.length];
      next.focus(); selectProject(next.dataset.project);
    });
  });

  if (menu && headerLinks) menu.addEventListener('click', () => {
    const open = headerLinks.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
  });

  const copyEmail = document.querySelector('#copy-email');
  const copyStatus = document.querySelector('#copy-status');
  if (copyEmail) copyEmail.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('vanrajsolanki2875@gmail.com');
      copyEmail.textContent = 'copied';
      if (copyStatus) copyStatus.textContent = 'copied to clipboard';
      window.setTimeout(() => { copyEmail.textContent = 'copy email'; }, 1600);
    } catch (error) {
      if (copyStatus) copyStatus.textContent = 'vanrajsolanki2875@gmail.com';
    }
  });

  const soundToggle = document.querySelector('#sound-toggle');
  let soundOn = false;
  let audioContext;
  function clickSound() {
    if (!soundOn) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 520;
    gain.gain.setValueAtTime(.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .06);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + .06);
  }
  if (soundToggle) soundToggle.addEventListener('click', () => { soundOn = !soundOn; soundToggle.textContent = `SFX: ${soundOn ? 'on' : 'off'}`; soundToggle.setAttribute('aria-pressed', String(soundOn)); clickSound(); });
  document.querySelectorAll('button:not(#sound-toggle)').forEach((button) => button.addEventListener('click', clickSound));

  const clock = document.querySelector('#clock');
  function updateClock() { if (clock) clock.textContent = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
  updateClock(); window.setInterval(updateClock, 30000);
}());
