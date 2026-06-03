const buttons = document.querySelectorAll(".controls button");
const patterns = document.querySelectorAll(".pattern");
let finalTimer = null;

function layoutOrbitWords(pattern) {
  const words = pattern.querySelectorAll(".orbit-word");
  const orbitArea = pattern.querySelector(".orbit-words");
  const logo = pattern.querySelector(".opening-logo-img");
  if (!words.length || !orbitArea || !logo) return;

  const isMobile = window.innerWidth <= 768;
  const orbitRect = orbitArea.getBoundingClientRect();
  const logoRect = logo.getBoundingClientRect();
  const anchorX = orbitRect.width / 2;
  const anchorY = orbitRect.height * (isMobile ? 0.39 : 0.42);

  const logoWidth = logoRect.width;
  const logoHeight = logoRect.height;
  const baseRadius = Math.max(
    Math.max(logoWidth, logoHeight) * (isMobile ? 1.15 : 1.28),
    isMobile ? 120 : 180
  );

  // Upper-half circular arrangement around the logo.
  const slotAngles = isMobile
    ? [198, 218, 238, 258, 278, 298, 318, 338, 358]
    : [196, 214, 232, 250, 268, 286, 304, 322, 340];

  const slotScale = [1.02, 1.0, 0.99, 0.98, 0.98, 0.98, 0.99, 1.0, 1.02];

  words.forEach((word, index) => {
    const angleDeg = slotAngles[index % slotAngles.length];
    const angle = (angleDeg * Math.PI) / 180;
    const radius = baseRadius * slotScale[index % slotScale.length];
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const driftX = (Math.cos(angle) * (isMobile ? 4 : 5)).toFixed(1) + "px";
    const driftY = (Math.sin(angle) * (isMobile ? 3 : 4)).toFixed(1) + "px";
    const rotate = (Math.cos(angle) * 1.6).toFixed(1) + "deg";
    const delay = (0.68 + index * 0.09).toFixed(2) + "s";

    word.style.setProperty("--x", `${x.toFixed(1)}px`);
    word.style.setProperty("--y", `${y.toFixed(1)}px`);
    word.style.setProperty("--drift-x", driftX);
    word.style.setProperty("--drift-y", driftY);
    word.style.setProperty("--rotate", rotate);
    word.style.setProperty("--delay", delay);
  });
}


function restartAnimations(pattern) {
  pattern.getAnimations({ subtree: true }).forEach((animation) => {
    animation.cancel();
    animation.play();
  });
}

function showFinalImage(pattern) {
  clearTimeout(finalTimer);
  pattern.classList.remove("show-final");
  const delay = Number(pattern.dataset.finalDelay || 4300);

  finalTimer = setTimeout(() => {
    pattern.classList.add("show-final");
  }, delay);
}

function activatePattern(target) {
  clearTimeout(finalTimer);

  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === target);
  });

  patterns.forEach((pattern) => {
    const isActive = pattern.dataset.pattern === target;
    pattern.classList.toggle("active", isActive);
    pattern.classList.remove("show-final");

    if (isActive) {
      if (pattern.dataset.pattern === "logo-reveal") {
        layoutOrbitWords(pattern);
      }

      requestAnimationFrame(() => {
        restartAnimations(pattern);
        showFinalImage(pattern);
      });
    }
  });
}

buttons.forEach((button) => {
  button.addEventListener("click", () => activatePattern(button.dataset.target));
});

const initialPattern = document.querySelector(".pattern.active");
if (initialPattern) {
  showFinalImage(initialPattern);
}


window.addEventListener("resize", () => {
  const activePattern = document.querySelector(".pattern.active");
  if (activePattern?.dataset.pattern === "logo-reveal") {
    layoutOrbitWords(activePattern);
  }
});
