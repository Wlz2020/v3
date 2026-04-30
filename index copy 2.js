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
  A: "The Bull<br>Brutality / Barbarism / Indifference<br>Symbol of the Spanish Nation",
  D: "The Wounded Horse<br>Pierced and suffering<br>Symbol: The People",
  B: "Mother with Dead Child<br>Symbol: Innocent Civilians",
  F: "The Lightbulb<br>Symbol: Modern War",
  G: "Woman with Candle<br>Symbol: Hope",
  H: "Panicking Woman<br>Symbol: Terror",
  I: "Woman in Fire<br>Symbol: Destruction",
  C: "Fallen Soldier<br>Symbol: Collapse",
  E: "Little Flower<br>Symbol: Hope / Rebirth",
};

// ========== 状态 ==========
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isPaused = false;
let currentLine = null;
let currentAnimFrame = null;

const getRem = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize);

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

// ========== 鼠标 ==========
document.addEventListener("mousemove", (e) => {
  updateClip(e.clientX, e.clientY);
});

document.addEventListener("click", (e) => {
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
  sensibility: 0.0015,
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
  const t = Date.now();
  const dt = Math.min(t - HEAD_STABI.t, 50);
  HEAD_STABI.t = t;

  if (Math.abs(mv.dRx) > 200 || Math.abs(mv.dRy) > 200) return;

  if (!isPaused) {
    const dRx = Math.abs(mv.dRx) < 3 ? 0 : mv.dRx;
    const dRy = Math.abs(mv.dRy) < 3 ? 0 : mv.dRy;

    HEAD_STABI.speed[0] = -Math.pow(Math.abs(dRx), 0.8) * Math.sign(dRx);
    HEAD_STABI.speed[1] = -Math.pow(Math.abs(dRy), 0.8) * Math.sign(dRy);

    HEAD_STABI.speedAm[0] =
      HEAD_STABI.speedAm[0] * 0.92 + 0.08 * HEAD_STABI.speed[0];
    HEAD_STABI.speedAm[1] =
      HEAD_STABI.speedAm[1] * 0.92 + 0.08 * HEAD_STABI.speed[1];

    HEAD_STABI.xy[0] += 0.0015 * dt * HEAD_STABI.speedAm[1] * 20;
    HEAD_STABI.xy[1] -= 0.0015 * dt * HEAD_STABI.speedAm[0] * 20;

    updateClip(HEAD_STABI.xy[0], HEAD_STABI.xy[1]);
  }

  // 张嘴点击
  const mouth = mv.expressions[0];

  if (mouth > 0.5) {
    if (!HEAD_STABI.isMouthOpen && HEAD_STABI.mouseClickEnabled) {
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
