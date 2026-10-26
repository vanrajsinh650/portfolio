/**
 * ============================================================================
 * AEGIS-9 DEEP SPACE OBSERVATORY — INTERACTIVE RETRO PIXEL ART ENGINE
 * Commander Vanrajsinh Portfolio
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. WEB AUDIO API — 8-BIT CHIPTUNE SYNTHESIZER
  // --------------------------------------------------------------------------
  class ChiptuneSynth {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.init();
    }

    init() {
      // Lazy init AudioContext on first user interaction to comply with browser autoplay policies
      const startAudio = () => {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.ctx = new AudioContextClass();
          }
        } else if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      };

      window.addEventListener('click', startAudio, { once: true });
      window.addEventListener('keydown', startAudio, { once: true });

      // Load sound state from localStorage
      const saved = localStorage.getItem('aegis_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('aegis_sound_enabled', this.enabled);
      if (this.enabled) {
        this.playSelect();
      }
      return this.enabled;
    }

    // Low-level wave tone generator
    tone(freq, type, duration, gainValue = 0.08, rampDown = true) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
        if (rampDown) {
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        }

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Silently handle any audio policy hiccups
      }
    }

    // UI Hover Blip (Short square wave)
    playHover() {
      this.tone(880, 'square', 0.03, 0.03);
    }

    // Select / Activate Chime (Two-tone ascending)
    playSelect() {
      if (!this.enabled || !this.ctx) return;
      this.tone(523.25, 'square', 0.06, 0.05); // C5
      setTimeout(() => this.tone(659.25, 'square', 0.08, 0.05), 50); // E5
    }

    // Open Modal Window (Ascending 3-chord fanfare)
    playOpen() {
      if (!this.enabled || !this.ctx) return;
      this.tone(440, 'triangle', 0.08, 0.07);
      setTimeout(() => this.tone(554.37, 'triangle', 0.08, 0.07), 60);
      setTimeout(() => this.tone(659.25, 'triangle', 0.12, 0.07), 120);
    }

    // Close Modal Window (Descending chord)
    playClose() {
      if (!this.enabled || !this.ctx) return;
      this.tone(659.25, 'triangle', 0.06, 0.06);
      setTimeout(() => this.tone(440, 'triangle', 0.09, 0.06), 60);
    }

    // Astro-bot Cute Chirp (Randomized pitch sequence)
    playChirp() {
      if (!this.enabled || !this.ctx) return;
      const notes = [600, 750, 900, 1100, 1300];
      const count = 4;
      for (let i = 0; i < count; i++) {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        setTimeout(() => {
          this.tone(freq, 'sine', 0.06, 0.06);
        }, i * 70);
      }
    }

    // Zero-G Coffee Mug Sip (Soft bubble sequence)
    playSip() {
      if (!this.enabled || !this.ctx) return;
      this.tone(300, 'sine', 0.08, 0.08);
      setTimeout(() => this.tone(450, 'sine', 0.08, 0.08), 80);
      setTimeout(() => this.tone(600, 'sine', 0.1, 0.06), 160);
    }

    // Morse Code Transmission Pulse
    playMorse() {
      if (!this.enabled || !this.ctx) return;
      const pattern = [1, 0, 1, 0, 1, 1, 0, 1];
      pattern.forEach((p, idx) => {
        if (p === 1) {
          setTimeout(() => this.tone(950, 'sine', 0.05, 0.05), idx * 70);
        }
      });
    }

    // Hyperdrive Warp Jump (Descending slide + white-noise blast)
    playWarp() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 1.8);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.0);

        // White noise burst simulation
        const bufferSize = this.ctx.sampleRate * 1.5;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1200, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 1.5);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 1.8);
      } catch (e) {
        // Audio error fallback
      }
    }
  }

  const synth = new ChiptuneSynth();

  // --------------------------------------------------------------------------
  // 2. PROCEDURAL PIXEL STARFIELD & NEBULA CANVAS ENGINE
  // --------------------------------------------------------------------------
  class StarfieldEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.stars = [];
      this.meteors = [];
      this.warpSpeed = false;
      this.warpProgress = 0;
      this.starColors = ['#ffffff', '#00f5ff', '#ffb703', '#f72585', '#70f3ff'];
      
      this.resize();
      this.createStars(180);
      this.initEvents();
      this.animate();
    }

    resize() {
      const parent = this.canvas.parentElement;
      this.width = this.canvas.width = parent.clientWidth;
      this.height = this.canvas.height = parent.clientHeight;
      this.cx = this.width / 2;
      this.cy = this.height / 2;
    }

    createStars(count) {
      this.stars = [];
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() > 0.85 ? 3 : (Math.random() > 0.5 ? 2 : 1),
          color: this.starColors[Math.floor(Math.random() * this.starColors.length)],
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          twinklePhase: Math.random() * Math.PI * 2,
          speed: 0.1 + Math.random() * 0.3,
          layer: Math.floor(Math.random() * 3) + 1
        });
      }
    }

    spawnMeteor() {
      if (this.meteors.length >= 2 || this.warpSpeed) return;
      this.meteors.push({
        x: Math.random() * this.width * 0.7,
        y: Math.random() * this.height * 0.4,
        length: 40 + Math.random() * 60,
        speed: 8 + Math.random() * 6,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        life: 1,
        color: Math.random() > 0.5 ? '#00f5ff' : '#ffb703'
      });
    }

    setWarp(active) {
      this.warpSpeed = active;
      this.warpProgress = active ? 0 : 0;
    }

    initEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.createStars(180);
      });

      // Periodically trigger meteors
      setInterval(() => {
        if (Math.random() > 0.4) {
          this.spawnMeteor();
        }
      }, 4000);
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      // Clear Canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.warpSpeed) {
        // HYPERDRIVE WARP STREAKS
        this.ctx.fillStyle = 'rgba(5, 5, 13, 0.35)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        for (let star of this.stars) {
          const dx = star.x - this.cx;
          const dy = star.y - this.cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = 18 + dist * 0.05;

          const nx = star.x + (dx / dist) * speed;
          const ny = star.y + (dy / dist) * speed;

          this.ctx.beginPath();
          this.ctx.strokeStyle = star.color;
          this.ctx.lineWidth = star.size * 1.5;
          this.ctx.moveTo(star.x, star.y);
          this.ctx.lineTo(nx, ny);
          this.ctx.stroke();

          star.x = nx;
          star.y = ny;

          // Wrap out of bounds
          if (star.x < 0 || star.x > this.width || star.y < 0 || star.y > this.height) {
            star.x = this.cx + (Math.random() - 0.5) * 40;
            star.y = this.cy + (Math.random() - 0.5) * 40;
          }
        }
        return;
      }

      // NORMAL OBSERVATORY STARFIELD
      for (let star of this.stars) {
        // Slow subtle drift
        star.y += star.speed * 0.15;
        if (star.y > this.height) {
          star.y = 0;
          star.x = Math.random() * this.width;
        }

        // Twinkle calculation
        star.twinklePhase += star.twinkleSpeed;
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(star.twinklePhase));

        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = star.color;

        // Draw crisp pixel star
        this.ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);

        // Bright 4-pixel cross flare for larger stars
        if (star.size === 3 && alpha > 0.85) {
          this.ctx.globalAlpha = alpha * 0.4;
          this.ctx.fillRect(Math.floor(star.x) - 2, Math.floor(star.y), 7, 1);
          this.ctx.fillRect(Math.floor(star.x), Math.floor(star.y) - 2, 1, 7);
        }
      }

      // Draw Meteors
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.life -= 0.02;

        if (m.life <= 0 || m.x > this.width || m.y > this.height) {
          this.meteors.splice(i, 1);
          continue;
        }

        this.ctx.globalAlpha = m.life;
        this.ctx.strokeStyle = m.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(m.x, m.y);
        this.ctx.lineTo(
          m.x - Math.cos(m.angle) * m.length,
          m.y - Math.sin(m.angle) * m.length
        );
        this.ctx.stroke();
      }

      this.ctx.globalAlpha = 1;
    }
  }

  // --------------------------------------------------------------------------
  // 3. DIALOG MODAL CONTROLLER
  // --------------------------------------------------------------------------
  class ModalController {
    constructor() {
      this.modals = document.querySelectorAll('.pixel-modal');
      this.activeModal = null;
      this.initEvents();
    }

    initEvents() {
      // Close buttons
      document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-close');
          this.close(id);
        });
      });

      // Minimize buttons
      document.querySelectorAll('.btn-min').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const modal = e.target.closest('.pixel-modal');
          if (modal) {
            this.close(modal.id);
          }
        });
      });

      // Quick Nav Buttons in Header
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target');
          this.open(target);
        });
      });

      // Console Station Modules
      document.querySelectorAll('.console-item[data-modal]').forEach(item => {
        item.addEventListener('click', () => {
          const modalId = item.getAttribute('data-modal');
          this.open(modalId);
        });

        // Accessibility keypress (Enter / Space)
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const modalId = item.getAttribute('data-modal');
            this.open(modalId);
          }
        });
      });

      // Click outside to close (native backdrop click)
      this.modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
          const rect = modal.getBoundingClientRect();
          const isInDialog = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
          );
          if (!isInDialog) {
            this.close(modal.id);
          }
        });

        // Native cancel event (Escape key)
        modal.addEventListener('cancel', () => {
          synth.playClose();
          this.activeModal = null;
        });
      });
    }

    open(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      // If another modal is open, close it first
      if (this.activeModal && this.activeModal !== modal) {
        this.activeModal.close();
      }

      synth.playOpen();
      modal.showModal();
      this.activeModal = modal;

      // Reset scroll of modal body
      const body = modal.querySelector('.modal-body');
      if (body) body.scrollTop = 0;
    }

    close(modalId) {
      const modal = document.getElementById(modalId) || this.activeModal;
      if (!modal) return;

      synth.playClose();
      modal.close();
      if (this.activeModal === modal) {
        this.activeModal = null;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. STATION INTERACTION & EASTER EGGS
  // --------------------------------------------------------------------------
  function setupEasterEggs(starfield) {
    // A. Astro-Bot Companion
    const bot = document.getElementById('astro-bot');
    const bubble = document.getElementById('bot-bubble');
    const botPhrases = [
      'BEEP BOOP! HI!',
      'SYSTEMS 100%!',
      'AEGIS-9 SECURE!',
      'GREETINGS HUMAN!',
      'ALL SENSORS GREEN!',
      'WARP CORE NOMINAL!',
      'COFFEE DETECTED ☕',
      'STARFIELD GORGEOUS!'
    ];

    if (bot) {
      bot.addEventListener('click', () => {
        synth.playChirp();
        const phrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
        if (bubble) {
          bubble.textContent = phrase;
          bubble.classList.add('active');
          setTimeout(() => bubble.classList.remove('active'), 2200);
        }
      });
    }

    // B. Zero-G Coffee Mug
    const mug = document.getElementById('item-mug');
    if (mug) {
      mug.addEventListener('click', () => {
        synth.playSip();
        mug.classList.add('spin');
        setTimeout(() => mug.classList.remove('spin'), 650);
      });
    }

    // C. Emergency Red Warp Button (Hyperdrive)
    const warpButton = document.getElementById('item-warp-button');
    const warpFlash = document.getElementById('warp-flash');
    let isWarping = false;

    const triggerWarp = () => {
      if (isWarping) return;
      isWarping = true;

      synth.playWarp();
      document.body.classList.add('warping');
      if (warpFlash) warpFlash.classList.add('active');
      starfield.setWarp(true);

      setTimeout(() => {
        starfield.setWarp(false);
        document.body.classList.remove('warping');
        if (warpFlash) warpFlash.classList.remove('active');
        isWarping = false;
      }, 2200);
    };

    if (warpButton) {
      warpButton.addEventListener('click', triggerWarp);
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === 'w' || e.key === 'W') {
        triggerWarp();
      } else if (e.key === '1') {
        modalController.open('modal-projects');
      } else if (e.key === '2') {
        modalController.open('modal-about');
      } else if (e.key === '3') {
        modalController.open('modal-skills');
      } else if (e.key === '4') {
        modalController.open('modal-contact');
      } else if (e.key === '5') {
        modalController.open('modal-resume');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. PROJECT FILTERS & SKILLS TABS
  // --------------------------------------------------------------------------
  function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('#project-filters .pixel-tag');
    const cards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        synth.playHover();
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        cards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  function setupSkillsTabs() {
    const tabButtons = document.querySelectorAll('#skills-tabs .pixel-tag');
    const categories = document.querySelectorAll('.skill-category');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        synth.playHover();
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-tab');
        categories.forEach(cat => {
          const group = cat.getAttribute('data-group');
          if (tab === 'all-skills' || group === tab) {
            cat.style.display = 'flex';
          } else {
            cat.style.display = 'none';
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. CONTACT & TRANSMISSION ACTIONS
  // --------------------------------------------------------------------------
  function setupContactActions() {
    // 1-Click Copy Email
    const btnCopy = document.getElementById('btn-copy-email');
    const emailElem = document.getElementById('commander-email');

    if (btnCopy && emailElem) {
      btnCopy.addEventListener('click', async () => {
        synth.playSelect();
        const email = emailElem.textContent.trim();
        try {
          await navigator.clipboard.writeText(email);
          const originalHTML = btnCopy.innerHTML;
          btnCopy.innerHTML = '<span class="btn-icon">✓</span> COPIED!';
          btnCopy.classList.add('highlight');
          setTimeout(() => {
            btnCopy.innerHTML = originalHTML;
          }, 2000);
        } catch (e) {
          // Fallback selection
          const range = document.createRange();
          range.selectNodeContents(emailElem);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    }

    // Sub-Space Signal Form Transmission
    const form = document.getElementById('comms-form');
    const feedback = document.getElementById('form-feedback');
    const transmitBtn = document.getElementById('btn-transmit');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        synth.playMorse();

        if (transmitBtn) {
          transmitBtn.disabled = true;
          transmitBtn.innerHTML = '<span class="btn-icon">⏳</span> ENCRYPTING...';
        }

        if (feedback) {
          feedback.textContent = 'TRANSMITTING VIA RELAY ALPHA...';
          feedback.style.color = 'var(--amber-core)';
        }

        setTimeout(() => {
          if (feedback) {
            feedback.textContent = '✓ PACKET RECEIVED BY COMMANDER VANRAJSINH!';
            feedback.style.color = 'var(--green-online)';
          }
          if (transmitBtn) {
            transmitBtn.disabled = false;
            transmitBtn.innerHTML = '<span class="btn-icon">⚡</span> BROADCAST TRANSMISSION';
          }
          form.reset();
          synth.playSelect();
        }, 1400);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 7. HUD CONTROLS & STARDATE MISSION CLOCK
  // --------------------------------------------------------------------------
  function setupHudControls() {
    // Audio Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.classList.toggle('active', synth.enabled);
      soundBtn.textContent = synth.enabled ? '🔊 SFX' : '🔇 MUTED';

      soundBtn.addEventListener('click', () => {
        const isEnabled = synth.toggle();
        soundBtn.classList.toggle('active', isEnabled);
        soundBtn.textContent = isEnabled ? '🔊 SFX' : '🔇 MUTED';
      });
    }

    // CRT Toggle
    const crtBtn = document.getElementById('btn-toggle-crt');
    const isCrt = localStorage.getItem('aegis_crt_enabled') !== 'false';
    document.body.classList.toggle('crt-enabled', isCrt);
    if (crtBtn) {
      crtBtn.classList.toggle('active', isCrt);
      crtBtn.addEventListener('click', () => {
        synth.playHover();
        const active = document.body.classList.toggle('crt-enabled');
        crtBtn.classList.toggle('active', active);
        localStorage.setItem('aegis_crt_enabled', active);
      });
    }

    // Button Hover Chiptune Blips
    document.querySelectorAll('.pixel-btn, .pixel-tag, .social-link-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => synth.playHover());
    });

    // Live Stardate Clock
    const clockElem = document.getElementById('stardate-clock');
    function updateClock() {
      if (!clockElem) return;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      clockElem.textContent = `SD: ${year}.${month}${day} // ${hours}:${mins}:${secs}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // --------------------------------------------------------------------------
  let modalController = null;

  document.addEventListener('DOMContentLoaded', () => {
    const starfield = new StarfieldEngine('starfield-canvas');
    modalController = new ModalController();
    setupEasterEggs(starfield);
    setupProjectFilters();
    setupSkillsTabs();
    setupContactActions();
    setupHudControls();

    // Deep Linking Support (e.g. #projects, #about, #skills, #contact, #resume)
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash) {
      const targetMap = {
        'projects': 'modal-projects',
        'about': 'modal-about',
        'skills': 'modal-skills',
        'contact': 'modal-contact',
        'resume': 'modal-resume'
      };
      if (targetMap[hash]) {
        setTimeout(() => modalController.open(targetMap[hash]), 100);
      }
    }

    // Welcome Console Log
    console.log(
      '%c 🚀 AEGIS-9 DEEP SPACE OBSERVATORY ONLINE %c Commander Vanrajsinh Portfolio %c',
      'background: #00f5ff; color: #0b0c1b; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px;',
      'background: #ffb703; color: #000; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px;',
      'background: transparent;'
    );
  });

})();
