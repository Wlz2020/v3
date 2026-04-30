// ========== 原有代码 ==========
const revealLayer = document.getElementById("imageReveal");
const allFlags = document.querySelectorAll(".place-flag");
const lineSvg = document.getElementById("lineSvg");
const floatCard = document.getElementById("floatCard");
const floatImg = document.getElementById("floatImg");
const floatLabel = document.getElementById("floatLabel");

// 【新增】自定义光标
const customCursor = document.getElementById("customCursor");

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

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isPaused = false;
let currentLine = null,
  currentAnimFrame = null;

const getRem = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize);

// 【修改】updateClip 里同步更新光标位置和悬停状态
function updateClip(x, y) {
  // 光标始终跟随（即使 isPaused 也要移动光标）
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

  // 悬停在 flag 上时光标变色放大
  customCursor.classList.toggle("hover", anyActive);
}

document.addEventListener("mousemove", (e) => updateClip(e.clientX, e.clientY));

document.addEventListener("click", (e) => {
  if (isPaused) {
    if (!floatCard.contains(e.target)) closeCard();
    return;
  }
  triggerClickAtCursor();
});

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

function showCard(name, fx, fy, containerRect) {
  isPaused = true;
  clearLine();
  const themeColor = flagColors[name] || "#FFFFFF";
  const rem = getRem();
  const cardW_px = 3.5 * rem;
  const lineLen_px = 3.0 * rem;
  const goRight = fx + lineLen_px + cardW_px < containerRect.width;
  const dirX = goRight ? 1 : -1;
  const ex = fx + dirX * lineLen_px;
  const ey = fy - 0.4 * rem;

  animateLine(fx, fy, ex, ey, themeColor, () => {
    floatCard.style.display = "flex";
    floatCard.style.left = (ex + (goRight ? 0.15 : -3.65) * rem) / rem + "rem";
    if (name === "E") {
      floatCard.style.top = (ey - 1.5 * rem) / rem + "rem";
    } else {
      floatCard.style.top = (ey - 0.3 * rem) / rem + "rem";
    }
    floatCard.style.borderColor = themeColor;
    floatImg.src = `./flagImages/${name}.png`;
    floatLabel.textContent = `Location ${name} 自定义文字======`;
    const dot = floatCard.querySelector(".float-card-dot");
    dot.style.background = themeColor;
    dot.style.boxShadow = `0 0 0.12rem ${themeColor}`;
    requestAnimationFrame(() => floatCard.classList.add("visible"));
  });
}

function animateLine(x1, y1, x2, y2, color, onComplete) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("class", "flag-line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.style.stroke = color;
  line.style.filter = `drop-shadow(0 0 0.06rem ${color})`;
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
    if (t < 1) currentAnimFrame = requestAnimationFrame(step);
    else onComplete();
  }
  currentAnimFrame = requestAnimationFrame(step);
}

function closeCard() {
  floatCard.classList.remove("visible");
  setTimeout(() => {
    floatCard.style.display = "none";
    clearLine();
    isPaused = false;
  }, 280);
}

function clearLine() {
  if (currentLine) {
    currentLine.remove();
    currentLine = null;
  }
  if (currentAnimFrame) cancelAnimationFrame(currentAnimFrame);
}

window.addEventListener("resize", () => {
  closeCard();
  updateClip(window.innerWidth / 2, window.innerHeight / 2);
});

updateClip(window.innerWidth / 2, window.innerHeight / 2);

// ========== 头控模块 ==========
// ========== 头控模块（稳定器 1:1 对齐项目1，加死区） ==========
const HEAD_STABI = {
  sensibility: 0.0015, // 与项目1完全一致
  am: 0.92, // 与项目1完全一致
  pow: 0.8, // 与项目1完全一致
  DEAD_ZONE: 3, // 【新增】头部抖动死区，小于此角度视为静止
  t: Date.now(),
  speed: [0, 0],
  speedAm: [0, 0],
  xy: [window.innerWidth / 2, window.innerHeight / 2],
  isMouthOpen: false,
  mouseClickEnabled: true,
};

function callbackHeadMove(mv) {
  const am = HEAD_STABI.am;
  const t = Date.now();
  const dt = Math.min(t - HEAD_STABI.t, 50);
  HEAD_STABI.t = t;

  // 过滤异常跳变（与项目1一致）
  if (Math.abs(mv.dRx) > 200 || Math.abs(mv.dRy) > 200) return;

  if (!isPaused) {
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
      HEAD_STABI.sensibility *
      dt *
      Math.pow(Math.abs(HEAD_STABI.speedAm[1]), 2) *
      Math.sign(HEAD_STABI.speedAm[1]);
    HEAD_STABI.xy[1] -=
      HEAD_STABI.sensibility *
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

HeadControls.init({
  canvasId: "headControlsCanvas",
  callbackMove: callbackHeadMove,
  callbackReady: function (err) {
    if (err) {
      console.log("HeadControls 初始化失败:", err);
    } else {
      console.log("HeadControls 就绪 ✓");
    }
    HeadControls.toggle(true);
  },
  NNCPath: "./neuralNets/",
  animateDelay: 2,
  disableRestPosition: true,
});
