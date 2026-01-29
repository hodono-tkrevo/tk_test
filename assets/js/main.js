gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/* =========================================
   0) 横はみ出し対策（必須）
========================================= */
document.documentElement.style.overflowX = "hidden";
document.body.style.overflowX = "hidden";

/* =========================================
   1) STOP（.wwd-visula を下で一回引っかける）
   → 先に作る（後ろの横スク計算を狂わせない）
========================================= */
gsap.registerPlugin(ScrollTrigger);

const visual = document.querySelector(".wwd-visual");
const words = gsap.utils.toArray(".wwd-visual-text .wwd-word");

if (visual && words.length) {
  // 初期表示
  words.forEach((w, i) => {
    gsap.set(w, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 10 });
  });

  ScrollTrigger.create({
    id: "visual-hold",
    trigger: visual,
    start: "top top",

    // 例：1ワードにつき 80vh 分スクロールで切替
    end: () => "+=" + window.innerHeight * 0.8 * (words.length - 1),

    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    refreshPriority: 10,

    onUpdate: (self) => {
      // progress(0-1) -> index(0..words.length-1)
      const idx = Math.round(self.progress * (words.length - 1));

      words.forEach((w, i) => {
        if (i === idx) {
          gsap.to(w, { autoAlpha: 1, y: 0, duration: 0.25, overwrite: "auto" });
        } else {
          gsap.to(w, {
            autoAlpha: 0,
            y: 10,
            duration: 0.25,
            overwrite: "auto",
          });
        }
      });
    },

    // markers: true,
  });
}

/* =========================================
   2) 横スクロール（.wwd-pin）
========================================= */
const pin = document.querySelector(".wwd-pin");
const wrapper = document.querySelector(".wwd-horizontal");
const track = document.querySelector(".wwd-track");

if (pin && wrapper && track) {
  const dist = () => Math.max(track.scrollWidth - wrapper.clientWidth, 0);

  ScrollTrigger.matchMedia({
    // PC/SP 共通でOKならまとめてこれでいい
    "(min-width: 0px)": () => {
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          id: "wwd-horizontal",
          trigger: pin,
          start: "top top",
          end: () => `+=${dist()}`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 0,
          // markers: true,
        },
      });
    },
  });
}

/* =========================================
   3) 惰性モメンタム（.js-momentum）
   → ScrollTrigger壊さない“見た目だけ”transform
========================================= */
(() => {
  const els = [...document.querySelectorAll(".js-momentum")];
  if (!els.length) return;

  const active = new Set();

  // 画面内判定
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  };

  let last = window.scrollY;
  const current = new Map();
  els.forEach((el) => current.set(el, 0));

  function tick() {
    active.clear();
    els.forEach((el) => {
      if (inView(el)) active.add(el);
    });

    if (active.size) {
      const y = window.scrollY;
      const delta = y - last;
      last = y;

      // ★惰性の強さ（ここだけ触ればOK）
      const strength = 1.2;
      const ease = 0.08;
      const max = 160;

      const target = Math.max(-max, Math.min(max, -delta * strength));

      active.forEach((el) => {
        const c = current.get(el) ?? 0;
        const next = c + (target - c) * ease;
        current.set(el, next);

        el.style.transform = `translate3d(0, ${next}px, 0)`;
        el.style.willChange = "transform";
      });
    }

    requestAnimationFrame(tick);
  }

  tick();
})();

/* =========================================
   4) 最後に1回だけ refresh（超重要）
========================================= */
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

document.addEventListener("DOMContentLoaded", () => {
  if (typeof Swiper === "undefined") {
    console.warn("[KV] Swiper is not loaded.");
    return;
  }

  const root = document.querySelector("#block-kv");
  if (!root) return;

  const swiperEl = root.querySelector(".js-swiperKv");
  if (!swiperEl) {
    console.warn("[KV] .js-swiperKv not found.");
    return;
  }

  let kvSwiper = null;
  const mq = window.matchMedia("(max-width: 768px)");

  const getControls = (isSP) => {
    const nextEl = isSP
      ? root.querySelector(".kv-sp-arrow-next")
      : root.querySelector(".kv-arrow-next");

    const prevEl = isSP
      ? root.querySelector(".kv-sp-arrow-prev")
      : root.querySelector(".kv-arrow-prev");

    const pagEl = isSP
      ? root.querySelector(".kv-sp-dots")
      : root.querySelector(".kv-dots");

    return { nextEl, prevEl, pagEl };
  };

  const init = () => {
    // 既存があれば破棄（切替のため）
    if (kvSwiper) {
      kvSwiper.destroy(true, true);
      kvSwiper = null;
    }

    const isSP = mq.matches;
    const { nextEl, prevEl, pagEl } = getControls(isSP);

    kvSwiper = new Swiper(swiperEl, {
      speed: 600,
      loop: true,
      slidesPerView: 1,

      navigation: {
        nextEl,
        prevEl,
      },

      pagination: pagEl
        ? {
            el: pagEl,
            clickable: true,
          }
        : undefined,

      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
    });
  };

  init();

  // 画面幅が変わったら再初期化してSP/PCを切替
  mq.addEventListener("change", init);
});

// ハンバーガー
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".header-menu-btn");
  const panel = document.getElementById("globalMenu");
  const overlay = document.querySelector("[data-menu-overlay]");
  const closeBtn = document.querySelector("[data-menu-close]");

  if (!btn || !panel || !overlay) return;

  let scrollY = 0;

  const lockScroll = () => {
    scrollY = window.scrollY || window.pageYOffset;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockScroll = () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  };

  const openMenu = () => {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    lockScroll();
  };

  const closeMenu = () => {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    overlay.hidden = true;
    unlockScroll();
  };

  const isOpen = () => panel.classList.contains("is-open");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  panel.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  // リサイズで状態リセット
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (isOpen()) closeMenu();
    }, 100);
  });
});
