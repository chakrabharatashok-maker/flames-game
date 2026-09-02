/**
 * FLAMES - The Ultimate Couple's Destiny Game
 * Features:
 * - Algorithmic FLAMES elimination with cyclic Josephus engine
 * - Interactive step-by-step visualizer with animations & sound
 * - Web Audio API synthesized sound engine (zero external assets needed)
 * - Canvas confetti & floating heart particles
 * - Couple horoscope, compatibility radar, and dynamic Truth/Dare challenges
 * - Fate Spinner couple date wheel
 * - Canvas PNG Couple Polaroid Card generator & export
 * - LocalStorage history journal & theme manager
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type, duration, gainVal = 0.15) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }

    playClick() {
      this.playTone(600, 'sine', 0.05, 0.08);
    }

    playMatch() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      // Double chime
      this.playTone(523.25, 'triangle', 0.15, 0.1); // C5
      setTimeout(() => this.playTone(659.25, 'triangle', 0.2, 0.12), 80); // E5
    }

    playTick() {
      this.playTone(880, 'sine', 0.06, 0.07);
    }

    playPoof() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      } catch (e) {}
    }

    playVictory() {
      if (!this.enabled) return;
      const notes = [440, 554.37, 659.25, 880]; // A Major arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.4, 0.15), idx * 110);
      });
    }

    playWheelTick() {
      this.playTone(400, 'triangle', 0.03, 0.04);
    }

    playWheelWin() {
      this.playTone(784, 'sine', 0.3, 0.15); // G5
    }
  }

  const audio = new SoundEngine();

  // --- CONFETTI & PARTICLE CANVAS ---
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, isHeart = false) {
      this.x = x;
      this.y = y;
      this.isHeart = isHeart;
      this.size = isHeart ? Math.random() * 16 + 10 : Math.random() * 8 + 6;
      this.color = ['#ff4081', '#e91e63', '#9c27b0', '#ffb300', '#00e676', '#00b0ff'][Math.floor(Math.random() * 6)];
      this.vx = (Math.random() - 0.5) * 12;
      this.vy = Math.random() * -14 - 4;
      this.gravity = 0.35;
      this.rotation = Math.random() * 360;
      this.vRot = (Math.random() - 0.5) * 8;
      this.opacity = 1;
      this.decay = Math.random() * 0.015 + 0.008;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.rotation += this.vRot;
      this.opacity -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);

      if (this.isHeart) {
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', 0, 0);
      } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      }

      ctx.restore();
    }
  }

  function launchConfetti(count = 100) {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2 + 50;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(originX, originY, Math.random() > 0.65));
    }
    if (!animFrameId) {
      animateParticles();
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.opacity <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animFrameId = requestAnimationFrame(animateParticles);
    } else {
      animFrameId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // --- FLAMES OUTCOMES DATABASE ---
  const FLAMES_PROFILES = {
    F: {
      code: 'F',
      label: 'Friends',
      emoji: '🤝',
      title: 'The Ride-or-Die Duo',
      subtitle: '"Best Friends for Life & Late Night Chats"',
      story: 'You two share an unbreakable bond of trust, inside jokes, and unconditional support. You can read each other’s minds and turn any ordinary grocery run into a comedy show!',
      romance: 45,
      banter: 98,
      vibes: 95,
      drama: 15,
      prompts: [
        'Share your most embarrassing childhood secret with each other!',
        'Do your best impression of how the other person acts when they are hungry.',
        'High-five and name 3 things you genuinely admire about each other.',
        'Agree on your ultimate road trip playlist right now.'
      ]
    },
    L: {
      code: 'L',
      label: 'Lovers',
      emoji: '💖',
      title: 'Written in the Stars',
      subtitle: '"Electric Chemistry & Endless Butterflies"',
      story: 'The stars have aligned! Your connection has that magnetic spark where time stands still. From sweet glances to deep late-night conversations, love is definitely in the air.',
      romance: 98,
      banter: 88,
      vibes: 92,
      drama: 25,
      prompts: [
        'Stare into each other’s eyes for 30 seconds straight without laughing!',
        'Whisper the sweetest compliment you’ve ever wanted to give them.',
        'Play your couple anthem song and slow dance for 1 minute.',
        'Recreate your very first conversation or meeting.'
      ]
    },
    A: {
      code: 'A',
      label: 'Affectionate',
      emoji: '🥰',
      title: 'Sweet Tender Hearts',
      subtitle: '"Warm Hugs & Pure Cozy Comfort"',
      story: 'A gentle, wholesome warmth wraps around your relationship. You care deeply for one another, always checking in, sharing blankets, and offering the coziest safe haven.',
      romance: 90,
      banter: 80,
      vibes: 96,
      drama: 10,
      prompts: [
        'Give each other a 20-second warm bear hug right now.',
        'Give a gentle forehead kiss or head pat and say why you appreciate them.',
        'Plan a dream cozy breakfast-in-bed menu together.',
        'Share what favorite comfort memory of them warms your heart most.'
      ]
    },
    M: {
      code: 'M',
      label: 'Marriage',
      emoji: '💍',
      title: 'Happily Ever After',
      subtitle: '"Lifelong Partners & Golden Rings"',
      story: 'The ultimate power couple! You complement each other’s strengths and balance each other’s flaws. Together, you’re ready to build an empire, adopt 3 dogs, and grow old happily.',
      romance: 95,
      banter: 92,
      vibes: 99,
      drama: 30,
      prompts: [
        'Draft your imaginary wedding vows in 3 funny sentences.',
        'Decide on the name and breed of your hypothetical future couple pet!',
        'What would your joint superpower or secret handshake be? Create it now.',
        'Give a dramatic fake marriage proposal with a snack or ring.'
      ]
    },
    E: {
      code: 'E',
      label: 'Enemies',
      emoji: '⚡',
      title: 'Spicy Frenemies',
      subtitle: '"Opposites Attract & Playful Rivalry"',
      story: 'Sparks fly, banter never ends, and neither of you ever wants to admit you’re wrong! But beneath the witty teasing lies undeniable tension and mutual fascination.',
      romance: 75,
      banter: 100,
      vibes: 70,
      drama: 88,
      prompts: [
        'Engage in an intense thumb-war or rock-paper-scissors best of 3!',
        'Roast each other’s favorite outfit or habit lovingly.',
        'Agree on one debate topic (e.g. Pineapple on pizza) and argue opposite sides for 1 minute.',
        'Admit one thing the other person was actually 100% right about.'
      ]
    },
    S: {
      code: 'S',
      label: 'Siblings',
      emoji: '🤪',
      title: 'Chaos Twins',
      subtitle: '"Matching Gremlin Energy & Pizza Feuds"',
      story: 'You fight over the last slice of pizza, share goofy meme faces, and could easily survive an apocalypse together while bickering the entire time. Pure chaotic fun!',
      romance: 20,
      banter: 99,
      vibes: 94,
      drama: 65,
      prompts: [
        'Make the most absurd, goofy face at each other—first one to laugh loses!',
        'Arm wrestle or battle who can do the best chicken dance.',
        'Reveal who gets the last french fry when you share food.',
        'Sing the chorus of a cartoon or nostalgic 90s TV theme song together.'
      ]
    },
    T: {
      code: 'T',
      label: 'Twin Flames',
      emoji: '✨',
      title: 'Cosmic Soulmates',
      subtitle: '"Mirror Souls with 100% Synchronicity"',
      story: 'Every single letter matched in perfect cosmic alignment! You two are two halves of the same soul, reflecting each other’s destiny and energy perfectly.',
      romance: 100,
      banter: 95,
      vibes: 100,
      drama: 5,
      prompts: [
        'Say a random word on the count of three and see if you say the exact same thing!',
        'Finish each other’s sentence about what you want to eat right now.',
        'Take a synchronized selfie making the exact same pose.'
      ]
    }
  };

  // --- CORE FLAMES ENGINE ---
  function computeFlamesModel(rawName1, rawName2) {
    const name1 = rawName1.trim();
    const name2 = rawName2.trim();

    const clean1 = name1.toLowerCase().replace(/[^a-z]/g, '');
    const clean2 = name2.toLowerCase().replace(/[^a-z]/g, '');

    if (!clean1 || !clean2) {
      throw new Error("Please enter valid names with letters!");
    }

    const chars1 = clean1.split('');
    const chars2 = clean2.split('');

    // Track matching pairs by original indices
    const matchedPairs = []; // { char, idx1, idx2 }
    const used1 = new Set();
    const used2 = new Set();

    for (let i = 0; i < chars1.length; i++) {
      if (used1.has(i)) continue;
      for (let j = 0; j < chars2.length; j++) {
        if (used2.has(j)) continue;
        if (chars1[i] === chars2[j]) {
          used1.add(i);
          used2.add(j);
          matchedPairs.push({ char: chars1[i], idx1: i, idx2: j });
          break;
        }
      }
    }

    const uncrossed1 = chars1.filter((_, idx) => !used1.has(idx));
    const uncrossed2 = chars2.filter((_, idx) => !used2.has(idx));
    const leftoversCount = uncrossed1.length + uncrossed2.length;

    // FLAMES Josephus Simulation
    const initialFlames = ['F', 'L', 'A', 'M', 'E', 'S'];
    const rounds = []; // record each elimination step

    if (leftoversCount === 0) {
      return {
        rawName1,
        rawName2,
        clean1,
        clean2,
        chars1,
        chars2,
        matchedPairs,
        used1,
        used2,
        uncrossed1,
        uncrossed2,
        leftoversCount: 0,
        rounds: [],
        winnerCode: 'T',
        profile: FLAMES_PROFILES['T']
      };
    }

    let activeList = [...initialFlames];
    let startIdx = 0;

    while (activeList.length > 1) {
      const elimRelativeIdx = (startIdx + (leftoversCount - 1)) % activeList.length;
      const eliminatedCode = activeList[elimRelativeIdx];

      // Record counting path for animation
      const countPath = [];
      for (let step = 0; step < leftoversCount; step++) {
        const pIdx = (startIdx + step) % activeList.length;
        countPath.push(activeList[pIdx]);
      }

      rounds.push({
        roundNum: 6 - activeList.length + 1,
        activeListBefore: [...activeList],
        startIdx,
        countPath,
        eliminatedCode,
        elimRelativeIdx
      });

      activeList.splice(elimRelativeIdx, 1);
      startIdx = elimRelativeIdx % activeList.length;
    }

    const winnerCode = activeList[0];

    return {
      rawName1,
      rawName2,
      clean1,
      clean2,
      chars1,
      chars2,
      matchedPairs,
      used1,
      used2,
      uncrossed1,
      uncrossed2,
      leftoversCount,
      rounds,
      winnerCode,
      profile: FLAMES_PROFILES[winnerCode]
    };
  }

  // --- DOM ELEMENTS ---
  const flamesForm = document.getElementById('flamesForm');
  const name1Input = document.getElementById('name1Input');
  const name2Input = document.getElementById('name2Input');
  const avatar1Btn = document.getElementById('avatar1Btn');
  const avatar2Btn = document.getElementById('avatar2Btn');
  const avatar1Icon = document.getElementById('avatar1Icon');
  const avatar2Icon = document.getElementById('avatar2Icon');
  const avatarPicker1 = document.getElementById('avatarPicker1');
  const avatarPicker2 = document.getElementById('avatarPicker2');

  const inputSection = document.getElementById('inputSection');
  const stageSection = document.getElementById('stageSection');
  const resultSection = document.getElementById('resultSection');

  // Stepper Elements
  const stepNodes = [1, 2, 3, 4, 5].map(i => document.getElementById(`stepNode${i}`));
  const stepLines = [1, 2, 3, 4].map(i => document.getElementById(`stepLine${i}`));

  // Narration
  const narrationIcon = document.getElementById('narrationIcon');
  const narrationTitle = document.getElementById('narrationTitle');
  const narrationDesc = document.getElementById('narrationDesc');

  // Arena Elements
  const stageAvatar1 = document.getElementById('stageAvatar1');
  const stageAvatar2 = document.getElementById('stageAvatar2');
  const stageName1 = document.getElementById('stageName1');
  const stageName2 = document.getElementById('stageName2');
  const stageRemCount1 = document.getElementById('stageRemCount1');
  const stageRemCount2 = document.getElementById('stageRemCount2');
  const tilesContainer1 = document.getElementById('tilesContainer1');
  const tilesContainer2 = document.getElementById('tilesContainer2');
  const letterCrossArena = document.getElementById('letterCrossArena');

  const matchedPairsDrawer = document.getElementById('matchedPairsDrawer');
  const matchedChips = document.getElementById('matchedChips');
  const countFormulaBadge = document.getElementById('countFormulaBadge');
  const formulaNValue = document.getElementById('formulaNValue');

  // FLAMES Board
  const flamesBoardWrapper = document.getElementById('flamesBoardWrapper');
  const currentRoundNum = document.getElementById('currentRoundNum');
  const flamesCountN = document.getElementById('flamesCountN');
  const countingPointer = document.getElementById('countingPointer');
  const pointerCountTag = document.getElementById('pointerCountTag');

  // Stage Controls
  const stagePausePlayBtn = document.getElementById('stagePausePlayBtn');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const playPauseText = document.getElementById('playPauseText');
  const stageNextStepBtn = document.getElementById('stageNextStepBtn');
  const stageSkipBtn = document.getElementById('stageSkipBtn');
  const speedBtns = document.querySelectorAll('.speed-btn');

  // Result Section
  const resName1Display = document.getElementById('resName1Display');
  const resName2Display = document.getElementById('resName2Display');
  const outcomeLetterSeal = document.getElementById('outcomeLetterSeal');
  const outcomeTitle = document.getElementById('outcomeTitle');
  const outcomeSubtitle = document.getElementById('outcomeSubtitle');
  const outcomeStoryText = document.getElementById('outcomeStoryText');
  const resultPill = document.getElementById('resultPill');
  const resultPillEmoji = document.getElementById('resultPillEmoji');

  const statRomance = document.getElementById('statRomance');
  const barRomance = document.getElementById('barRomance');
  const statBanter = document.getElementById('statBanter');
  const barBanter = document.getElementById('barBanter');
  const statVibes = document.getElementById('statVibes');
  const barVibes = document.getElementById('barVibes');
  const statDrama = document.getElementById('statDrama');
  const barDrama = document.getElementById('barDrama');

  const couplePromptText = document.getElementById('couplePromptText');
  const newPromptBtn = document.getElementById('newPromptBtn');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const shareStoryBtn = document.getElementById('shareStoryBtn');
  const testAnotherBtn = document.getElementById('testAnotherBtn');

  // Theme & Audio Controls
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const themePickerBtn = document.getElementById('themePickerBtn');
  const themeDropdown = document.getElementById('themeDropdown');
  const themeOptions = document.querySelectorAll('.theme-option');
  const currentThemeIcon = document.getElementById('currentThemeIcon');
  const currentThemeLabel = document.getElementById('currentThemeLabel');

  // History & Toast
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  // Wheel Elements
  const fateWheelCanvas = document.getElementById('fateWheelCanvas');
  const spinWheelBtn = document.getElementById('spinWheelBtn');
  const wheelResultBox = document.getElementById('wheelResultBox');
  const wheelResultEmoji = document.getElementById('wheelResultEmoji');
  const wheelResultTitle = document.getElementById('wheelResultTitle');
  const wheelResultDesc = document.getElementById('wheelResultDesc');

  // --- STATE VARIABLES ---
  let currentModel = null;
  let currentPromptIdx = 0;
  let animSpeedMultiplier = 1; // 1x
  let isPaused = false;
  let currentStepIndex = 0;
  let activeAnimationTimer = null;
  let isWheelSpinning = false;
  let wheelAngle = 0;

  // --- TOAST NOTIFIER ---
  function showToast(msg, icon = '✨') {
    toastMessage.textContent = msg;
    document.getElementById('toastIcon').textContent = icon;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // --- THEME MANAGEMENT ---
  const THEMES = {
    cupid: { label: "Cupid's Glow", icon: '💖' },
    notebook: { label: '90s Notebook', icon: '📜' },
    midnight: { label: 'Midnight Galaxy', icon: '🌌' },
    candypop: { label: 'Candy Pop', icon: '🍭' }
  };

  function setTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    document.documentElement.setAttribute('data-theme', themeKey);
    currentThemeIcon.textContent = THEMES[themeKey].icon;
    currentThemeLabel.textContent = THEMES[themeKey].label;
    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === themeKey);
    });
    localStorage.setItem('flames_theme', themeKey);
    themeDropdown.classList.add('hidden');
  }

  const savedTheme = localStorage.getItem('flames_theme') || 'cupid';
  setTheme(savedTheme);

  themePickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('hidden');
  });

  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      setTheme(opt.dataset.theme);
      audio.playClick();
    });
  });

  document.addEventListener('click', (e) => {
    if (!themePickerBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
      themeDropdown.classList.add('hidden');
    }
    if (!avatar1Btn.contains(e.target) && !avatarPicker1.contains(e.target)) {
      avatarPicker1.classList.add('hidden');
    }
    if (!avatar2Btn.contains(e.target) && !avatarPicker2.contains(e.target)) {
      avatarPicker2.classList.add('hidden');
    }
  });

  // --- AUDIO TOGGLE ---
  audioToggleBtn.addEventListener('click', () => {
    audio.enabled = !audio.enabled;
    const soundIcon = audioToggleBtn.querySelector('.sound-icon');
    const soundText = audioToggleBtn.querySelector('.sound-text');
    if (audio.enabled) {
      soundIcon.textContent = '🔊';
      soundText.textContent = 'Sound: ON';
      audio.playClick();
      showToast('Sound effects enabled', '🔊');
    } else {
      soundIcon.textContent = '🔇';
      soundText.textContent = 'Sound: OFF';
      showToast('Sound effects muted', '🔇');
    }
  });

  // --- AVATAR PICKERS ---
  avatar1Btn.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarPicker1.classList.toggle('hidden');
    avatarPicker2.classList.add('hidden');
  });

  avatar2Btn.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarPicker2.classList.toggle('hidden');
    avatarPicker1.classList.add('hidden');
  });

  avatarPicker1.querySelectorAll('.avatar-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      avatar1Icon.textContent = opt.textContent;
      avatarPicker1.classList.add('hidden');
      audio.playClick();
    });
  });

  avatarPicker2.querySelectorAll('.avatar-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      avatar2Icon.textContent = opt.textContent;
      avatarPicker2.classList.add('hidden');
      audio.playClick();
    });
  });

  // --- PRESET CHIPS ---
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      name1Input.value = chip.dataset.n1;
      name2Input.value = chip.dataset.n2;
      audio.playClick();
      showToast(`Loaded ${chip.dataset.n1} & ${chip.dataset.n2}!`, '✨');
    });
  });

  // --- SPEED CONTROLS ---
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      animSpeedMultiplier = parseFloat(btn.dataset.speed);
      audio.playClick();
    });
  });

  // Helper delay with pause support and speed scaling
  function stepDelay(ms) {
    const adjustedMs = ms / animSpeedMultiplier;
    return new Promise(resolve => {
      const check = () => {
        if (!isPaused) {
          activeAnimationTimer = setTimeout(resolve, adjustedMs);
        } else {
          activeAnimationTimer = setTimeout(check, 100);
        }
      };
      check();
    });
  }

  // --- STEPPER PROGRESS UPDATE ---
  function updateStepper(activeStep) {
    for (let i = 1; i <= 5; i++) {
      const node = stepNodes[i - 1];
      node.classList.remove('active', 'completed');
      if (i < activeStep) {
        node.classList.add('completed');
      } else if (i === activeStep) {
        node.classList.add('active');
      }
    }
    for (let i = 1; i <= 4; i++) {
      const line = stepLines[i - 1];
      line.classList.toggle('filled', i < activeStep);
    }
  }

  // --- STEP-BY-STEP VISUALIZER EXECUTION ---
  async function runStepByStepAnimation(model) {
    currentModel = model;
    stageSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    letterCrossArena.classList.remove('hidden');
    matchedPairsDrawer.classList.add('hidden');
    flamesBoardWrapper.classList.add('hidden');

    // Scroll smoothly to stage
    stageSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Step 1: Render Name Tiles
    updateStepper(1);
    narrationIcon.textContent = '✍️';
    narrationTitle.textContent = 'Step 1: Writing Down Both Names';
    narrationDesc.textContent = `Comparing "${model.rawName1}" and "${model.rawName2}". Let's arrange their letter tiles.`;

    stageAvatar1.textContent = avatar1Icon.textContent;
    stageAvatar2.textContent = avatar2Icon.textContent;
    stageName1.textContent = model.rawName1;
    stageName2.textContent = model.rawName2;
    stageRemCount1.textContent = `${model.chars1.length} letters`;
    stageRemCount2.textContent = `${model.chars2.length} letters`;

    tilesContainer1.innerHTML = '';
    tilesContainer2.innerHTML = '';
    matchedChips.innerHTML = '';

    model.chars1.forEach((char, idx) => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile';
      tile.id = `tile1-${idx}`;
      tile.textContent = char.toUpperCase();
      tilesContainer1.appendChild(tile);
    });

    model.chars2.forEach((char, idx) => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile';
      tile.id = `tile2-${idx}`;
      tile.textContent = char.toUpperCase();
      tilesContainer2.appendChild(tile);
    });

    audio.playClick();
    await stepDelay(900);

    // Step 2: Strike Out Matching Pairs
    updateStepper(2);
    narrationIcon.textContent = '✂️';
    narrationTitle.textContent = 'Step 2: Striking Out Common Letters';
    narrationDesc.textContent = model.matchedPairs.length > 0
      ? `Found ${model.matchedPairs.length} common letter pair(s)! Crossing them off one by one.`
      : `No matching letters found! All letters remain untouched.`;

    matchedPairsDrawer.classList.remove('hidden');

    for (let i = 0; i < model.matchedPairs.length; i++) {
      const pair = model.matchedPairs[i];
      const t1 = document.getElementById(`tile1-${pair.idx1}`);
      const t2 = document.getElementById(`tile2-${pair.idx2}`);

      if (t1 && t2) {
        t1.classList.add('highlight-pair');
        t2.classList.add('highlight-pair');
        audio.playMatch();

        await stepDelay(450);

        t1.classList.remove('highlight-pair');
        t2.classList.remove('highlight-pair');
        t1.classList.add('matched');
        t2.classList.add('matched');

        // Add chip to matched drawer
        const chip = document.createElement('span');
        chip.className = 'matched-chip';
        chip.innerHTML = `<span>✂️</span> <strong>${pair.char.toUpperCase()}</strong>`;
        matchedChips.appendChild(chip);

        await stepDelay(300);
      }
    }

    // Step 3: Count Leftovers (N)
    updateStepper(3);
    narrationIcon.textContent = '🔢';
    narrationTitle.textContent = 'Step 3: Counting the Leftover Letters';
    narrationDesc.textContent = `Tallying the uncrossed letters across both names to determine count N.`;

    model.chars1.forEach((_, idx) => {
      if (!model.used1.has(idx)) {
        const t = document.getElementById(`tile1-${idx}`);
        if (t) t.classList.add('leftover');
      }
    });

    model.chars2.forEach((_, idx) => {
      if (!model.used2.has(idx)) {
        const t = document.getElementById(`tile2-${idx}`);
        if (t) t.classList.add('leftover');
      }
    });

    stageRemCount1.textContent = `${model.uncrossed1.length} leftover`;
    stageRemCount2.textContent = `${model.uncrossed2.length} leftover`;
    formulaNValue.textContent = model.leftoversCount;
    audio.playTick();

    await stepDelay(1100);

    // If leftover count is 0 -> Special Twin Flames
    if (model.leftoversCount === 0) {
      showResultCard(model);
      return;
    }

    // Step 4: FLAMES Cyclic Elimination
    updateStepper(4);
    narrationIcon.textContent = '🔥';
    narrationTitle.textContent = 'Step 4: FLAMES Elimination Arena';
    narrationDesc.textContent = `Counting ${model.leftoversCount} letters circularly around F-L-A-M-E-S until only one destiny remains!`;

    flamesBoardWrapper.classList.remove('hidden');
    flamesCountN.textContent = model.leftoversCount;

    // Reset FLAMES card elements
    ['F', 'L', 'A', 'M', 'E', 'S'].forEach(code => {
      const card = document.getElementById(`card-${code}`);
      card.className = 'flame-letter-card';
    });

    await stepDelay(700);

    // Loop through each elimination round
    for (let r = 0; r < model.rounds.length; r++) {
      const round = model.rounds[r];
      currentRoundNum.textContent = round.roundNum;

      // Animate counting path
      for (let s = 0; s < round.countPath.length; s++) {
        const activeCode = round.countPath[s];
        const card = document.getElementById(`card-${activeCode}`);

        // Position pointer above active card
        if (card) {
          card.classList.add('highlight-pointer');
          pointerCountTag.textContent = `${s + 1} / ${model.leftoversCount}`;
          positionPointerAtCard(card);
          audio.playTick();
        }

        await stepDelay(400);

        if (card) {
          card.classList.remove('highlight-pointer');
        }
      }

      // Eliminate the landing card
      const elimCard = document.getElementById(`card-${round.eliminatedCode}`);
      if (elimCard) {
        elimCard.classList.add('burning');
        audio.playPoof();
        await stepDelay(350);
        elimCard.classList.remove('burning');
        elimCard.classList.add('eliminated');
      }

      await stepDelay(400);
    }

    // Step 5: Reveal Destiny!
    updateStepper(5);
    const winningCard = document.getElementById(`card-${model.winnerCode}`);
    if (winningCard) {
      winningCard.classList.add('winner');
      positionPointerAtCard(winningCard);
      pointerCountTag.textContent = '👑 DESTINY';
    }

    narrationIcon.textContent = '✨';
    narrationTitle.textContent = `Destiny Revealed: ${model.profile.label.toUpperCase()}!`;
    narrationDesc.textContent = `The cosmic oracle has chosen: "${model.profile.title}".`;

    audio.playVictory();
    launchConfetti(80);

    await stepDelay(1400);

    // Reveal Result Card
    showResultCard(model);
  }

  function positionPointerAtCard(card) {
    const grid = document.getElementById('flamesLettersGrid');
    const gridRect = grid.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const relativeX = cardRect.left - gridRect.left + (cardRect.width / 2) - 30;
    countingPointer.style.left = `${Math.max(10, relativeX)}px`;
  }

  // --- INSTANT MODE EXECUTION ---
  function runInstantCalculation(model) {
    currentModel = model;
    stageSection.classList.add('hidden');
    showResultCard(model);
  }

  // --- SHOW RESULT CARD ---
  function showResultCard(model) {
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    resName1Display.textContent = model.rawName1;
    resName2Display.textContent = model.rawName2;

    const prof = model.profile;
    outcomeLetterSeal.textContent = prof.code === 'T' ? '✨' : prof.code;
    outcomeTitle.textContent = prof.label.toUpperCase();
    outcomeSubtitle.textContent = prof.subtitle;
    outcomeStoryText.textContent = prof.story;

    resultPillEmoji.textContent = prof.emoji;
    resultPill.querySelector('#resultPillText').textContent = prof.title;

    // Animate stats
    statRomance.textContent = `${prof.romance}%`;
    barRomance.style.width = `${prof.romance}%`;

    statBanter.textContent = `${prof.banter}%`;
    barBanter.style.width = `${prof.banter}%`;

    statVibes.textContent = `${prof.vibes}%`;
    barVibes.style.width = `${prof.vibes}%`;

    statDrama.textContent = `${prof.drama}%`;
    barDrama.style.width = `${prof.drama}%`;

    // Prompt
    currentPromptIdx = 0;
    couplePromptText.textContent = `"${prof.prompts[0]}"`;

    // Celebration
    audio.playVictory();
    launchConfetti(120);

    // Save to history
    saveToHistory(model);
  }

  // --- PROMPT SHUFFLE ---
  newPromptBtn.addEventListener('click', () => {
    if (!currentModel) return;
    const prompts = currentModel.profile.prompts;
    currentPromptIdx = (currentPromptIdx + 1) % prompts.length;
    couplePromptText.textContent = `"${prompts[currentPromptIdx]}"`;
    audio.playClick();
  });

  // --- STAGE CONTROLS (Pause, Next, Skip) ---
  stagePausePlayBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      playPauseIcon.textContent = '▶️';
      playPauseText.textContent = 'Resume';
    } else {
      playPauseIcon.textContent = '⏸️';
      playPauseText.textContent = 'Pause';
    }
    audio.playClick();
  });

  stageSkipBtn.addEventListener('click', () => {
    if (currentModel) {
      if (activeAnimationTimer) clearTimeout(activeAnimationTimer);
      isPaused = false;
      showResultCard(currentModel);
    }
  });

  testAnotherBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    stageSection.classList.add('hidden');
    inputSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    name1Input.focus();
    audio.playClick();
  });

  // --- COPY RESULT TEXT ---
  copyResultBtn.addEventListener('click', () => {
    if (!currentModel) return;
    const m = currentModel;
    const text = `🔥 FLAMES Couple Oracle Result 🔥\n` +
      `💖 ${m.rawName1} + ${m.rawName2}\n` +
      `✨ Outcome: ${m.profile.label} (${m.profile.title})\n` +
      `📜 "${m.profile.subtitle}"\n` +
      `📊 Chemistry: ${m.profile.romance}% | Banter: ${m.profile.banter}% | Vibes: ${m.profile.vibes}%\n` +
      `Play FLAMES today! ✨`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Result copied to clipboard!', '📋');
      audio.playClick();
    }).catch(() => {
      showToast('Failed to copy text', '⚠️');
    });
  });

  // --- DOWNLOAD POLAROID COUPLE CARD ---
  shareStoryBtn.addEventListener('click', () => {
    if (!currentModel) return;
    generateAndDownloadCard(currentModel);
  });

  function generateAndDownloadCard(model) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 600;
    offCanvas.height = 800;
    const octx = offCanvas.getContext('2d');

    // Background gradient
    const grad = octx.createLinearGradient(0, 0, 600, 800);
    grad.addColorStop(0, '#ffe6eb');
    grad.addColorStop(0.5, '#fff0f5');
    grad.addColorStop(1, '#ffd1dc');
    octx.fillStyle = grad;
    octx.fillRect(0, 0, 600, 800);

    // Decorative Card Border / Shadow
    octx.fillStyle = '#ffffff';
    octx.shadowColor = 'rgba(233, 30, 99, 0.2)';
    octx.shadowBlur = 30;
    octx.roundRect(30, 30, 540, 740, 24);
    octx.fill();
    octx.shadowBlur = 0;

    // Header Tag
    octx.fillStyle = '#e91e63';
    octx.font = 'bold 20px sans-serif';
    octx.textAlign = 'center';
    octx.fillText('✨ F.L.A.M.E.S DESTINY CARD ✨', 300, 85);

    // Couple Names
    octx.fillStyle = '#2d1822';
    octx.font = 'bold 36px sans-serif';
    octx.fillText(`${model.rawName1} ❤️ ${model.rawName2}`, 300, 145);

    // Outcome Letter Badge
    const badgeGrad = octx.createLinearGradient(230, 190, 370, 330);
    badgeGrad.addColorStop(0, '#e91e63');
    badgeGrad.addColorStop(1, '#9c27b0');
    octx.fillStyle = badgeGrad;
    octx.roundRect(235, 190, 130, 130, 24);
    octx.fill();

    octx.fillStyle = '#ffffff';
    octx.font = 'bold 70px sans-serif';
    octx.fillText(model.profile.code, 300, 280);

    // Title & Subtitle
    octx.fillStyle = '#e91e63';
    octx.font = 'bold 32px sans-serif';
    octx.fillText(model.profile.label.toUpperCase(), 300, 370);

    octx.fillStyle = '#735364';
    octx.font = 'italic 20px Georgia, serif';
    octx.fillText(model.profile.subtitle, 300, 405);

    // Story summary box
    octx.fillStyle = '#fce4ec';
    octx.roundRect(60, 440, 480, 110, 16);
    octx.fill();

    octx.fillStyle = '#2d1822';
    octx.font = '16px sans-serif';
    wrapText(octx, model.profile.story, 300, 475, 440, 24);

    // Compatibility stats
    octx.fillStyle = '#2d1822';
    octx.font = 'bold 18px sans-serif';
    octx.fillText(`Romance: ${model.profile.romance}%   |   Banter: ${model.profile.banter}%   |   Vibes: ${model.profile.vibes}%`, 300, 595);

    // Date
    octx.fillStyle = '#a08595';
    octx.font = '14px sans-serif';
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    octx.fillText(`Tested on ${dateStr} • FLAMES Couple Game`, 300, 730);

    // Trigger Download
    const dataUrl = offCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `FLAMES_${model.rawName1}_and_${model.rawName2}.png`;
    a.href = dataUrl;
    a.click();

    showToast('Downloaded Couple Memory Card!', '🖼️');
    audio.playClick();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currY);
        line = words[n] + ' ';
        currY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currY);
  }

  // --- FORM SUBMIT HANDLER ---
  flamesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const n1 = name1Input.value.trim();
    const n2 = name2Input.value.trim();

    if (!n1 || !n2) {
      showToast('Please enter both names!', '⚠️');
      return;
    }

    try {
      const model = computeFlamesModel(n1, n2);
      const mode = document.querySelector('input[name="playMode"]:checked').value;

      if (mode === 'animated') {
        runStepByStepAnimation(model);
      } else {
        runInstantCalculation(model);
      }
    } catch (err) {
      showToast(err.message, '⚠️');
    }
  });

  // --- HISTORY & JOURNAL ---
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('flames_history') || '[]');
    } catch {
      return [];
    }
  }

  function saveToHistory(model) {
    const history = getHistory();
    const item = {
      id: Date.now(),
      name1: model.rawName1,
      name2: model.rawName2,
      avatar1: avatar1Icon.textContent,
      avatar2: avatar2Icon.textContent,
      winnerCode: model.profile.code,
      winnerLabel: model.profile.label,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    // Avoid exact duplicate at top
    if (history.length === 0 || history[0].name1 !== item.name1 || history[0].name2 !== item.name2) {
      history.unshift(item);
      if (history.length > 20) history.pop();
      localStorage.setItem('flames_history', JSON.stringify(history));
      renderHistory();
    }
  }

  function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = '';

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <span>💌 No couples tested yet. Enter your names above to make history!</span>
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <div class="history-names">
          <span>${item.avatar1 || '👑'} ${item.name1}</span>
          <span style="color:var(--primary);">&amp;</span>
          <span>${item.avatar2 || '👸'} ${item.name2}</span>
        </div>
        <div class="history-actions">
          <span class="history-outcome-badge">${item.winnerLabel}</span>
          <span class="history-date">${item.date}</span>
          <button class="history-replay-btn" title="Replay match">🔄</button>
        </div>
      `;

      el.querySelector('.history-replay-btn').addEventListener('click', () => {
        name1Input.value = item.name1;
        name2Input.value = item.name2;
        if (item.avatar1) avatar1Icon.textContent = item.avatar1;
        if (item.avatar2) avatar2Icon.textContent = item.avatar2;
        const model = computeFlamesModel(item.name1, item.name2);
        runStepByStepAnimation(model);
        audio.playClick();
      });

      historyList.appendChild(el);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('flames_history');
    renderHistory();
    showToast('History cleared', '🗑️');
    audio.playClick();
  });

  renderHistory();

  // --- FATE SPINNER WHEEL MINI-GAME ---
  const WHEEL_SLICES = [
    { title: 'Midnight Pizza Date', desc: 'Order cheesy pizza & stream your favorite movie!', emoji: '🍕', color: '#ff758c' },
    { title: 'Blanket Fort Movie', desc: 'Build a giant blanket fort with pillows & fairy lights.', emoji: '🍿', color: '#ff7eb3' },
    { title: 'Karaoke Duet Battle', desc: 'Sing your hearts out to guilty pleasure pop songs.', emoji: '🎤', color: '#70a6ff' },
    { title: 'Stargazing Walk', desc: 'Take an evening stroll & talk about your wildest dreams.', emoji: '🌌', color: '#845ec2' },
    { title: 'Cook a 3-Course Feast', desc: 'Team up in the kitchen to cook a gourmet dinner.', emoji: '🍝', color: '#ff9671' },
    { title: 'Arcade / Board Game Duel', desc: 'Challenge each other! Winner gets breakfast in bed.', emoji: '🎮', color: '#ffc75f' },
    { title: 'Sunset Coffee & Pastries', desc: 'Visit a cozy cafe and grab iced lattes & croissants.', emoji: '☕', color: '#00c9a7' },
    { title: 'Spontaneous Road Trip', desc: 'Drive to a scenic lookout or ice-cream spot nearby.', emoji: '🚗', color: '#f9f871' }
  ];

  function drawWheel(angle = 0) {
    const w = fateWheelCanvas.width;
    const h = fateWheelCanvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = w / 2 - 10;
    const sliceAngle = (2 * Math.PI) / WHEEL_SLICES.length;

    const wctx = fateWheelCanvas.getContext('2d');
    wctx.clearRect(0, 0, w, h);

    WHEEL_SLICES.forEach((slice, i) => {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice sector
      wctx.beginPath();
      wctx.moveTo(centerX, centerY);
      wctx.arc(centerX, centerY, radius, startAngle, endAngle);
      wctx.closePath();
      wctx.fillStyle = slice.color;
      wctx.fill();
      wctx.lineWidth = 2;
      wctx.strokeStyle = '#ffffff';
      wctx.stroke();

      // Text & Emoji
      wctx.save();
      wctx.translate(centerX, centerY);
      wctx.rotate(startAngle + sliceAngle / 2);
      wctx.textAlign = 'right';
      wctx.fillStyle = '#ffffff';
      wctx.font = 'bold 15px sans-serif';
      wctx.shadowColor = 'rgba(0,0,0,0.5)';
      wctx.shadowBlur = 4;
      wctx.fillText(`${slice.emoji} ${slice.title.slice(0, 12)}`, radius - 16, 5);
      wctx.restore();
    });

    // Center Hub
    wctx.beginPath();
    wctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    wctx.fillStyle = '#ffffff';
    wctx.fill();
    wctx.lineWidth = 4;
    wctx.strokeStyle = '#ff4081';
    wctx.stroke();

    wctx.fillStyle = '#ff4081';
    wctx.font = '16px sans-serif';
    wctx.textAlign = 'center';
    wctx.textBaseline = 'middle';
    wctx.fillText('💖', centerX, centerY);
  }

  drawWheel(0);

  spinWheelBtn.addEventListener('click', () => {
    if (isWheelSpinning) return;
    isWheelSpinning = true;
    spinWheelBtn.disabled = true;
    wheelResultBox.classList.add('hidden');

    const totalSpins = 5 + Math.random() * 5;
    const randomStopAngle = Math.random() * 2 * Math.PI;
    const targetAngle = wheelAngle + totalSpins * 2 * Math.PI + randomStopAngle;
    const duration = 4000;
    const startTime = performance.now();
    const startAngle = wheelAngle;

    let lastTickSlice = -1;

    function animateWheel(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      wheelAngle = startAngle + (targetAngle - startAngle) * easeOut;
      drawWheel(wheelAngle);

      // Sound ticks on sector passing
      const currentSliceIdx = Math.floor(((wheelAngle % (2 * Math.PI)) / (2 * Math.PI)) * WHEEL_SLICES.length);
      if (currentSliceIdx !== lastTickSlice) {
        audio.playWheelTick();
        lastTickSlice = currentSliceIdx;
      }

      if (progress < 1) {
        requestAnimationFrame(animateWheel);
      } else {
        isWheelSpinning = false;
        spinWheelBtn.disabled = false;
        // Determine winning slice (pin is at top = -PI/2)
        const normalizedAngle = (2 * Math.PI - (wheelAngle % (2 * Math.PI)) - Math.PI / 2 + 4 * Math.PI) % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / WHEEL_SLICES.length;
        const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % WHEEL_SLICES.length;
        const winner = WHEEL_SLICES[winnerIndex];

        wheelResultEmoji.textContent = winner.emoji;
        wheelResultTitle.textContent = winner.title;
        wheelResultDesc.textContent = winner.desc;
        wheelResultBox.classList.remove('hidden');

        audio.playWheelWin();
        launchConfetti(50);
      }
    }

    requestAnimationFrame(animateWheel);
  });

  console.log("FLAMES Couple Game Engine initialized successfully! 🔥💖");
})();
