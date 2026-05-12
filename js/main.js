const buttons = document.querySelectorAll(".controls button");
const patterns = document.querySelectorAll(".pattern");

const FINAL_DELAY = 3000; // アニメーション終了時間に合わせて調整
let finalTimer = null;

function restartAnimations(pattern) {
  pattern.getAnimations({ subtree: true }).forEach((animation) => {
    animation.cancel();
    animation.play();
  });
}

function showFinalImage(pattern) {
  clearTimeout(finalTimer);

  pattern.classList.remove("show-final");

  finalTimer = setTimeout(() => {
    pattern.classList.add("show-final");
  }, FINAL_DELAY);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;

    clearTimeout(finalTimer);

    buttons.forEach((item) => item.classList.toggle("active", item === button));

    patterns.forEach((pattern) => {
      const isActive = pattern.dataset.pattern === target;

      pattern.classList.toggle("active", isActive);
      pattern.classList.remove("show-final");

      if (isActive) {
        restartAnimations(pattern);
        showFinalImage(pattern);
      }
    });
  });
});

// 初期表示でも最後に画像を出す
const initialPattern = document.querySelector(".pattern.active");
if (initialPattern) {
  showFinalImage(initialPattern);
}
