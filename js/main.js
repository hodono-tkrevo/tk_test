(() => {
  const params = new URLSearchParams(window.location.search);
  const opFonts = ["a", "b", "c", "d"];
  const romanFonts = ["din", "oswald", "barlow", "montserrat", "bebas"];

  const opfont = opFonts.includes(params.get("opfont")) ? params.get("opfont") : "a";
  const romanfont = romanFonts.includes(params.get("romanfont")) ? params.get("romanfont") : "din";

  document.body.classList.remove(...opFonts.map((v) => `opfont-${v}`));
  document.body.classList.remove(...romanFonts.map((v) => `romanfont-${v}`));
  document.body.classList.add(`opfont-${opfont}`, `romanfont-${romanfont}`);

  document.querySelectorAll("[data-opfont]").forEach((a) => {
    const value = a.dataset.opfont;
    const url = new URL(window.location.href);
    url.searchParams.set("opfont", value);
    url.searchParams.set("romanfont", romanfont);
    url.searchParams.set("oppreview", "1");
    a.href = url.toString();
    if (value === opfont) a.classList.add("is-active");
  });

  document.querySelectorAll("[data-romanfont]").forEach((a) => {
    const value = a.dataset.romanfont;
    const url = new URL(window.location.href);
    url.searchParams.set("opfont", opfont);
    url.searchParams.set("romanfont", value);
    url.searchParams.set("oppreview", "1");
    a.href = url.toString();
    if (value === romanfont) a.classList.add("is-active");
  });

  if (params.get("oppreview") === "1" || params.get("replay") === "1") {
    localStorage.removeItem("baseOpeningPlayed");
  }
})();

(() => {
  const STORAGE_KEY = "baseOpeningPlayed";
  const opening = document.querySelector(".opening.persol-settle");
  if (!opening) return;

  const runOpening = () => {
    opening.classList.remove("is-hidden-initial", "is-hide", "show-final", "show-message-two", "show-settle");

    const finalDelay = Number(opening.dataset.finalDelay || 1100);
    const swapDelay = Number(opening.dataset.swapDelay || 3200);
    const settleDelay = Number(opening.dataset.settleDelay || 4400);
    const hideDelay = settleDelay + 2600;

    setTimeout(() => opening.classList.add("show-final"), finalDelay);
    setTimeout(() => opening.classList.add("show-message-two"), swapDelay);
    setTimeout(() => opening.classList.add("show-settle"), settleDelay);
    setTimeout(() => {
      opening.classList.add("is-hide");
      setTimeout(() => opening.remove(), 140);
    }, hideDelay);
  };

  if (localStorage.getItem(STORAGE_KEY) === "true") {
    opening.classList.add("is-hidden-initial");
  } else {
    localStorage.setItem(STORAGE_KEY, "true");
    window.addEventListener("load", runOpening);
  }

  document.querySelector(".js-replay")?.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("oppreview", "1");
    window.location.href = url.toString();
  });
})();
