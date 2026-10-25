// ============================================================
// script.js — Realistic Developer Desk Workstation v3.0
// Features: Real-Time Keyboard & Mouse Mirroring, Windows 11 Shell,
//           Draggable Desktop Icons, Toggleable Desk Lamp,
//           Wall Sticky Note, 3D POV Scene Parallax
// ============================================================

(function () {
  'use strict';

  /* ------------------------------------------------------------
     1. SYNTHESIZED TACTILE AUDIO (Mechanical Keys & Mouse Clicks)
     ------------------------------------------------------------ */
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        audioCtx = new AudioClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playKeyClick() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch { /* silent fallback */ }
  }

  let lastClickAudioTime = 0;
  function playMouseClick() {
    const now = performance.now();
    if (now - lastClickAudioTime < 50) return;
    lastClickAudioTime = now;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.025);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch { /* silent fallback */ }
  }

  /* ------------------------------------------------------------
     2. REAL-TIME PHYSICAL KEYBOARD MIRRORING (ZERO NEON GLOW)
     ------------------------------------------------------------ */
  const keyboard = document.getElementById('desk-keyboard');

  function findKeyElement(code, key) {
    if (!keyboard) return null;
    let el = keyboard.querySelector(`[data-key="${code}"]`);
    if (el) return el;
    const upperKey = key ? key.toUpperCase() : '';
    if (upperKey.length === 1) {
      el = keyboard.querySelector(`[data-key="Key${upperKey}"]`);
      if (el) return el;
      el = keyboard.querySelector(`[data-key="Digit${upperKey}"]`);
      if (el) return el;
    }
    return null;
  }

  window.addEventListener('keydown', (e) => {
    const keyEl = findKeyElement(e.code, e.key);
    if (keyEl) {
      keyEl.classList.add('pressed');
      playKeyClick();
    }
  });

  window.addEventListener('keyup', (e) => {
    const keyEl = findKeyElement(e.code, e.key);
    if (keyEl) keyEl.classList.remove('pressed');
  });

  window.addEventListener('blur', () => {
    document.querySelectorAll('.key.pressed').forEach(k => k.classList.remove('pressed'));
  });

  /* ------------------------------------------------------------
     3. TACTILE MOUSE & KEYBOARD CLICKS (STATIC ROCK-SOLID 3D)
     Device stays planted in 3D space — ZERO jittery cursor tracking!
     ------------------------------------------------------------ */
  const btnLeft = document.getElementById('mouse-btn-l');
  const btnRight = document.getElementById('mouse-btn-r');
  const mouseWheel = document.getElementById('mouse-wheel');
  const laptopTrackpad = document.getElementById('laptop-trackpad');

  window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      if (btnLeft) btnLeft.classList.add('pressed');
      if (laptopTrackpad) laptopTrackpad.classList.add('active');
      playMouseClick();
    } else if (e.button === 2) {
      if (btnRight) btnRight.classList.add('pressed');
      playMouseClick();
    }
  });

  window.addEventListener('mouseup', () => {
    if (btnLeft) btnLeft.classList.remove('pressed');
    if (btnRight) btnRight.classList.remove('pressed');
    if (laptopTrackpad) laptopTrackpad.classList.remove('active');
  });

  window.addEventListener('wheel', (e) => {
    if (mouseWheel) {
      mouseWheel.style.transform = `translateY(${e.deltaY > 0 ? 3 : -3}px)`;
      setTimeout(() => { mouseWheel.style.transform = ''; }, 100);
    }
  });

  /* ------------------------------------------------------------
     4. WINDOWS 11 WINDOW MANAGER & TASKBAR CONTROLS
     ------------------------------------------------------------ */
  const taskbarBtns = document.querySelectorAll('.taskbar-btn[data-app]');
  let highestZ = 30;

  function updateTaskbar(appId, isOpen) {
    taskbarBtns.forEach(btn => {
      if (btn.dataset.app === appId) btn.classList.toggle('active', isOpen);
    });
  }

  function openWindow(appId) {
    const targetWin = document.getElementById(`win-${appId}`);
    if (!targetWin) return;
    highestZ++;
    targetWin.style.zIndex = highestZ;
    targetWin.classList.add('active');
    updateTaskbar(appId, true);
  }

  function closeWindow(appId) {
    const targetWin = document.getElementById(`win-${appId}`);
    if (!targetWin) return;
    targetWin.classList.remove('active');
    targetWin.classList.remove('maximized');
    updateTaskbar(appId, false);
  }

  // Bring clicked window to front
  document.querySelectorAll('.os-window').forEach(win => {
    win.addEventListener('mousedown', () => {
      highestZ++;
      win.style.zIndex = highestZ;
      if (win.dataset.window) updateTaskbar(win.dataset.window, true);
    });
  });

  // Window Close / Minimize / Maximize
  document.querySelectorAll('[data-win-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const app = btn.dataset.winClose;
      if (app) closeWindow(app);
    });
  });

  document.querySelectorAll('.win-ctrl-btn.btn-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest('.os-window');
      if (win && win.dataset.window) closeWindow(win.dataset.window);
    });
  });

  document.querySelectorAll('.win-ctrl-btn.btn-max').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest('.os-window');
      if (win) win.classList.toggle('maximized');
    });
  });

  // Taskbar buttons
  taskbarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const app = btn.dataset.app;
      if (!app) return;
      const targetWin = document.getElementById(`win-${app}`);
      if (targetWin && targetWin.classList.contains('active')) {
        closeWindow(app);
      } else {
        openWindow(app);
      }
    });
  });

  // Start button
  const startBtn = document.querySelector('.win-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectsWin = document.getElementById('win-projects');
      if (projectsWin && projectsWin.classList.contains('active')) {
        closeWindow('projects');
      } else {
        openWindow('projects');
      }
    });
  }

  // Sidebar navigation inside Explorer windows
  document.querySelectorAll('[data-open]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const app = item.dataset.open;
      if (app) openWindow(app);
    });
  });

  // Copy email button
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const email = copyEmailBtn.dataset.clipboard || 'vanrajsinh@example.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          const original = copyEmailBtn.textContent;
          copyEmailBtn.textContent = '✓ Copied!';
          copyEmailBtn.style.background = '#10b981';
          copyEmailBtn.style.color = '#ffffff';
          setTimeout(() => {
            copyEmailBtn.textContent = original;
            copyEmailBtn.style.background = '';
            copyEmailBtn.style.color = '';
          }, 2000);
        }).catch(() => {});
      }
    });
  }

  /* ------------------------------------------------------------
     5. DRAGGABLE DESKTOP ICONS
     Icons can be freely dragged to any position on the desktop.
     Positions reset on page refresh (no localStorage).
     ------------------------------------------------------------ */
  const desktopCanvas = document.getElementById('desktop-canvas');

  // Assign initial absolute positions
  const DEFAULT_POSITIONS = [
    { left: 8, top: 8 },
    { left: 8, top: 98 },
    { left: 8, top: 188 },
    { left: 8, top: 278 },
    { left: 8, top: 368 },
  ];

  const desktopItems = document.querySelectorAll('.desktop-item');
  desktopItems.forEach((item, i) => {
    const pos = DEFAULT_POSITIONS[i] || { left: 8, top: 8 + i * 90 };
    item.style.left = pos.left + 'px';
    item.style.top = pos.top + 'px';
  });

  let dragState = null; // { item, startMouseX, startMouseY, startItemX, startItemY }

  function getCanvasBounds() {
    return desktopCanvas ? desktopCanvas.getBoundingClientRect() : null;
  }

  desktopItems.forEach(item => {
    item.addEventListener('mousedown', (e) => {
      // Only primary button (left click)
      if (e.button !== 0) return;
      e.stopPropagation();

      const rect = item.getBoundingClientRect();
      const canvasBounds = getCanvasBounds();
      if (!canvasBounds) return;

      dragState = {
        item,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startItemX: rect.left - canvasBounds.left,
        startItemY: rect.top - canvasBounds.top,
        didDrag: false,
      };

      item.style.zIndex = '999';
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragState) return;

    const dx = e.clientX - dragState.startMouseX;
    const dy = e.clientY - dragState.startMouseY;

    // Threshold to distinguish click vs drag
    if (!dragState.didDrag && Math.sqrt(dx * dx + dy * dy) < 5) return;
    dragState.didDrag = true;

    const { item, startItemX, startItemY } = dragState;
    const canvasBounds = getCanvasBounds();
    if (!canvasBounds) return;

    let newLeft = startItemX + dx;
    let newTop = startItemY + dy;

    // Clamp within canvas bounds
    const maxLeft = canvasBounds.width - item.offsetWidth;
    const maxTop = canvasBounds.height - item.offsetHeight;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    item.style.left = newLeft + 'px';
    item.style.top = newTop + 'px';
    item.classList.add('dragging');
    item.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', (e) => {
    if (!dragState) return;
    const { item, didDrag } = dragState;

    item.classList.remove('dragging');
    item.style.cursor = '';
    item.style.zIndex = '';

    // Only open window if it was a real click (not a drag)
    if (!didDrag) {
      selectDesktopItem(item);
      const app = item.dataset.app;
      if (app) openWindow(app);
    }

    dragState = null;
  });

  // Desktop click — deselect
  if (desktopCanvas) {
    desktopCanvas.addEventListener('click', (e) => {
      if (e.target === desktopCanvas) selectDesktopItem(null);
    });
  }

  function selectDesktopItem(targetItem) {
    desktopItems.forEach(i => i.classList.remove('selected'));
    if (targetItem) targetItem.classList.add('selected');
  }

  // Keyboard activation of desktop icons
  desktopItems.forEach(item => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        selectDesktopItem(item);
        const app = item.dataset.app;
        if (app) openWindow(app);
      }
    });
  });

  /* ------------------------------------------------------------
     6. TOGGLEABLE MODERN MINIMALIST DESK LAMP
     Touch or click modern lamp → smooth atmospheric lighting toggle
     ------------------------------------------------------------ */
  const deskLamp = document.getElementById('desk-lamp');
  const lampToggleBtn = document.getElementById('lamp-toggle-btn');
  const roomBackground = document.querySelector('.room-background');
  let lampOn = true;

  function toggleLamp() {
    lampOn = !lampOn;
    if (roomBackground) {
      roomBackground.classList.toggle('lamp-off', !lampOn);
    }
  }

  if (lampToggleBtn) {
    lampToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLamp();
    });
  }

  if (deskLamp) {
    deskLamp.addEventListener('click', (e) => {
      // Don't double trigger if clicked on toggle btn
      if (e.target.closest('#lamp-toggle-btn')) return;
      toggleLamp();
    });
  }

  /* ------------------------------------------------------------
     7. ASUS TUF 15 HARDWARE CONTROLS (Hotkeys & Power Button)
     ------------------------------------------------------------ */
  const tufPowerBtn = document.getElementById('tuf-power-btn');
  const compScreen = document.getElementById('computer-screen');

  if (tufPowerBtn && compScreen) {
    tufPowerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playKeyClick();
      // Subtle screen brightness cycle
      compScreen.style.filter = compScreen.style.filter === 'brightness(0.2)' ? '' : 'brightness(0.2)';
    });
  }

  // TUF Gaming Hotkeys (Vol-, Vol+, Mic, Crate)
  document.querySelectorAll('.tuf-hotkey').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playKeyClick();
      btn.style.transform = 'translateY(1.5px)';
      setTimeout(() => { btn.style.transform = ''; }, 100);
    });
  });

  /* ------------------------------------------------------------
     8. WINDOWS 11 TASKBAR CLOCK & DATE
     ------------------------------------------------------------ */
  const clockEl = document.getElementById('taskbar-clock');
  const dateEl = document.getElementById('taskbar-date');

  function updateWindowsClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    if (clockEl) clockEl.textContent = `${hours}:${minutes} ${ampm}`;
    if (dateEl) {
      const m = now.getMonth() + 1;
      const d = now.getDate();
      const y = now.getFullYear();
      dateEl.textContent = `${m}/${d}/${y}`;
    }
  }

  setInterval(updateWindowsClock, 1000);
  updateWindowsClock();

  /* ------------------------------------------------------------
     9. WALL STICKY NOTE — contenteditable, no persistence
     ------------------------------------------------------------ */
  const noteBody = document.querySelector('.note-body');
  if (noteBody) {
    // Prevent keyboard events inside note from triggering key mirroring
    noteBody.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });
    noteBody.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });
    // Make note draggable (click on header to drag)
    const noteEl = document.getElementById('wall-note');
    const noteHeader = noteEl ? noteEl.querySelector('.note-header') : null;
    if (noteEl && noteHeader) {
      let noteDrag = null;
      noteHeader.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        const rect = noteEl.getBoundingClientRect();
        noteDrag = {
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startElRight: window.innerWidth - rect.right,
          startElTop: rect.top,
        };
        e.preventDefault();
      });
      document.addEventListener('mousemove', (ev) => {
        if (!noteDrag) return;
        const dx = ev.clientX - noteDrag.startMouseX;
        const dy = ev.clientY - noteDrag.startMouseY;
        noteEl.style.right = (noteDrag.startElRight - dx) + 'px';
        noteEl.style.top = (noteDrag.startElTop + dy) + 'px';
      });
      document.addEventListener('mouseup', () => {
        noteDrag = null;
      });
    }
  }

})();
