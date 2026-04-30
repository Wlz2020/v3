const revealLayer = document.getElementById("imageReveal");
const allFlags = document.querySelectorAll(".place-flag");
const lineSvg = document.getElementById("lineSvg");
const floatCard = document.getElementById("floatCard");
const floatImg = document.getElementById("floatImg");
const floatLabel = document.getElementById("floatLabel");

const flagColors = {
  "A": "#FF4D4D", "B": "#4D94FF", "C": "#4DFF88", "D": "#FFD700",
  "E": "#FF8C00", "F": "#BA55D3", "G": "#00CED1", "H": "#F08080", "I": "#FF4D4D"
};

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isPaused = false;
let currentLine = null, currentAnimFrame = null;

// 获取当前 1rem 对应的像素值 (基于 1920 方案)
const getRem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

function updateClip(x, y) {
  if (isPaused) return;
  mouseX = x; mouseY = y;
  const radius = 1.2 * getRem();
  revealLayer.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

  allFlags.forEach(flag => {
    const rect = flag.getBoundingClientRect();
    const dist = Math.sqrt((x - (rect.left + rect.width / 2)) ** 2 + (y - (rect.top + rect.height / 2)) ** 2);
    flag.classList.toggle("active", dist < radius);
  });
}

document.addEventListener("mousemove", (e) => updateClip(e.clientX, e.clientY));

document.addEventListener("click", (e) => {
  // 如果已经打开了卡片，点击任意位置（除卡片本身）则关闭
  if (isPaused) {
    if (!floatCard.contains(e.target)) closeCard();
    return;
  }

  const rem = getRem();
  const radius = 1.2 * rem;
  let closestFlag = null;
  let minDist = Infinity;

  allFlags.forEach(flag => {
    const rect = flag.getBoundingClientRect();
    const fx = rect.left + rect.width / 2;
    const fy = rect.top + rect.height / 2;
    const dist = Math.sqrt((mouseX - fx) ** 2 + (mouseY - fy) ** 2);
    if (dist < radius && dist < minDist) { minDist = dist; closestFlag = flag; }
  });

  if (closestFlag) {
    const name = closestFlag.textContent.trim();
    const rect = closestFlag.getBoundingClientRect();
    const containerRect = document.querySelector(".container").getBoundingClientRect();
    showCard(name, rect.left - containerRect.left + rect.width / 2, rect.top - containerRect.top + rect.height / 2, containerRect);
  }
});

const guernicaMap = {
  A: "公牛<br>\
暴力 / 野蛮 / 冷漠<br>\
西班牙民族象征<br>\
特点：冷静、几乎无情绪",

  D: "受伤的马<br>\
被刺穿、张嘴嘶吼<br><br>\
象征：人民 / 受害者",

  B: "母亲与死去的孩子<br>\
仰头嘶吼，孩子瘫软<br><br>\
象征：无辜平民",

  F: "灯泡<br>\
像眼睛一样俯视<br><br>\
象征：科技 / 现代战争",

  G: "手持蜡烛的女人<br>\
从窗口探出<br><br>\
象征：人性之光 / 希望",

  H: "惊恐逃跑的女人<br>\
身体扭曲、奔跑<br><br>\
象征：恐慌 / 无处可逃",

  I: "火中呼救的女人<br>\
双手举起<br><br>\
象征：被吞噬的生命",

  C: "倒下的士兵<br>\
身体断裂，手持断剑<br><br>\
象征：失败 / 抵抗崩塌",

  E: "断剑旁的小花<br>\
很小但关键<br><br>\
象征：希望 / 重生可能",
};

const guernicaEnMap = {
  A: "The Bull<br>\
Brutality / Barbarism / Indifference<br>\
Symbol of the Spanish Nation<br>\
Traits: Cold, detached, and devoid of emotion",

  D: "The Wounded Horse<br>\
Pierced and braying in agony<br><br>\
Symbol: The People / The Victims",

  B: "Mother with Dead Child<br>\
Wailing toward the heavens, the child gone limp<br><br>\
Symbol: Innocent Civilians",

  F: "The Lightbulb<br>\
An all-seeing eye looking down<br><br>\
Symbol: Technology / Modern Warfare",

  G: "Woman with a Candle<br>\
Emerging from the window<br><br>\
Symbol: The Light of Humanity / Hope",

  H: "The Panicking Woman<br>\
Body contorted, caught in mid-flight<br><br>\
Symbol: Terror / No Way Out",

  I: "Woman Trapped in Fire<br>\
Arms raised in a desperate plea<br><br>\
Symbol: Lives Consumed by War",

  C: "The Fallen Soldier<br>\
Shattered body holding a broken sword<br><br>\
Symbol: Defeat / The Collapse of Resistance",

  E: "Little Flower by the Sword<br>\
Small but significant<br><br>\
Symbol: Hope / The Possibility of Rebirth",
};


function showCard(name, fx, fy, containerRect) {
  isPaused = true;
  clearLine();
  const themeColor = flagColors[name] || "#FFFFFF";
  const rem = getRem();
  const timestamp = Date.now();

  const cardW_px = 3.5 * rem;
  const lineLen_px = 3.0 * rem;
  const goRight = fx + lineLen_px + cardW_px < containerRect.width;
  const dirX = goRight ? 1 : -1;

  const ex = fx + dirX * lineLen_px;
  const ey = fy - 0.4 * rem;

  animateLine(fx, fy, ex, ey, themeColor, () => {
    floatCard.style.display = "flex";

    // 设置水平位置
    floatCard.style.left = (ex + (goRight ? 0.15 : -3.65) * rem) / rem + "rem";

    // --- 针对 E 点的单独逻辑 ---
    if (name === "E") {
      floatCard.style.top = (ey - 1.0 * rem) / rem + "rem"; // E 点向上偏移 1rem
    }

    else if (name === "C") {
      floatCard.style.top = (ey - 2.0 * rem) / rem + "rem"; // C 点向上偏移 1rem
    }
    else {
      floatCard.style.top = (ey - 0.3 * rem) / rem + "rem"; // 其他点偏移 0.3rem
    }

    if (name === "G") {
      const img = floatCard.querySelector('img');
      if (img) {
        img.style.objectPosition = "top left";
      }
    }
    floatCard.style.borderColor = themeColor;
    floatImg.src = `./flagImages/${name}.png?t=${timestamp}`;

    if (guernicaEnMap[name]) {
      floatLabel.innerHTML = guernicaEnMap[name];
    }

    const dot = floatCard.querySelector('.float-card-dot');
    dot.style.background = themeColor;
    dot.style.boxShadow = `0 0 0.12rem ${themeColor}`;

    requestAnimationFrame(() => floatCard.classList.add("visible"));
  });
}

function animateLine(x1, y1, x2, y2, color, onComplete) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("class", "flag-line");
  line.setAttribute("x1", x1); line.setAttribute("y1", y1);
  line.setAttribute("x2", x2); line.setAttribute("y2", y2);
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
  if (currentLine) { currentLine.remove(); currentLine = null; }
  if (currentAnimFrame) cancelAnimationFrame(currentAnimFrame);
}

window.addEventListener("resize", () => {
  closeCard();
  updateClip(window.innerWidth / 2, window.innerHeight / 2);
});

updateClip(window.innerWidth / 2, window.innerHeight / 2);