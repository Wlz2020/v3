// ========== 基础 ==========
const revealLayer = document.getElementById("imageReveal");
const allFlags = document.querySelectorAll(".place-flag");
const lineSvg = document.getElementById("lineSvg");
const floatCard = document.getElementById("floatCard");
const floatImg = document.getElementById("floatImg");
const floatLabel = document.getElementById("floatLabel");
const customCursor = document.getElementById("customCursor");

// ========== 颜色 ==========
const flagColors = {
  A: "#FF4D4D",
  B: "#4D94FF",
  C: "#4DFF88",
  D: "#FFD700",
  E: "#FF8C00",
  F: "#BA55D3",
  G: "#00CED1",
  H: "#F08080",
  I: "#FF4D4D",
};

// ========== 内容 ==========

const guernicaMap = {
  A: "公牛<br> 暴力 / 野蛮 / 冷漠<br> 西班牙民族象征<br> 特点：冷静、几乎无情绪",
  D: "受伤的马<br> 被刺穿、张嘴嘶吼<br><br> 象征：人民 / 受害者",
  B: "母亲与死去的孩子<br> 仰头嘶吼，孩子瘫软<br><br> 象征：无辜平民",
  F: "灯泡<br> 像眼睛一样俯视<br><br> 象征：科技 / 现代战争",
  G: "手持蜡烛的女人<br> 从窗口探出<br><br> 象征：人性之光 / 希望",
  H: "惊恐逃跑的女人<br> 身体扭曲、奔跑<br><br> 象征：恐慌 / 无处可逃",
  I: "火中呼救的女人<br> 双手举起<br><br> 象征：被吞噬的生命",
  C: "倒下的士兵<br> 身体断裂，手持断剑<br><br> 象征：失败 / 抵抗崩塌",
  E: "断剑旁的小花<br> 很小但关键<br><br> 象征：希望 / 重生可能",
};

const guernicaEnMap = {
  A: "The Bull<br>A cold personification of brutality and barbarism. As a symbol of Spain, it remains chillingly detached and devoid of emotion.",
  D: "The Wounded Horse<br>Pierced and let out a silent scream. It stands as a harrowing symbol of the suffering masses.",
  B: "Mother with Dead Child<br> Wailing toward the heavens with a limp child in her arms. A raw embodiment of the innocent lives lost.",
  F: "The Lightbulb<br>A watchful, lidless eye looming overhead. It signifies the cold, clinical nature of modern warfare.",
  G: "Woman with Candle<br>Emerging from the shadows to bear witness. She represents the flickering light of humanity and hope.",
  H: "Panicking Woman<br>Her body contorted in a desperate flight. She captures the sheer terror of having nowhere to run.",
  I: "Woman in Fire<br>Arms thrust upward in a final plea. A symbol of lives being consumed by the flames of war.",
  C: "Fallen Soldier<br>A dismembered figure clutching a shattered blade. He marks the crushing defeat and the collapse of resistance.",
  E: "Little Flower<br>The Little Flower: A fragile yet defiant bloom by the broken sword. It hints at the faint possibility of rebirth and hope.",
};

// ========== 灵敏度（全局） ==========
let HEAD_SENSIBILITY = 0.0015;

const SENS_MIN = 0.001;
const SENS_MAX = 0.015;
const SENS_STEP = 0.0005;

// ========== 控制模式 ==========
let CONTROL_MODE = "HEAD"; // "HEAD" | "MOUSE"

// ========== 状态 ==========
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isPaused = false;
let currentLine = null;
let currentAnimFrame = null;

const getRem = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();

    CONTROL_MODE = CONTROL_MODE === "HEAD" ? "MOUSE" : "HEAD";

    HEAD_STABI.xy = [mouseX, mouseY];
    // HEAD_STABI.speedAm = [0, 0];
    // HEAD_STABI.speed = [0, 0];

    showModeUI();
  }
});

document.addEventListener(
  "wheel",
  (e) => {
    if (CONTROL_MODE !== "HEAD") return;

    e.preventDefault();

    if (e.deltaY < 0) {
      // 向上滚：增加灵敏度
      HEAD_SENSIBILITY += SENS_STEP;
    } else {
      // 向下滚：降低灵敏度
      HEAD_SENSIBILITY -= SENS_STEP;
    }

    HEAD_SENSIBILITY = Math.max(SENS_MIN, Math.min(SENS_MAX, HEAD_SENSIBILITY));

    showSensUI();
  },
  { passive: false }
);

let sensUI = null;
let sensTimer = null;

function showSensUI() {
  if (!sensUI) {
    sensUI = document.createElement("div");
    sensUI.style.position = "fixed";
    sensUI.style.bottom = "40px";
    sensUI.style.left = "50%";
    sensUI.style.transform = "translateX(-50%)";
    sensUI.style.padding = "8px 16px";
    sensUI.style.background = "rgba(0,0,0,0.7)";
    sensUI.style.color = "#fff";
    sensUI.style.fontSize = "14px";
    sensUI.style.borderRadius = "20px";
    sensUI.style.zIndex = 9999;
    sensUI.style.pointerEvents = "none";
    sensUI.style.transition = "opacity 0.2s";

    document.body.appendChild(sensUI);
  }

  sensUI.innerHTML = `Sensitivity: ${HEAD_SENSIBILITY.toFixed(4)}`;
  sensUI.style.opacity = "1";

  clearTimeout(sensTimer);
  sensTimer = setTimeout(() => {
    sensUI.style.opacity = "0";
  }, 800);
}

// ========== 光标 & Reveal ==========
function updateClip(x, y) {
  customCursor.style.left = x + "px";
  customCursor.style.top = y + "px";

  if (isPaused) return;

  mouseX = x;
  mouseY = y;

  const radius = 1.2 * getRem();
  revealLayer.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

  let anyActive = false;

  allFlags.forEach((flag) => {
    const rect = flag.getBoundingClientRect();
    const dist = Math.sqrt(
      (x - (rect.left + rect.width / 2)) ** 2 +
        (y - (rect.top + rect.height / 2)) ** 2
    );

    const active = dist < radius;
    flag.classList.toggle("active", active);
    if (active) anyActive = true;
  });

  customCursor.classList.toggle("hover", anyActive);
}

let modeUI = null;
let modeTimer = null;

function showModeUI() {
  if (!modeUI) {
    modeUI = document.createElement("div");
    modeUI.style.position = "fixed";
    modeUI.style.top = "40px";
    modeUI.style.left = "50%";
    modeUI.style.transform = "translateX(-50%)";
    modeUI.style.padding = "10px 20px";
    modeUI.style.background = "rgba(0,0,0,0.7)";
    modeUI.style.color = "#fff";
    modeUI.style.fontSize = "16px";
    modeUI.style.borderRadius = "20px";
    modeUI.style.zIndex = 9999;
    modeUI.style.pointerEvents = "none";
    modeUI.style.transition = "opacity 0.2s";

    document.body.appendChild(modeUI);
  }

  modeUI.innerHTML =
    CONTROL_MODE === "HEAD" ? "🎯 Head Control" : "🖱️ Mouse Control";

  modeUI.style.opacity = "1";

  clearTimeout(modeTimer);
  modeTimer = setTimeout(() => {
    modeUI.style.opacity = "0";
  }, 1000);
}

// ========== 鼠标 ==========
let mousePending = false;
document.addEventListener("mousemove", (e) => {
  if (CONTROL_MODE !== "MOUSE") return;

  mouseX = e.clientX;
  mouseY = e.clientY;

  if (!mousePending) {
    mousePending = true;
    requestAnimationFrame(() => {
      updateClip(mouseX, mouseY);
      mousePending = false;
    });
  }
});

document.addEventListener("click", (e) => {
  if (CONTROL_MODE !== "MOUSE") return;

  if (isPaused) {
    if (!floatCard.contains(e.target)) closeCard();
    return;
  }
  triggerClickAtCursor();
});

// ========== 点击检测 ==========
function triggerClickAtCursor() {
  if (isPaused) {
    closeCard();
    return;
  }

  const rem = getRem();
  const radius = 1.2 * rem;

  let closestFlag = null;
  let minDist = Infinity;

  allFlags.forEach((flag) => {
    const rect = flag.getBoundingClientRect();
    const fx = rect.left + rect.width / 2;
    const fy = rect.top + rect.height / 2;

    const dist = Math.sqrt((mouseX - fx) ** 2 + (mouseY - fy) ** 2);

    if (dist < radius && dist < minDist) {
      minDist = dist;
      closestFlag = flag;
    }
  });

  if (closestFlag) {
    const name = closestFlag.textContent.trim();
    const rect = closestFlag.getBoundingClientRect();
    const containerRect = document
      .querySelector(".container")
      .getBoundingClientRect();

    showCard(
      name,
      rect.left - containerRect.left + rect.width / 2,
      rect.top - containerRect.top + rect.height / 2,
      containerRect
    );
  }
}

// ========== 卡片 ==========
function showCard(name, fx, fy, containerRect) {
  isPaused = true;
  clearLine();

  const themeColor = flagColors[name] || "#FFF";
  const rem = getRem();
  const timestamp = Date.now();

  const cardW = 3.5 * rem;
  const lineLen = 3.0 * rem;

  const goRight = fx + lineLen + cardW < containerRect.width;
  const dirX = goRight ? 1 : -1;

  const ex = fx + dirX * lineLen;
  const ey = fy - 0.4 * rem;

  animateLine(fx, fy, ex, ey, themeColor, () => {
    floatCard.style.display = "flex";

    floatCard.style.left = (ex + (goRight ? 0.15 : -3.65) * rem) / rem + "rem";

    if (name === "E") {
      floatCard.style.top = (ey - 1.2 * rem) / rem + "rem";
    } else if (name === "C") {
      floatCard.style.top = (ey - 2 * rem) / rem + "rem";
    } else {
      floatCard.style.top = (ey - 0.3 * rem) / rem + "rem";
    }

    if (name === "G") {
      // 选中 floatCard 下的 img 元素
      const cardImg = floatCard.querySelector('img');
      
      if (cardImg) {
          cardImg.style.objectFit = "cover"; 
          cardImg.style.objectPosition = "left top";
      }
    }

    floatCard.style.borderColor = themeColor;

    // 图片
    floatImg.src = `./flagImages/${name}.png?t=${timestamp}`;

    // 文案
    floatLabel.innerHTML = guernicaEnMap[name] || name;

    // 点
    const dot = floatCard.querySelector(".float-card-dot");
    dot.style.background = themeColor;
    dot.style.boxShadow = `0 0 0.12rem ${themeColor}`;

    requestAnimationFrame(() => floatCard.classList.add("visible"));
  });
}

// ========== 连线 ==========
function animateLine(x1, y1, x2, y2, color, onComplete) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);

  line.style.stroke = color;

  lineSvg.appendChild(line);

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  line.style.strokeDasharray = length;
  line.style.strokeDashoffset = length;

  currentLine = line;

  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / 400, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    line.style.strokeDashoffset = length * (1 - ease);

    if (t < 1) requestAnimationFrame(step);
    else onComplete();
  }

  requestAnimationFrame(step);
}

// ========== 关闭 ==========
function closeCard() {
  floatCard.classList.remove("visible");

  setTimeout(() => {
    floatCard.style.display = "none";
    clearLine();
    isPaused = false;
  }, 280);
}

function clearLine() {
  if (currentLine) currentLine.remove();
}

// ========== resize ==========
window.addEventListener("resize", () => {
  closeCard();
  updateClip(window.innerWidth / 2, window.innerHeight / 2);
});

updateClip(window.innerWidth / 2, window.innerHeight / 2);

// ========== 头控 ==========
const HEAD_STABI = {
  am: 0.92,
  pow: 0.8,
  DEAD_ZONE: 3,
  t: Date.now(),
  speed: [0, 0],
  speedAm: [0, 0],
  xy: [window.innerWidth / 2, window.innerHeight / 2],
  isMouthOpen: false,
  mouseClickEnabled: true,
};

function callbackHeadMove(mv) {
  if (CONTROL_MODE !== "HEAD") return;

  const am = HEAD_STABI.am;
  const t = Date.now();
  const dt = Math.min(t - HEAD_STABI.t, 50);
  HEAD_STABI.t = t;

  // 过滤异常跳变（与项目1一致）
  if (Math.abs(mv.dRx) > 200 || Math.abs(mv.dRy) > 200) return;

  if (!isPaused && CONTROL_MODE === "HEAD") {
    // 【关键修复】加死区：头部微小抖动时，视为 0，不积累速度
    const dRx = Math.abs(mv.dRx) < HEAD_STABI.DEAD_ZONE ? 0 : mv.dRx;
    const dRy = Math.abs(mv.dRy) < HEAD_STABI.DEAD_ZONE ? 0 : mv.dRy;

    // 与项目1完全相同的速度计算
    HEAD_STABI.speed[0] =
      -Math.pow(Math.abs(dRx), HEAD_STABI.pow) * Math.sign(dRx);
    HEAD_STABI.speed[1] =
      -Math.pow(Math.abs(dRy), HEAD_STABI.pow) * Math.sign(dRy);

    // 惯性滤波
    HEAD_STABI.speedAm[0] =
      HEAD_STABI.speedAm[0] * am + (1 - am) * HEAD_STABI.speed[0];
    HEAD_STABI.speedAm[1] =
      HEAD_STABI.speedAm[1] * am + (1 - am) * HEAD_STABI.speed[1];

    // 【关键修复】死区也作用于平滑后的速度：绝对值极小时强制归零，防止永远微漂
    if (Math.abs(HEAD_STABI.speedAm[0]) < 0.05) HEAD_STABI.speedAm[0] = 0;
    if (Math.abs(HEAD_STABI.speedAm[1]) < 0.05) HEAD_STABI.speedAm[1] = 0;

    const MAX_SPEED = 25;
    HEAD_STABI.speedAm[0] = Math.max(
      Math.min(HEAD_STABI.speedAm[0], MAX_SPEED),
      -MAX_SPEED
    );
    HEAD_STABI.speedAm[1] = Math.max(
      Math.min(HEAD_STABI.speedAm[1], MAX_SPEED),
      -MAX_SPEED
    );

    HEAD_STABI.xy[0] +=
      HEAD_SENSIBILITY *
      dt *
      Math.pow(Math.abs(HEAD_STABI.speedAm[1]), 2) *
      Math.sign(HEAD_STABI.speedAm[1]);

    HEAD_STABI.xy[1] -=
      HEAD_SENSIBILITY *
      (window.innerWidth / window.innerHeight) *
      dt *
      Math.pow(Math.abs(HEAD_STABI.speedAm[0]), 2) *
      Math.sign(HEAD_STABI.speedAm[0]);

    const PADDING = 150;
    HEAD_STABI.xy[0] = Math.max(
      PADDING,
      Math.min(HEAD_STABI.xy[0], window.innerWidth - PADDING)
    );
    HEAD_STABI.xy[1] = Math.max(
      PADDING,
      Math.min(HEAD_STABI.xy[1], window.innerHeight - PADDING)
    );

    updateClip(HEAD_STABI.xy[0], HEAD_STABI.xy[1]);
  }

  // 张嘴检测
  const mouthOpenValue = mv.expressions[0];
  const threshold = 0.5;

  if (mouthOpenValue > threshold) {
    if (!HEAD_STABI.isMouthOpen && HEAD_STABI.mouseClickEnabled) {
      customCursor.classList.add("clicking");
      setTimeout(() => customCursor.classList.remove("clicking"), 200);

      triggerClickAtCursor();
      HEAD_STABI.isMouthOpen = true;
      HEAD_STABI.mouseClickEnabled = false;
      setTimeout(() => {
        HEAD_STABI.mouseClickEnabled = true;
      }, 600);
    }
  } else {
    HEAD_STABI.isMouthOpen = false;
  }
}

// ========== 初始化 ==========
HeadControls.init({
  canvasId: "headControlsCanvas",
  callbackMove: callbackHeadMove,
  callbackReady: function (err) {
    if (err) {
      console.log("初始化失败", err);
    } else {
      console.log("HeadControls 就绪 ✓");
      HeadControls.toggle(true);
    }
  },
  NNCPath: "./neuralNets/",
});
