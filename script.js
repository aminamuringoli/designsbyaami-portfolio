const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const themeButton = document.querySelector("#theme-lamp");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (!window.location.hash) {
  window.scrollTo(0, 0);
}

const setTheme = (theme) => {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeButton?.setAttribute("aria-pressed", String(isDark));
  themeButton?.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  const themeLabel = themeButton?.querySelector(".hero-theme-toggle__label");
  if (themeLabel) themeLabel.textContent = isDark ? "Light" : "Dark";
};

try {
  const savedTheme = localStorage.getItem("amina-theme");
  setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light");
} catch {
  setTheme("light");
}

function buildFlower(element) {
  if (element.dataset.ready === "true") return;
  const requestedPetals = Number.parseInt(element.style.getPropertyValue("--petals"), 10) || 7;
  const tilt = Number.parseFloat(element.style.getPropertyValue("--tilt")) || 0;
  const seed = Number.parseInt(element.dataset.seed || "0", 10);
  const petalColor = element.style.getPropertyValue("--petal").trim() || "#ff1f25";
  const centerColor = element.style.getPropertyValue("--center").trim() || "#f6f5f1";
  const variants = [
    { petals: 6, base: 70, amp: 44, power: 0.52, wobbleA: 6, wobbleB: 2, centerX: 26, centerY: 19 },
    { petals: 5, base: 77, amp: 38, power: 0.42, wobbleA: 7, wobbleB: 5, centerX: 24, centerY: 20 },
    { petals: 10, base: 77, amp: 26, power: 0.86, wobbleA: 5, wobbleB: 4, centerX: 20, centerY: 18 },
    { petals: 5, base: 72, amp: 45, power: 0.35, wobbleA: 5, wobbleB: 3, centerX: 25, centerY: 22 },
    { petals: 7, base: 74, amp: 35, power: 0.68, wobbleA: 8, wobbleB: 2, centerX: 22, centerY: 18 },
    { petals: 8, base: 70, amp: 39, power: 1.08, wobbleA: 4, wobbleB: 5, centerX: 18, centerY: 16 },
    { petals: 6, base: 80, amp: 31, power: 0.58, wobbleA: 7, wobbleB: 4, centerX: 30, centerY: 21 },
    { petals: 7, base: 68, amp: 48, power: 1.18, wobbleA: 3, wobbleB: 6, centerX: 21, centerY: 17 },
  ];
  const variant = variants[(seed - 1) % variants.length];
  const petals = requestedPetals === 8 || requestedPetals === 9 ? variant.petals : Math.max(5, Math.min(10, variant.petals));
  element.classList.add("flower");
  element.style.setProperty("--petals", petals);

  const steps = petals * 14;
  const points = [];
  for (let point = 0; point < steps; point += 1) {
    const angle = (point / steps) * Math.PI * 2 - Math.PI / 2;
    const wave = (1 + Math.cos(petals * angle)) / 2;
    const wobble =
      Math.sin(angle * 3 + seed * 0.83) * variant.wobbleA +
      Math.sin(angle * 7 + seed * 1.71) * variant.wobbleB +
      Math.sin(angle * (petals + 2) + seed * 0.37) * 2.4;
    const radius = variant.base + Math.pow(wave, variant.power) * variant.amp + wobble;
    points.push({
      x: 120 + Math.cos(angle) * radius,
      y: 120 + Math.sin(angle) * radius,
    });
  }

  const midpoint = (a, b) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  let pathData = "";
  const first = midpoint(points[points.length - 1], points[0]);
  pathData += `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const mid = midpoint(point, next);
    pathData += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`;
  });
  pathData += " Z";

  element.innerHTML = `
    <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <g transform="rotate(${tilt} 120 120)">
        <path d="${pathData}" fill="${petalColor}"></path>
        <ellipse cx="120" cy="120" rx="${variant.centerX}" ry="${variant.centerY}" fill="${centerColor}" transform="rotate(${tilt * -0.45 + seed * 3} 120 120)"></ellipse>
      </g>
    </svg>
  `;
  element.dataset.ready = "true";
}

document.querySelectorAll("[data-flower]").forEach((flower, index) => {
  flower.dataset.seed = index + 1;
  buildFlower(flower);
});

const track = document.querySelector(".home-track");
if (track) {
  const clones = [...track.children].map((card) => card.cloneNode(true));
  clones.forEach((card) => track.appendChild(card));
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const homeAboutSection = document.querySelector(".home-about-section");
const homeAboutTitle = document.querySelector("[data-about-title]");

if (homeAboutSection && homeAboutTitle) {
  const titleText = homeAboutTitle.textContent.trim().replace(/\s+/g, " ");
  let letterIndex = 0;

  homeAboutTitle.setAttribute("aria-label", titleText);
  homeAboutTitle.textContent = "";

  titleText.split(" ").forEach((word, wordIndex, words) => {
    const wordElement = document.createElement("span");
    wordElement.className = "home-about-title-word";
    wordElement.setAttribute("aria-hidden", "true");

    [...word].forEach((letter) => {
      const letterElement = document.createElement("span");
      letterElement.className = "home-about-title-letter";
      letterElement.style.setProperty("--letter-index", letterIndex);
      letterElement.textContent = letter;
      wordElement.appendChild(letterElement);
      letterIndex += 1;
    });

    homeAboutTitle.appendChild(wordElement);
  });

  const revealAbout = () => homeAboutSection.classList.add("is-visible");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const aboutObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealAbout();
          aboutObserver.disconnect();
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    aboutObserver.observe(homeAboutSection);
  } else {
    revealAbout();
  }
}

const homeSkillsSection = document.querySelector("[data-home-skills]");

if (homeSkillsSection) {
  const revealHomeSkills = () => homeSkillsSection.classList.add("is-visible");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const homeSkillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealHomeSkills();
          homeSkillsObserver.disconnect();
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    homeSkillsObserver.observe(homeSkillsSection);
  } else {
    revealHomeSkills();
  }
}

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function createCubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDerivativeX = (t) => (3 * ax * t + 2 * bx) * t + cx;

  return (x) => {
    const target = clamp(x);
    let t = target;

    for (let i = 0; i < 6; i += 1) {
      const derivative = sampleDerivativeX(t);
      if (Math.abs(derivative) < 0.001) break;
      t -= (sampleX(t) - target) / derivative;
      t = clamp(t);
    }

    let lower = 0;
    let upper = 1;
    for (let i = 0; i < 8 && Math.abs(sampleX(t) - target) > 0.001; i += 1) {
      if (sampleX(t) < target) lower = t;
      else upper = t;
      t = (lower + upper) / 2;
    }

    return sampleY(t);
  };
}

function initPortfolioLoader() {
  const loader = document.querySelector(".portfolio-loader");
  const path = loader?.querySelector(".portfolio-loader-scribble path");

  if (!loader) {
    document.body.classList.remove("is-loading");
    return;
  }

  if (prefersReducedMotion || !path || typeof path.getTotalLength !== "function") {
    loader.remove();
    document.body.classList.remove("is-loading");
    return;
  }

  const length = path.getTotalLength();
  const duration = 2300;
  const drawEase = createCubicBezier(0.625, 0.05, 0, 1);
  const scribbleEase = createCubicBezier(0.75, 0.15, 0.15, 1);
  const startedAt = performance.now();

  path.style.setProperty("--loader-path-length", length.toFixed(3));
  path.style.setProperty("--loader-path-offset", length.toFixed(3));
  path.style.setProperty("--loader-stroke-width", "8%");
  loader.style.setProperty("--loader-screen-alpha", "0.98");
  loader.style.setProperty("--loader-logo-opacity", "0");
  loader.style.setProperty("--loader-logo-invert", "0");
  loader.style.setProperty("--loader-scribble-opacity", "1");

  const tick = (now) => {
    const progress = clamp((now - startedAt) / duration);
    const drawProgress = clamp(progress / 0.55);
    const clearProgress = clamp((progress - 0.48) / 0.52);
    const hasStartedClearing = progress >= 0.52;
    const drawAmount = drawEase(drawProgress);
    const clearAmount = scribbleEase(clearProgress);
    const strokeWidth = hasStartedClearing ? 31 - 23 * clearAmount : 8 + 23 * drawAmount;
    const screenFade = clamp((progress - 0.08) / 0.8);
    const logoIn = clamp(progress / 0.2);
    const logoOut = clamp((progress - 0.52) / 0.22);
    const logoInvert = clamp((progress - 0.24) / 0.18);
    const pathOffset = hasStartedClearing ? -length * clearAmount : length * (1 - drawAmount);

    path.style.setProperty("--loader-path-offset", pathOffset.toFixed(3));
    path.style.setProperty("--loader-stroke-width", `${Math.max(strokeWidth, 0).toFixed(2)}%`);
    loader.style.setProperty("--loader-screen-alpha", (0.98 * (1 - screenFade)).toFixed(3));
    loader.style.setProperty("--loader-logo-opacity", (logoIn * (1 - logoOut)).toFixed(3));
    loader.style.setProperty("--loader-logo-invert", logoInvert.toFixed(3));

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    path.style.setProperty("--loader-stroke-width", "0%");
    loader.style.setProperty("--loader-scribble-opacity", "0");
    loader.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
    window.setTimeout(() => loader.remove(), 240);
  };

  window.requestAnimationFrame(tick);
}

initPortfolioLoader();

const seededValue = (index, min, max) => {
  const raw = Math.sin((index + 1) * 999.91) * 10000;
  const normalized = raw - Math.floor(raw);
  return min + normalized * (max - min);
};

const elasticOut = (progress) => {
  const t = clamp(progress);
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const setScrollMotion = () => {
  const rotation = Math.min(window.scrollY * 0.14, 138);
  const hero = document.querySelector(".hero");
  const heroCopy = document.querySelector(".hero-copy");
  const heroContent = document.querySelector(".hero-content");
  const referenceHeader = document.querySelector(".reference-header");
  const useNormalHeroScroll = document.body.classList.contains("hero-only-page");
  const heroHeight = hero?.offsetHeight || window.innerHeight;
  const heroProgress = clamp(window.scrollY / (heroHeight * 1.35));
  const heroExitProgress = clamp(window.scrollY / Math.max(heroHeight, 1));
  const copyProgress = clamp((heroExitProgress - 0.72) / 0.22);
  const stickerProgress = useNormalHeroScroll ? clamp((heroExitProgress - 0.34) / 0.54) : copyProgress;
  const heroOnlyFade = document.body.classList.contains("has-horizontal-words") ? 1 - copyProgress : 1;

  document.documentElement.style.setProperty("--scroll-rot", `${rotation}deg`);
  document.documentElement.style.setProperty("--hero-progress", heroProgress.toFixed(3));
  document.documentElement.style.setProperty("--hero-drift", `${(heroProgress * -110).toFixed(2)}px`);
  document.documentElement.style.setProperty("--sticker-opacity", (1 - stickerProgress).toFixed(3));
  document.documentElement.style.setProperty("--sticker-blur", `${(stickerProgress * 8).toFixed(2)}px`);
  document.documentElement.style.setProperty(
    "--shape-label-opacity",
    heroProgress > 0.7 ? Math.min((heroProgress - 0.7) / 0.1, 1).toFixed(3) : "0"
  );
  document.documentElement.style.setProperty(
    "--expertise-opacity",
    heroProgress > 0.8 ? Math.min((heroProgress - 0.8) / 0.1, 1).toFixed(3) : "0"
  );

  if (heroCopy && heroCopy.classList.contains("is-visible") && !useNormalHeroScroll) {
    heroCopy.style.opacity = (1 - copyProgress).toFixed(3);
    heroCopy.style.filter = "none";
    heroCopy.style.transform = `translate3d(0, ${(copyProgress * 28).toFixed(2)}px, 0)`;
  }

  if (heroContent) {
    if (useNormalHeroScroll) {
      heroContent.style.opacity = "";
      heroContent.style.filter = "";
      heroContent.style.transform = "";
    } else {
      heroContent.style.opacity = (1 - copyProgress).toFixed(3);
      heroContent.style.filter = "none";
      heroContent.style.transform = `translate3d(0, ${(copyProgress * 30).toFixed(2)}px, 0)`;
    }
  }

  const heroFlowers = document.querySelectorAll(".flower-hero");
  heroFlowers.forEach((flower) => {
    flower.style.opacity = Math.max(0, 1 - window.scrollY / 900).toFixed(2);
  });

  if (hero?.classList.contains("hero-only-section")) {
    if (useNormalHeroScroll) {
      hero.style.opacity = "";
      hero.style.pointerEvents = "";
    } else {
      hero.style.opacity = heroOnlyFade.toFixed(3);
      hero.style.pointerEvents = heroOnlyFade < 0.08 ? "none" : "";
    }
  }

  if (referenceHeader && document.body.classList.contains("has-horizontal-words")) {
    if (useNormalHeroScroll) {
      referenceHeader.style.opacity = "";
      referenceHeader.style.filter = "";
      referenceHeader.style.pointerEvents = "";
    } else {
      referenceHeader.style.opacity = heroOnlyFade.toFixed(3);
      referenceHeader.style.filter = "none";
      referenceHeader.style.pointerEvents = heroOnlyFade < 0.08 ? "none" : "";
    }
  }
};

if (!prefersReducedMotion) {
  setScrollMotion();
  window.addEventListener("scroll", setScrollMotion, { passive: true });
}

function setupHorizontalWords() {
  const sections = [...document.querySelectorAll(".horizontal-words")];
  if (!sections.length) return;

  const controllers = sections.map((section) => {
    const relative = section.querySelector(".horizontal-words__relative");
    const heading = section.querySelector(".horizontal-words__h2");
    const stickerSvgs = [...section.querySelectorAll(".horizontal-words__sticker-svg")];
    const drawSvgs = [...section.querySelectorAll(".horizontal-words__draw-svg")];

    if (!relative || !heading) return null;

    if (heading.dataset.split !== "true") {
      const fragment = document.createDocumentFragment();
      [...heading.textContent.trim()].forEach((character, index) => {
        const span = document.createElement("span");
        span.className = character === " " ? "word-space" : "letter";
        span.innerHTML = character === " " ? "&nbsp;" : character;
        span.dataset.rollY = seededValue(index, -250, 250).toFixed(3);
        span.dataset.rollRotation = seededValue(index + 40, -30, 30).toFixed(3);
        fragment.appendChild(span);
      });
      heading.textContent = "";
      heading.appendChild(fragment);
      heading.dataset.split = "true";
    }

    const letters = [...heading.querySelectorAll(".letter")];
    stickerSvgs.forEach((sticker, index) => {
      sticker.dataset.rollY = seededValue(index + 120, -200, 200).toFixed(3);
      sticker.dataset.rollRotation = seededValue(index + 150, -30, 30).toFixed(3);
    });

    const paths = drawSvgs.flatMap((svg) => [...svg.querySelectorAll("path")]);
    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.setProperty("--rolling-path-length", length.toFixed(3));
      path.style.strokeDasharray = length.toFixed(3);
      path.style.strokeDashoffset = length.toFixed(3);
    });

    return {
      section,
      heading,
      relative,
      letters,
      stickers: stickerSvgs,
      drawSvgs,
      paths,
    };
  }).filter(Boolean);

  const passProgress = (element, startRatio = 0.9, endRatio = 0.1) => {
    const rect = element.getBoundingClientRect();
    const start = window.innerWidth * startRatio;
    const end = window.innerWidth * endRatio;
    return clamp((start - rect.left) / (start - end));
  };

  let rollingFrame = 0;

  const updateHorizontalWords = () => {
    rollingFrame = 0;

    controllers.forEach(({ section, heading, relative, letters, stickers, drawSvgs, paths }) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const start = sectionTop + window.innerHeight * 0.02;
      const end = Math.min(sectionTop + sectionHeight - window.innerHeight, maxScroll);
      const progress = clamp((window.scrollY - start) / Math.max(end - start, 1));
      const headingWidth = heading.scrollWidth || heading.getBoundingClientRect().width;
      const startX = window.innerWidth * 0.15;
      const endX = window.innerWidth * 0.25 - headingWidth;
      const xPosition = startX + (endX - startX) * progress;

      relative.style.transform = `translate3d(${xPosition.toFixed(2)}px, 0, 0)`;

      letters.forEach((letter) => {
        const local = clamp(elasticOut(passProgress(letter, 0.9, 0.1)));
        const settle = 1 - local;
        const y = Number.parseFloat(letter.dataset.rollY || "0") * settle;
        const rotation = Number.parseFloat(letter.dataset.rollRotation || "0") * settle;
        letter.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0) rotate(${rotation.toFixed(2)}deg)`;
      });

      stickers.forEach((sticker) => {
        const local = clamp(elasticOut(passProgress(sticker, 0.9, 0.1)));
        const settle = 1 - local;
        const y = Number.parseFloat(sticker.dataset.rollY || "0") * settle;
        const rotation = Number.parseFloat(sticker.dataset.rollRotation || "0") * settle;
        const scale = Math.max(0, local);
        sticker.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      });

      drawSvgs.forEach((svg) => {
        const local = passProgress(svg, 0.9, 0.3);
        svg.querySelectorAll("path").forEach((path) => {
          const length = Number.parseFloat(path.style.strokeDasharray || "1");
          path.style.strokeDashoffset = (length * (1 - local)).toFixed(3);
        });
      });

      paths.forEach((path) => {
        path.style.opacity = "1";
      });
    });
  };

  const requestHorizontalWordsUpdate = () => {
    if (rollingFrame) return;
    rollingFrame = window.requestAnimationFrame(updateHorizontalWords);
  };

  if (prefersReducedMotion) {
    controllers.forEach(({ relative, letters, stickers, paths }) => {
      relative.style.transform = "translate3d(0, 0, 0)";
      letters.forEach((letter) => {
        letter.style.transform = "none";
      });
      stickers.forEach((sticker) => {
        sticker.style.transform = "none";
      });
      paths.forEach((path) => {
        path.style.strokeDashoffset = "0";
      });
    });
    return;
  }

  updateHorizontalWords();
  window.addEventListener("scroll", requestHorizontalWordsUpdate, { passive: true });
  window.addEventListener("resize", requestHorizontalWordsUpdate);
}

setupHorizontalWords();

function setupTuhinaGallery() {
  const tracks = [...document.querySelectorAll("[data-tuhina-gallery-track]")];
  if (!tracks.length) return;

  tracks.forEach((track) => {
    const viewport = track.closest(".tuhina-gallery-viewport");
    const itemCount = Number.parseInt(track.dataset.galleryItems || "0", 10);
    let distance = 0;
    let x = -480;
    let lastTime = 0;
    let currentSpeed = 80;
    let isHovering = false;

    const measure = () => {
      const firstItem = track.querySelector(".tuhina-gallery-item");
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
      const itemWidth = firstItem?.getBoundingClientRect().width || 280;
      distance = Math.max((itemWidth + gap) * itemCount, 1);
      x %= distance;
    };

    viewport?.addEventListener("mouseenter", () => {
      isHovering = true;
    });

    viewport?.addEventListener("mouseleave", () => {
      isHovering = false;
    });

    if (prefersReducedMotion) {
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const tick = (time) => {
      if (!distance) measure();
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      const targetSpeed = isHovering ? 28 : 80;
      currentSpeed += (targetSpeed - currentSpeed) * Math.min(delta * 8, 1);
      x -= currentSpeed * delta;

      while (x <= -distance) x += distance;
      while (x > 0) x -= distance;

      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      window.requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener("resize", measure);
    window.requestAnimationFrame(tick);
  });
}

setupTuhinaGallery();

function setupServicesRoll() {
  const section = document.querySelector("#services-roll");
  if (!section) return;

  const list = section.querySelector(".services-roll-list");
  const preview = section.querySelector(".services-roll-preview");
  const rows = [...section.querySelectorAll("[data-preview-index]")];
  if (!list || !preview || !rows.length) return;

  let activeRow = null;
  let resizeFrame = 0;

  const isCompact = () => window.matchMedia("(max-width: 900px)").matches;

  const clearActive = () => {
    activeRow = null;
    section.classList.remove("is-previewing");
    rows.forEach((row) => row.classList.remove("is-active"));
  };

  const setActive = (row) => {
    if (isCompact()) {
      clearActive();
      return;
    }

    const index = Number.parseInt(row.dataset.previewIndex || "0", 10);
    const sectionRect = section.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const previewHeight = preview.getBoundingClientRect().height || 1;
    const maxTop = Math.max(section.offsetHeight - previewHeight, 0);
    const nextTop = rowRect.top + rowRect.height / 2 - sectionRect.top - previewHeight / 2;

    activeRow = row;
    rows.forEach((item) => item.classList.toggle("is-active", item === row));
    section.style.setProperty("--services-preview-top", `${Math.min(Math.max(nextTop, 0), maxTop).toFixed(2)}px`);
    section.style.setProperty("--services-preview-shift", `${(-index * previewHeight).toFixed(2)}px`);
    section.classList.add("is-previewing");
  };

  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => setActive(row));
    row.addEventListener("pointerenter", () => setActive(row));
    row.addEventListener("click", () => setActive(row));
    row.addEventListener("focus", () => setActive(row));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(row);
      }
    });
  });

  list.addEventListener("mouseleave", clearActive);
  list.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!list.contains(document.activeElement)) clearActive();
    }, 0);
  });

  window.addEventListener("resize", () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      if (activeRow) setActive(activeRow);
    });
  });
}

setupServicesRoll();

function setupBehindPixelsFan() {
  const fan = document.querySelector("[data-behind-pixels-fan]");
  if (!fan) return;

  const cards = [...fan.querySelectorAll(".behind-pixels-card")];
  if (!cards.length) return;

  const clearActive = () => {
    cards.forEach((card) => card.classList.remove("is-active"));
  };

  cards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      clearActive();
      card.classList.add("is-active");
    });

    card.addEventListener("focus", () => {
      clearActive();
      card.classList.add("is-active");
    });

    card.addEventListener("click", () => {
      clearActive();
      card.classList.add("is-active");
    });
  });

  fan.addEventListener("pointerleave", clearActive);
  fan.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!fan.contains(document.activeElement)) clearActive();
    }, 0);
  });
}

setupBehindPixelsFan();

function setupProjectActionCards() {
  const shells = [...document.querySelectorAll("[data-action-card]")];
  if (shells.length < 2) return;

  const cards = shells.map((shell) => shell.querySelector(".action-card")).filter(Boolean);
  let actionFrame = 0;

  shells.forEach((shell, index) => {
    shell.style.zIndex = String(index + 1);
  });

  const resetCards = () => {
    cards.forEach((card) => {
      card.style.opacity = "";
      card.style.transform = "";
      card.style.pointerEvents = "";
    });
  };

  const updateProjectCards = () => {
    actionFrame = 0;

    if (window.matchMedia("(max-width: 720px)").matches || prefersReducedMotion) {
      resetCards();
      return;
    }

    const stickyTop = Number.parseFloat(getComputedStyle(shells[0]).top) || 86;
    const startLine = window.innerHeight * 0.82;
    const endLine = stickyTop + 54;

    shells.forEach((shell, index) => {
      const card = shell.querySelector(".action-card");
      if (!card) return;

      if (index === shells.length - 1) {
        card.style.opacity = "1";
        card.style.transform = "scale(1)";
        card.style.pointerEvents = "";
        return;
      }

      const nextRect = shells[index + 1].getBoundingClientRect();
      const progress = clamp((startLine - nextRect.top) / (startLine - endLine));
      const scale = 1 - progress * 0.065;
      const opacity = 1 - progress * 0.16;
      const y = progress * -18;

      card.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.pointerEvents = progress > 0.98 ? "none" : "";
    });
  };

  const requestProjectCardsUpdate = () => {
    if (actionFrame) return;
    actionFrame = window.requestAnimationFrame(updateProjectCards);
  };

  updateProjectCards();
  window.addEventListener("scroll", requestProjectCardsUpdate, { passive: true });
  window.addEventListener("resize", requestProjectCardsUpdate);
}

setupProjectActionCards();

function setupMyProcessSection() {
  const section = document.querySelector("[data-process-section]");
  const viewport = section?.querySelector(".my-process-viewport");
  const track = section?.querySelector("[data-process-track]");
  const slots = track ? [...track.querySelectorAll(".process-card-slot")] : [];
  if (!section || !viewport || !track || !slots.length) return;

  let processFrame = 0;
  let maxTranslate = 0;
  let scrollEnd = 1;

  const measureProcess = () => {
    const cardWidth = slots[0].getBoundingClientRect().width;
    const pad = Math.max(0, (viewport.clientWidth - cardWidth) / 2);
    track.style.setProperty("--process-pad", `${pad.toFixed(2)}px`);

    maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
    scrollEnd = 110 + maxTranslate / 0.96;
    const exitHold = window.innerWidth <= 700 ? 230 : 290;
    section.style.setProperty("--process-scroll-length", `${Math.ceil(scrollEnd + exitHold)}px`);
  };

  const updateProcess = () => {
    processFrame = 0;
    if (prefersReducedMotion) {
      track.style.setProperty("--process-x", "0px");
      return;
    }

    const sectionTop = section.getBoundingClientRect().top;
    const scrolled = Math.max(0, -sectionTop);
    const progress = clamp((scrolled - 110) / Math.max(scrollEnd - 110, 1));
    track.style.setProperty("--process-x", `${(-maxTranslate * progress).toFixed(2)}px`);
  };

  const requestProcessUpdate = () => {
    if (processFrame) return;
    processFrame = window.requestAnimationFrame(updateProcess);
  };

  const revealProcess = () => section.classList.add("is-ready");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const processObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealProcess();
          processObserver.disconnect();
        });
      },
      { threshold: 0.04, rootMargin: "15% 0px 10% 0px" }
    );
    processObserver.observe(section);
  } else {
    revealProcess();
  }

  measureProcess();
  updateProcess();
  window.addEventListener("scroll", requestProcessUpdate, { passive: true });
  window.addEventListener("resize", () => {
    measureProcess();
    requestProcessUpdate();
  });
}

setupMyProcessSection();

function setupHeroTitleImages() {
  const titleImages = document.querySelectorAll(".hero-title-img");
  if (!titleImages.length) return;

  titleImages.forEach((imageLink) => {
    imageLink.addEventListener("animationend", () => {
      imageLink.classList.add("is-grown");
    });
    window.setTimeout(() => {
      imageLink.classList.add("is-grown");
    }, 1800);
  });
}

setupHeroTitleImages();

function setupSelectedInterfacesMarquee() {
  const viewports = [...document.querySelectorAll(".selected-interfaces__viewport")];
  if (!viewports.length) return;

  viewports.forEach((viewport) => {
    const track = viewport.querySelector(".selected-interfaces__track");
    if (!track) return;

    let dragging = false;
    let moved = false;
    let pointerId = null;
    let startX = 0;
    let startOffset = 0;

    const readOffset = () => {
      const transform = getComputedStyle(track).transform;
      if (!transform || transform === "none") return 0;
      return new DOMMatrix(transform).m41;
    };

    const pauseAtCurrentPosition = () => {
      startOffset = readOffset();
      track.style.animationName = "none";
      track.style.transform = `translate3d(${startOffset}px, 0, 0)`;
    };

    const resumeFromCurrentPosition = () => {
      const halfWidth = track.scrollWidth / 2;
      if (!halfWidth) return;

      const duration = Number.parseFloat(getComputedStyle(track).animationDuration) || 38;
      const isRight = track.classList.contains("selected-interfaces__track--right");
      const normalized = ((startOffset % halfWidth) + halfWidth) % halfWidth;
      const progress = isRight ? 1 - normalized / halfWidth : normalized / halfWidth;

      track.style.animationName = isRight ? "selected-interfaces-right" : "selected-interfaces-left";
      track.style.animationDelay = `${-Math.max(0, Math.min(1, progress)) * duration}s`;
      track.style.transform = "";
    };

    viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      dragging = true;
      moved = false;
      pointerId = event.pointerId;
      startX = event.clientX;
      pauseAtCurrentPosition();
      viewport.setPointerCapture?.(event.pointerId);
      viewport.style.cursor = "grabbing";
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 5) moved = true;
      startOffset += delta;
      startX = event.clientX;
      track.style.transform = `translate3d(${startOffset}px, 0, 0)`;
      if (event.cancelable) event.preventDefault();
    });

    const endDrag = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      viewport.releasePointerCapture?.(event.pointerId);
      viewport.style.cursor = "grab";
      resumeFromCurrentPosition();
      window.setTimeout(() => { moved = false; }, 0);
    };

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
  });
}

setupSelectedInterfacesMarquee();

function setupHeroLogoParticles() {
  const stage = document.querySelector("[data-logo-particles]");
  const hero = stage?.closest("[data-particle-logo-host], .reference-hero");
  const canvas = stage?.querySelector("canvas");
  if (!hero || !stage || !canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const logo = new Image();
  const particles = [];
  const wanderers = [];
  const pointer = { x: -1000, y: -1000, active: false };
  let width = 0;
  let height = 0;
  let ratio = 1;
  let frame = 0;
  let isVisible = true;
  let lastTime = performance.now();
  let rebuildTimer = 0;

  stage.classList.add("is-loading");

  const logoLayout = () => {
    const mobile = width <= 700;
    const aboutHero = hero.classList.contains("about-page-hero");
    const logoWidth = mobile
      ? Math.min(aboutHero ? 120 : 170, width * 0.38)
      : Math.min(aboutHero ? 270 : 320, Math.max(aboutHero ? 220 : 245, width * (aboutHero ? 0.21 : 0.25)));
    return {
      width: logoWidth,
      height: logoWidth / 1.9,
      centerX: width * 0.5,
      centerY: aboutHero
        ? (mobile ? 106 : Math.min(170, Math.max(145, height * 0.18)))
        : (mobile ? 302 : Math.min(225, Math.max(176, height * 0.225))),
    };
  };

  const createTargets = () => {
    if (!logo.complete || !logo.naturalWidth || !width || !height) return;

    const layout = logoLayout();
    const mask = document.createElement("canvas");
    const maskContext = mask.getContext("2d", { willReadFrequently: true });
    const sampleScale = width <= 700 ? 1.15 : 1.35;
    mask.width = Math.max(1, Math.round(layout.width * sampleScale));
    mask.height = Math.max(1, Math.round(layout.height * sampleScale));
    maskContext.clearRect(0, 0, mask.width, mask.height);
    maskContext.drawImage(logo, 0, 0, mask.width, mask.height);

    const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
    const candidates = [];
    const step = width <= 700 ? 2 : 2;
    for (let y = 0; y < mask.height; y += step) {
      for (let x = 0; x < mask.width; x += step) {
        const alpha = pixels[(y * mask.width + x) * 4 + 3];
        if (alpha > 46) {
          candidates.push({
            x: layout.centerX - layout.width / 2 + x / sampleScale,
            y: layout.centerY - layout.height / 2 + y / sampleScale,
          });
        }
      }
    }

    const maxParticles = width <= 700 ? 3400 : 6200;
    const stride = Math.max(1, Math.ceil(candidates.length / maxParticles));
    const targets = candidates.filter((_, index) => index % stride === 0);
    const spawnRadius = Math.max(width, height) * 0.32;

    particles.length = 0;
    targets.forEach((target, index) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = spawnRadius * (0.5 + Math.random() * 0.9);
      particles.push({
        x: reducedMotion.matches ? target.x : layout.centerX + Math.cos(angle) * distance,
        y: reducedMotion.matches ? target.y : layout.centerY + Math.sin(angle) * distance,
        tx: target.x,
        ty: target.y,
        vx: 0,
        vy: 0,
        size: 0.7 + Math.random() * 1.15,
        seed: index * 0.618 + Math.random() * 8,
        alpha: 0.58 + Math.random() * 0.42,
      });
    });

    wanderers.length = 0;
    const wandererCount = width <= 700 ? 14 : 26;
    for (let index = 0; index < wandererCount; index += 1) {
      wanderers.push({
        x: Math.random() * width,
        y: 90 + Math.random() * Math.min(height * 0.62, 560),
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        size: 1 + Math.random() * 1.35,
        phase: Math.random() * Math.PI * 2,
      });
    }

    stage.classList.remove("is-loading");
    stage.classList.add("is-ready");
  };

  const resize = () => {
    const bounds = hero.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createTargets();
  };

  const accentColor = () => {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    return value || "#79c7eb";
  };

  const draw = (time) => {
    frame = 0;
    if (!isVisible || document.hidden) return;

    const delta = Math.min(2, Math.max(0.35, (time - lastTime) / 16.667));
    lastTime = time;
    context.clearRect(0, 0, width, height);
    context.fillStyle = accentColor();

    const motionScale = reducedMotion.matches ? 0 : 1;
    const influenceRadius = width <= 700 ? 52 : 76;

    particles.forEach((particle) => {
      const idleX = Math.sin(time * 0.0011 + particle.seed) * 0.75 * motionScale;
      const idleY = Math.cos(time * 0.0013 + particle.seed * 1.2) * 0.75 * motionScale;
      const targetX = particle.tx + idleX;
      const targetY = particle.ty + idleY;

      if (pointer.active && motionScale) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy) || 0.001;
        if (distance < influenceRadius) {
          const force = (1 - distance / influenceRadius) * 2.35;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }
      }

      particle.vx += (targetX - particle.x) * 0.032 * delta;
      particle.vy += (targetY - particle.y) * 0.032 * delta;
      particle.vx *= Math.pow(0.84, delta);
      particle.vy *= Math.pow(0.84, delta);
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;

      context.globalAlpha = particle.alpha;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    });

    wanderers.forEach((particle) => {
      particle.x += (particle.vx + Math.sin(time * 0.00045 + particle.phase) * 0.025) * delta * motionScale;
      particle.y += (particle.vy + Math.cos(time * 0.0004 + particle.phase) * 0.02) * delta * motionScale;
      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;
      if (particle.y < 84) particle.y = Math.min(height * 0.62, 560);
      if (particle.y > Math.min(height * 0.62, 560)) particle.y = 84;
      context.globalAlpha = 0.7;
      context.fillRect(particle.x, particle.y, particle.size, particle.size);
    });

    context.globalAlpha = 1;
    if (!reducedMotion.matches) frame = window.requestAnimationFrame(draw);
  };

  const start = () => {
    if (frame || !isVisible || document.hidden) return;
    lastTime = performance.now();
    frame = window.requestAnimationFrame(draw);
  };

  const burstAt = (x, y, strength = 8) => {
    particles.forEach((particle) => {
      const dx = particle.x - x;
      const dy = particle.y - y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance < 170) {
        const force = (1 - distance / 170) * strength;
        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;
      }
    });
  };

  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.active = true;
  });
  hero.addEventListener("pointerleave", () => { pointer.active = false; });
  hero.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a, button, [data-draggable]")) return;
    const bounds = hero.getBoundingClientRect();
    burstAt(event.clientX - bounds.left, event.clientY - bounds.top);
  });

  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) start();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }, { threshold: 0.01 });
  observer.observe(hero);

  document.addEventListener("visibilitychange", start);
  window.addEventListener("resize", () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(() => {
      resize();
      if (reducedMotion.matches) draw(performance.now());
      else start();
    }, 120);
  });

  reducedMotion.addEventListener?.("change", () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    draw(performance.now());
    start();
  });

  logo.addEventListener("load", () => {
    resize();
    draw(performance.now());
    start();
  });
  logo.src = "/assets/user-stickers/designsbyaami-logo-header.png";
}

setupHeroLogoParticles();

function setupDraggableHeroObjects() {
  const hero = document.querySelector(".reference-hero");
  const objects = [...document.querySelectorAll("[data-draggable]")];
  if (!hero || !objects.length) return;

  let topLayer = 90;

  objects.forEach((object) => {
    const storageKey = `amina-reference-hero-session-v2-${object.id}`;
    let originX = 0;
    let originY = 0;
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;
    let startRect = null;
    let pointerId = null;
    let pointerType = "mouse";
    let isPressed = false;
    let didDrag = false;
    let suppressClick = false;

    const setOffset = (x, y) => {
      originX = x;
      originY = y;
      currentX = x;
      currentY = y;
      object.style.setProperty("--drag-x", `${x.toFixed(1)}px`);
      object.style.setProperty("--drag-y", `${y.toFixed(1)}px`);
    };

    const constrain = (x, y) => {
      if (!startRect) return { x, y };
      const bounds = hero.getBoundingClientRect();
      const minX = originX + bounds.left - startRect.left;
      const maxX = originX + bounds.right - startRect.right;
      const minY = originY + bounds.top - startRect.top;
      const maxY = originY + bounds.bottom - startRect.bottom;
      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY),
      };
    };

    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        setOffset(saved.x, saved.y);
      }
    } catch {
      setOffset(0, 0);
    }

    object.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest(".portfolio-assistant-panel")) return;

      isPressed = true;
      didDrag = false;
      pointerId = event.pointerId;
      pointerType = event.pointerType || "mouse";
      startX = event.clientX;
      startY = event.clientY;
      startRect = object.getBoundingClientRect();
      object.style.zIndex = String(++topLayer);
    });

    object.addEventListener("pointermove", (event) => {
      if (!isPressed || event.pointerId !== pointerId) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!didDrag) {
        const desktopPreviewActive = document.documentElement.classList.contains("desktop-preview-active");
        if (!desktopPreviewActive && pointerType === "touch" && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) return;
        if (Math.hypot(deltaX, deltaY) < 5) return;

        didDrag = true;
        object.classList.remove("is-settling");
        object.classList.add("is-dragging");
        object.setPointerCapture?.(event.pointerId);
      }

      const next = constrain(originX + deltaX, originY + deltaY);
      currentX = next.x;
      currentY = next.y;
      object.style.setProperty("--drag-x", `${currentX.toFixed(1)}px`);
      object.style.setProperty("--drag-y", `${currentY.toFixed(1)}px`);
      if (event.cancelable) event.preventDefault();
    });

    const endInteraction = (event) => {
      if (!isPressed || event.pointerId !== pointerId) return;

      isPressed = false;
      suppressClick = didDrag;

      if (didDrag) {
        setOffset(currentX, currentY);
        object.classList.remove("is-dragging");
        object.classList.add("is-settling");
        window.setTimeout(() => object.classList.remove("is-settling"), 460);

        try {
          sessionStorage.setItem(storageKey, JSON.stringify({ x: currentX, y: currentY }));
        } catch {
          // Position still persists for the active page when session storage is unavailable.
        }
      }

      object.releasePointerCapture?.(event.pointerId);
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    };

    object.addEventListener("pointerup", endInteraction);
    object.addEventListener("pointercancel", endInteraction);

    object.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true
    );

    object.addEventListener("keydown", (event) => {
      const directions = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const direction = directions[event.key];
      if (!direction) return;
      if (event.target.matches("input, textarea")) return;

      event.preventDefault();
      startRect = object.getBoundingClientRect();
      const amount = event.shiftKey ? 32 : 12;
      const next = constrain(originX + direction[0] * amount, originY + direction[1] * amount);
      object.style.zIndex = String(++topLayer);
      object.classList.add("is-settling");
      setOffset(next.x, next.y);
      window.setTimeout(() => object.classList.remove("is-settling"), 460);

      try {
        sessionStorage.setItem(storageKey, JSON.stringify({ x: next.x, y: next.y }));
      } catch {
        // Keyboard movement still works without storage.
      }
    });
  });
}

setupDraggableHeroObjects();

function setupHeroStickerToggle() {
  const hero = document.querySelector(".hero-only-section");
  const toggle = document.querySelector("[data-hero-sticker-toggle]");
  if (!hero || !toggle) return;

  const setHidden = (hidden) => {
    const action = hidden ? "Show hero stickers" : "Hide hero stickers";
    hero.classList.toggle("is-stickers-hidden", hidden);
    toggle.setAttribute("aria-pressed", String(hidden));
    toggle.setAttribute("aria-label", action);
    toggle.title = action;
  };

  setHidden(false);

  toggle.addEventListener("click", () => {
    setHidden(!hero.classList.contains("is-stickers-hidden"));
  });
}

setupHeroStickerToggle();

function setupHeroFolder() {
  const button = document.querySelector(".folder-button");
  const work = document.querySelector("#works");
  if (!button || !work) return;

  button.addEventListener("click", () => {
    work.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

setupHeroFolder();

// Edit local portfolio-assistant answers here.
const portfolioAssistantResponses = [
  {
    keywords: ["project", "projects", "best", "work", "portfolio", "case study", "show"],
    answer: "Aami's featured work includes Juspay Genius, Breeze Buddy, Hacktober Fest, and Nord VPN. Open the Design in Action section to explore the project links.",
  },
  {
    keywords: ["tool", "tools", "figma", "canva", "html", "css", "wireframe", "user flow"],
    answer: "The portfolio represents Figma, Canva, HTML/CSS, wireframes, user flows, brand kits, and social design as part of Aami's toolkit.",
  },
  {
    keywords: ["contact", "email", "reach", "hire", "talk", "message"],
    answer: "You can reach Aami at aminamuringoli@gmail.com or use the contact links in the footer.",
  },
  {
    keywords: ["designer", "design", "kind", "ui", "ux", "product", "focus"],
    answer: "Aami is a UI/UX designer focused on web interfaces, brand identities, and digital products, with a clear interest in thoughtful, human digital experiences.",
  },
];

function setupPortfolioAssistant() {
  const assistant = document.querySelector("#portfolio-assistant");
  const trigger = assistant?.querySelector(".portfolio-assistant-trigger");
  const panel = assistant?.querySelector(".portfolio-assistant-panel");
  const closeButton = assistant?.querySelector(".assistant-close");
  const form = assistant?.querySelector(".assistant-form");
  const input = assistant?.querySelector("#assistant-question");
  const conversation = assistant?.querySelector(".assistant-conversation");
  const suggestions = [...(assistant?.querySelectorAll(".assistant-suggestions button") || [])];
  const objectLayer = document.querySelector(".reference-hero-background");
  if (!assistant || !trigger || !panel || !closeButton || !form || !input || !conversation) return;

  let returnFocus = null;
  let panelIsPortaled = false;

  const open = () => {
    returnFocus = document.activeElement;
    if (window.matchMedia("(max-width: 640px)").matches) {
      document.body.appendChild(panel);
      panel.classList.add("is-mobile-sheet");
      panelIsPortaled = true;
    }
    panel.hidden = false;
    assistant.classList.add("is-open");
    objectLayer?.classList.add("assistant-open");
    document.body.classList.add("assistant-is-open");
    trigger.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => input.focus());
  };

  const close = () => {
    if (panel.hidden) return;
    panel.hidden = true;
    assistant.classList.remove("is-open");
    objectLayer?.classList.remove("assistant-open");
    document.body.classList.remove("assistant-is-open");
    trigger.setAttribute("aria-expanded", "false");
    if (panelIsPortaled) {
      panel.classList.remove("is-mobile-sheet");
      assistant.appendChild(panel);
      panelIsPortaled = false;
    }
    if (returnFocus instanceof HTMLElement) returnFocus.focus();
  };

  const answerQuestion = (question) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    const userMessage = document.createElement("p");
    userMessage.className = "assistant-message assistant-message--user";
    userMessage.textContent = cleanQuestion;
    conversation.appendChild(userMessage);

    const normalized = cleanQuestion.toLowerCase();
    const match = portfolioAssistantResponses.find((response) =>
      response.keywords.some((keyword) => normalized.includes(keyword))
    );
    const botMessage = document.createElement("p");
    botMessage.className = "assistant-message assistant-message--bot";
    botMessage.textContent = match
      ? match.answer
      : "I can only answer from Aami's portfolio. Try asking about her design focus, featured projects, tools, or contact details.";
    conversation.appendChild(botMessage);
    conversation.scrollTop = conversation.scrollHeight;
    input.value = "";
  };

  trigger.addEventListener("click", () => {
    if (panel.hidden) open();
    else close();
  });
  closeButton.addEventListener("click", close);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    answerQuestion(input.value);
  });

  suggestions.forEach((button) => {
    button.addEventListener("click", () => answerQuestion(button.textContent || ""));
  });

  document.addEventListener("pointerdown", (event) => {
    if (!panel.hidden && !assistant.contains(event.target) && !panel.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (panel.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')].filter(
      (element) => !element.disabled && !element.hidden
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

setupPortfolioAssistant();

function setupReferenceAskAIPill() {
  const assistant = document.querySelector("#portfolio-assistant");
  const title = assistant?.querySelector("[data-ai-title]");
  const links = [...(assistant?.querySelectorAll("[data-ai-name]") || [])];
  if (!assistant || !title || !links.length) return;

  const setTitle = (name = "") => {
    title.textContent = name ? `Ask ${name}` : "Ask AI";
  };

  links.forEach((link) => {
    const name = link.dataset.aiName || "AI";
    link.addEventListener("pointerenter", () => setTitle(name));
    link.addEventListener("pointerleave", () => setTitle());
    link.addEventListener("focus", () => setTitle(name));
    link.addEventListener("blur", () => setTitle());
  });
}

setupReferenceAskAIPill();

function setupHeroAskAi() {
  const links = [...document.querySelectorAll("[data-ask-ai-base]")];
  if (!links.length) return;

  const buildPrompt = () => {
    const portfolioUrl = new URL("/", window.location.href).href;
    return [
      `I am evaluating Amina M (${portfolioUrl}) for a {add role here} position at {add company name here}.`,
      "Please review her portfolio and give me a direct assessment: what is her actual design range, what kind of company or team would she be most effective in, and what specific value would she bring to this role.",
      "Reference her projects and past work in your answer.",
    ].join(" ");
  };

  links.forEach((link) => {
    const buildDestination = () => {
      const destination = new URL(link.dataset.askAiBase);
      destination.searchParams.set("q", buildPrompt());
      return destination.toString();
    };

    link.href = buildDestination();
    link.addEventListener("click", () => {
      link.href = buildDestination();
    });
  });
}

setupHeroAskAi();

function setupReferenceTerminal() {
  const terminal = document.querySelector("#hero-terminal");
  const toggle = terminal?.querySelector(".terminal-toggle");
  const actions = terminal?.querySelector(".terminal-actions");
  if (!terminal || !toggle || !actions) return;

  toggle.addEventListener("click", () => {
    const shouldOpen = actions.hidden;
    actions.hidden = !shouldOpen;
    toggle.setAttribute("aria-expanded", String(shouldOpen));
  });

  terminal.addEventListener("pointerleave", () => {
    if (document.activeElement && terminal.contains(document.activeElement)) return;
    actions.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  });
}

setupReferenceTerminal();

function setupGardenHover() {
  const field = document.querySelector(".flower-field");
  if (!field || prefersReducedMotion) return;

  const flowers = [...field.querySelectorAll("[data-flower]")];
  const resetFlowers = () => {
    flowers.forEach((flower) => {
      flower.style.setProperty("--garden-rot", "0deg");
      flower.style.setProperty("--garden-scale", "1");
    });
  };

  field.addEventListener("pointermove", (event) => {
    flowers.forEach((flower, index) => {
      const rect = flower.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - distance / 185);
      const direction = index % 2 === 0 ? 1 : -1;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const rotation = influence * (90 + Math.abs(angle) * 0.22) * direction;

      flower.style.setProperty("--garden-rot", `${rotation.toFixed(2)}deg`);
      flower.style.setProperty("--garden-scale", (1 + influence * 0.045).toFixed(3));
    });
  });

  field.addEventListener("pointerleave", resetFlowers);
  resetFlowers();
}

setupGardenHover();

function setupFloatingNavbar() {
  const navbar = document.querySelector(".site-navbar__pill");
  const indicator = navbar?.querySelector(".site-navbar__indicator");
  const links = [...(navbar?.querySelectorAll("[data-nav-section]") || [])];
  if (!navbar || !indicator || !links.length) return;

  const sections = links
    .map((link) => ({ link, section: document.getElementById(link.dataset.navSection) }))
    .filter(({ section }) => section);
  let currentId = "";
  let frame = 0;

  const positionIndicator = (link, immediate = false) => {
    if (!link) return;
    if (immediate) indicator.classList.add("is-instant");
    const indicatorWidth = Math.min(26, Math.max(18, link.offsetWidth - 24));
    const indicatorX = link.offsetLeft + (link.offsetWidth - indicatorWidth) / 2;
    navbar.style.setProperty("--nav-indicator-x", `${indicatorX}px`);
    navbar.style.setProperty("--nav-indicator-width", `${indicatorWidth}px`);
    if (immediate) {
      window.requestAnimationFrame(() => indicator.classList.remove("is-instant"));
    }
  };

  const setActive = (id, immediate = false) => {
    if (!id || (id === currentId && !immediate)) return;
    currentId = id;
    let activeLink = null;

    links.forEach((link) => {
      const isActive = link.dataset.navSection === id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    positionIndicator(activeLink, immediate);
  };

  const updateFromScroll = () => {
    frame = 0;
    const marker = window.scrollY + Math.min(window.innerHeight * 0.32, 220);
    let activeId = sections[0]?.section.id || "home";

    sections.forEach(({ section }) => {
      if (section.offsetTop <= marker) activeId = section.id;
    });

    const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
    if (atPageEnd && document.getElementById("contact")) activeId = "contact";
    setActive(activeId);
  };

  const requestScrollUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(updateFromScroll);
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (link.dataset.navSection) setActive(link.dataset.navSection);
    });
  });

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", () => {
    const activeLink = links.find((link) => link.classList.contains("is-active"));
    positionIndicator(activeLink, true);
    requestScrollUpdate();
  });

  setActive(location.hash.slice(1) || "home", true);
  updateFromScroll();
}

setupFloatingNavbar();

function setupWhatsAppCallButton() {
  const button = document.querySelector("[data-whatsapp-cta]");
  if (!button) return;

  let completeTimer = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover)");

  const start = () => {
    if (!canHover.matches || reducedMotion.matches) return;
    window.clearTimeout(completeTimer);
    button.classList.remove("is-complete");
    completeTimer = window.setTimeout(() => {
      button.classList.add("is-complete");
    }, 500);
  };

  const reset = () => {
    window.clearTimeout(completeTimer);
    button.classList.remove("is-complete");
  };

  button.addEventListener("pointerenter", start);
  button.addEventListener("pointerleave", reset);
  button.addEventListener("focus", start);
  button.addEventListener("blur", reset);
}

setupWhatsAppCallButton();

function setupWorksPage() {
  const page = document.querySelector("[data-works-page]");
  if (!page) return;

  const filters = [...page.querySelectorAll("[data-filter]")];
  const viewButtons = [...page.querySelectorAll("[data-view]")];
  const projects = [...page.querySelectorAll("[data-project]")];
  const projectGrid = page.querySelector("[data-project-grid]");
  const count = page.querySelector("[data-project-count]");

  const applyFilter = (category) => {
    let visibleCount = 0;

    projects.forEach((project) => {
      const projectCategories = (project.dataset.category || "").split(/\s+/).filter(Boolean);
      const isVisible = category === "all" || projectCategories.includes(category);
      project.classList.toggle("is-filtered-out", !isVisible);
      project.setAttribute("aria-hidden", String(!isVisible));
      if (isVisible) visibleCount += 1;
    });

    filters.forEach((button) => {
      const isActive = button.dataset.filter === category;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (count) count.textContent = String(visibleCount).padStart(2, "0");
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter || "all"));
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view || "grid";
      projectGrid?.classList.toggle("is-list", view === "list");

      viewButtons.forEach((control) => {
        const isActive = control === button;
        control.classList.toggle("is-active", isActive);
        control.setAttribute("aria-pressed", String(isActive));
      });
    });
  });

  applyFilter("all");
}

setupWorksPage();

function setupResumePage() {
  const page = document.querySelector("[data-resume-page]");
  const title = page?.querySelector("[data-resume-title]");
  if (!page || !title) return;

  const titleText = title.textContent.trim();
  title.setAttribute("aria-label", titleText);
  title.textContent = "";

  [...titleText].forEach((character, index) => {
    const span = document.createElement("span");
    span.className = character === " " ? "resume-title-space" : "resume-title-char";
    span.textContent = character === " " ? "\u00a0" : character;
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--resume-char-index", index);
    title.append(span);
  });

  requestAnimationFrame(() => page.classList.add("is-ready"));
}

setupResumePage();

function setupContactPage() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-contact-status]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const service = String(data.get("service") || "Not specified").trim();
    const timeline = String(data.get("timeline") || "Not specified").trim();
    const services = data.getAll("services").map((service) => String(service)).filter(Boolean);
    const message = String(data.get("message") || "").trim();
    const serviceSummary = services.length ? services.join(", ") : "Not specified";
    const subject = `Portfolio enquiry from ${name}`;
    const body = [
      "Hi Aami,",
      "",
      message,
      "",
      `Primary service: ${service}`,
      `Project details: ${serviceSummary}`,
      `Timeline: ${timeline}`,
      "",
      `From: ${name}`,
      `Email: ${email}`,
    ].join("\n");
    const gmailCompose = new URL("https://mail.google.com/mail/");
    gmailCompose.searchParams.set("view", "cm");
    gmailCompose.searchParams.set("fs", "1");
    gmailCompose.searchParams.set("to", "aminamuringoli@gmail.com");
    gmailCompose.searchParams.set("su", subject);
    gmailCompose.searchParams.set("body", body);

    if (status) status.textContent = "Opening Gmail with your enquiry ready to send.";
    window.location.assign(gmailCompose.toString());
  });
}

setupContactPage();

function setupGradientFlowBackground() {
  const canvas = document.querySelector("[data-gradient-flow]");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const root = document.documentElement;
  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = 128;
  grainCanvas.height = 128;
  const grainContext = grainCanvas.getContext("2d");
  let grainPattern = null;

  if (grainContext) {
    const grain = grainContext.createImageData(grainCanvas.width, grainCanvas.height);
    for (let index = 0; index < grain.data.length; index += 4) {
      const tone = 126 + Math.floor(Math.random() * 24);
      grain.data[index] = tone;
      grain.data[index + 1] = tone;
      grain.data[index + 2] = tone;
      grain.data[index + 3] = 10 + Math.floor(Math.random() * 12);
    }
    grainContext.putImageData(grain, 0, 0);
    grainPattern = context.createPattern(grainCanvas, "repeat");
  }

  const state = {
    width: 0,
    height: 0,
    ratio: 1,
    frame: 0,
    then: 0,
    visible: !document.hidden,
    pointerX: 0.5,
    pointerY: 0.34,
    targetX: 0.5,
    targetY: 0.34,
    hoverX: 0.5,
    hoverY: 0.38,
    hoverStrength: 0,
    targetHoverStrength: 0,
  };

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(state.width * state.ratio);
    canvas.height = Math.round(state.height * state.ratio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
    render(performance.now(), true);
  }

  function paintRadial(x, y, radius, inner, middle, outer) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(0.58, middle);
    gradient.addColorStop(1, outer);
    context.fillStyle = gradient;
    context.fillRect(0, 0, state.width, state.height);
  }

  function paintFlowLines(seconds, dark) {
    const spacing = state.width <= 640 ? 14 : 12;
    const step = state.height <= 720 ? 11 : 12;
    const lineCount = Math.ceil(state.width / spacing) + 10;
    const centerY = state.height * (0.48 + Math.sin(seconds * 0.16) * 0.12);

    context.save();
    context.lineWidth = state.width <= 640 ? 0.72 : 0.82;
    context.strokeStyle = dark ? "rgba(147, 184, 210, 0.16)" : "rgba(111, 169, 207, 0.27)";
    context.globalCompositeOperation = dark ? "screen" : "multiply";

    for (let index = -5; index < lineCount; index += 1) {
      const baseX = index * spacing;
      const linePhase = index * 0.075;
      context.beginPath();

      for (let y = -step; y <= state.height + step; y += step) {
        const depth = y / Math.max(1, state.height);
        const distance = (y - centerY) / Math.max(1, state.height);
        const focus = Math.exp(-(distance * distance) * 13);
        const broadWave = Math.sin(y * 0.0062 - seconds * 0.34 + linePhase) * 9;
        const fineWave = Math.sin(y * 0.015 + seconds * 0.46 + linePhase * 1.8) * 2.8;
        const rollingDepth = Math.sin((baseX / Math.max(1, state.width)) * Math.PI * 2.15 + seconds * 0.22) * (20 + depth * 12) * focus;
        const perspectiveLean = Math.sin(seconds * 0.12 + depth * 2.4) * (depth - 0.5) * 10;
        const hoverDx = baseX - state.hoverX * state.width;
        const hoverDy = y - state.hoverY * state.height;
        const hoverDistance = Math.hypot(hoverDx, hoverDy);
        const hoverFalloff = Math.max(0, 1 - hoverDistance / 230) ** 2;
        const hoverBend = (hoverDx / Math.max(1, hoverDistance)) * 12 * hoverFalloff * state.hoverStrength;
        const x = baseX + broadWave + fineWave + rollingDepth + perspectiveLean + hoverBend;

        if (y === -step) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.stroke();
    }

    context.restore();
  }

  function render(time, force = false) {
    const animate = !reducedMotion.matches && state.visible;
    if (!force && !animate) return;

    const seconds = time * 0.001;
    const ease = force ? 1 : 0.055;
    const autoX = 0.5 + Math.sin(seconds * 0.17) * 0.28;
    const autoY = 0.38 + Math.cos(seconds * 0.13) * 0.2;
    state.hoverStrength += (state.targetHoverStrength - state.hoverStrength) * (force ? 1 : 0.08);
    const hoverMix = state.hoverStrength * 0.2;
    state.targetX = autoX * (1 - hoverMix) + state.hoverX * hoverMix;
    state.targetY = autoY * (1 - hoverMix) + state.hoverY * hoverMix;
    state.pointerX += (state.targetX - state.pointerX) * ease;
    state.pointerY += (state.targetY - state.pointerY) * ease;
    const dark = root.dataset.theme === "dark";
    const driftX = Math.sin(seconds * 0.12) * state.width * 0.045;
    const driftY = Math.cos(seconds * 0.09) * state.height * 0.04;
    const lightX = state.width * (0.33 + state.pointerX * 0.2) + driftX;
    const lightY = state.height * (0.18 + state.pointerY * 0.16) + driftY;
    const noteShadowX = 48 + (0.5 - state.pointerX) * 20;
    const noteShadowY = 56 + (0.5 - state.pointerY) * 18;
    const stickerShadowX = 22 + (0.5 - state.pointerX) * 10;
    const stickerShadowY = 30 + (0.5 - state.pointerY) * 10;

    root.style.setProperty("--dynamic-note-shadow-x", `${noteShadowX.toFixed(1)}px`);
    root.style.setProperty("--dynamic-note-shadow-y", `${noteShadowY.toFixed(1)}px`);
    root.style.setProperty("--sticker-shadow-x", `${stickerShadowX.toFixed(1)}px`);
    root.style.setProperty("--sticker-shadow-y", `${stickerShadowY.toFixed(1)}px`);

    context.clearRect(0, 0, state.width, state.height);
    context.fillStyle = dark ? "#171a1f" : "#f5f7f8";
    context.fillRect(0, 0, state.width, state.height);

    const directional = context.createLinearGradient(0, 0, state.width, state.height);
    if (dark) {
      directional.addColorStop(0, "rgba(255,255,255,0.028)");
      directional.addColorStop(0.52, "rgba(255,255,255,0)");
      directional.addColorStop(1, "rgba(0,0,0,0.14)");
    } else {
      directional.addColorStop(0, "rgba(255,255,255,0.72)");
      directional.addColorStop(0.5, "rgba(255,255,255,0.08)");
      directional.addColorStop(1, "rgba(92,104,113,0.09)");
    }
    context.fillStyle = directional;
    context.fillRect(0, 0, state.width, state.height);

    paintRadial(
      lightX,
      lightY,
      Math.max(state.width, state.height) * 0.7,
      dark ? "rgba(152,179,195,0.07)" : "rgba(255,255,255,0.54)",
      dark ? "rgba(111,139,157,0.025)" : "rgba(255,255,255,0.12)",
      "rgba(255,255,255,0)"
    );

    paintRadial(
      state.width * 0.86 + Math.sin(seconds * 0.08) * state.width * 0.04,
      state.height * 0.73 + Math.cos(seconds * 0.11) * state.height * 0.035,
      Math.max(state.width, state.height) * 0.54,
      dark ? "rgba(0,0,0,0.16)" : "rgba(72,83,92,0.08)",
      dark ? "rgba(0,0,0,0.07)" : "rgba(72,83,92,0.025)",
      "rgba(0,0,0,0)"
    );

    paintFlowLines(seconds, dark);

    if (grainPattern) {
      context.save();
      context.globalAlpha = dark ? 0.22 : 0.16;
      context.fillStyle = grainPattern;
      context.fillRect(0, 0, state.width, state.height);
      context.restore();
    }

    if (animate) state.frame = window.requestAnimationFrame(loop);
  }

  function loop(time) {
    const frameGap = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 25 : 16;
    if (time - state.then < frameGap) {
      state.frame = window.requestAnimationFrame(loop);
      return;
    }
    state.then = time;
    render(time);
  }

  function restart() {
    window.cancelAnimationFrame(state.frame);
    state.frame = 0;
    if (reducedMotion.matches) render(performance.now(), true);
    else if (state.visible) state.frame = window.requestAnimationFrame(loop);
  }

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      window.cancelAnimationFrame(state.frame);
      state.frame = 0;
      resize();
      restart();
    });
  });
  document.addEventListener("visibilitychange", () => {
    state.visible = !document.hidden;
    restart();
  });
  reducedMotion.addEventListener?.("change", restart);

  window.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    state.hoverX = Math.min(1, Math.max(0, event.clientX / Math.max(1, state.width)));
    state.hoverY = Math.min(1, Math.max(0, event.clientY / Math.max(1, state.height)));
    state.targetHoverStrength = 1;
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", () => {
    state.targetHoverStrength = 0;
  });

  resize();
  restart();
}

function setupInteractiveShapeGridBackground() {
  const canvas = document.querySelector("[data-gradient-flow]");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!context) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const state = {
    width: 0,
    height: 0,
    ratio: 1,
    shapes: [],
    pointer: null,
    activity: 0,
    targetActivity: 0,
    frame: 0,
    visible: !document.hidden,
    idleIndex: -1,
    previousIdleIndex: -1,
    idleStartedAt: 0,
    idleNextAt: 0,
  };

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const random = (minimum, maximum) => Math.random() * (maximum - minimum) + minimum;
  const smooth = (value) => {
    const amount = clamp(value, 0, 1);
    return amount * amount * (3 - 2 * amount);
  };
  const easing = (seconds) => seconds <= 0 ? 1 : 1 - 0.05 ** (1 / (60 * seconds));

  const makeShape = (x, y) => ({
    x,
    y,
    size: 12.16,
    scale: 0.22,
  });

  const buildShapes = () => {
    state.shapes = [];
    const spacing = state.width <= 640 ? 38 : 44;
    const columns = Math.max(1, Math.floor(state.width / spacing));
    const rows = Math.max(1, Math.floor(state.height / spacing));
    const offsetX = (state.width - (columns - 1) * spacing) / 2;
    const offsetY = (state.height - (rows - 1) * spacing) / 2;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        state.shapes.push(makeShape(offsetX + column * spacing, offsetY + row * spacing));
      }
    }
  };

  const resize = () => {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.min(Math.round(state.width * state.ratio), 8192);
    canvas.height = Math.min(Math.round(state.height * state.ratio), 8192);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
    buildShapes();
    state.idleIndex = -1;
    state.idleNextAt = performance.now() + random(300, 800);
  };

  const drawShape = (shape) => {
    context.beginPath();
    context.arc(0, 0, shape.size / 1.5, 0, Math.PI * 2);
    context.fill();
  };

  const render = () => {
    const time = performance.now();
    const dark = root.dataset.theme === "dark";
    const hoverRadius = 145;
    context.clearRect(0, 0, state.width, state.height);
    state.activity += (state.targetActivity - state.activity) * 0.16;

    if (state.shapes.length) {
      if (state.idleIndex < 0 && time >= state.idleNextAt) {
        let nextIndex = Math.floor(Math.random() * state.shapes.length);
        if (state.shapes.length > 1 && nextIndex === state.previousIdleIndex) {
          nextIndex = (nextIndex + 1) % state.shapes.length;
        }
        state.idleIndex = nextIndex;
        state.previousIdleIndex = nextIndex;
        state.idleStartedAt = time;
      } else if (state.idleIndex >= 0 && time - state.idleStartedAt >= 720) {
        state.idleIndex = -1;
        state.idleNextAt = time + random(180, 520);
      }
    }

    state.shapes.forEach((shape, shapeIndex) => {
      let hoverAmount = 0;
      let idleAmount = 0;

      if (state.pointer && state.activity > 0.001) {
        const distance = Math.hypot(shape.x - state.pointer.x, shape.y - state.pointer.y);
        hoverAmount = smooth(1 - distance / hoverRadius) * state.activity;
      }

      if (shapeIndex === state.idleIndex) {
        const progress = clamp((time - state.idleStartedAt) / 720, 0, 1);
        idleAmount = Math.sin(Math.PI * progress);
      }

      const targetScale = 0.22 + Math.max(idleAmount * 0.15, hoverAmount * 0.24);
      shape.scale += (targetScale - shape.scale) * easing(targetScale > shape.scale ? 0.5 : 0.6);

      context.save();
      context.translate(shape.x, shape.y);
      context.scale(shape.scale, shape.scale);
      const restingAlpha = dark ? 0.14 : 0.1;
      context.fillStyle = dark
        ? `rgba(207, 222, 231, ${restingAlpha + idleAmount * 0.22 + hoverAmount * 0.42})`
        : `rgba(21, 49, 61, ${restingAlpha + idleAmount * 0.2 + hoverAmount * 0.4})`;
      drawShape(shape);
      context.restore();
    });

    if (state.visible && !reducedMotion.matches) state.frame = requestAnimationFrame(render);
  };

  const restart = () => {
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    if (reducedMotion.matches) render();
    else if (state.visible) state.frame = requestAnimationFrame(render);
  };

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resize();
      restart();
    });
  });

  window.addEventListener("pointermove", (event) => {
    if (coarsePointer.matches || reducedMotion.matches) return;
    state.pointer = { x: event.clientX, y: event.clientY };
    state.targetActivity = 1;
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", () => {
    state.targetActivity = 0;
  });

  document.addEventListener("visibilitychange", () => {
    state.visible = !document.hidden;
    restart();
  });
  reducedMotion.addEventListener?.("change", restart);

  resize();
  restart();
}

setupInteractiveShapeGridBackground();

function setupAboutPolaroidInteraction() {
  const polaroid = document.querySelector("[data-about-polaroid]");
  const section = polaroid?.closest(".home-about-section");
  const home = polaroid?.closest(".home-about-portrait");
  if (!polaroid || !section || !home) return;

  let pointerId = null;
  let pressed = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let startRect = null;
  let settleTimer = 0;

  const writePosition = (x, y) => {
    currentX = x;
    currentY = y;
    polaroid.style.setProperty("--about-drag-x", `${x.toFixed(1)}px`);
    polaroid.style.setProperty("--about-drag-y", `${y.toFixed(1)}px`);
  };

  const constrain = (x, y) => {
    if (!startRect) return { x, y };
    const bounds = section.getBoundingClientRect();
    const inset = 18;
    return {
      x: Math.min(Math.max(x, bounds.left + inset - startRect.left), bounds.right - inset - startRect.right),
      y: Math.min(Math.max(y, bounds.top + inset - startRect.top), bounds.bottom - inset - startRect.bottom),
    };
  };

  const putBack = () => {
    polaroid.classList.remove("is-dragging");
    polaroid.classList.add("is-settling");
    writePosition(0, 0);
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      polaroid.classList.remove("is-settling");
      home.classList.remove("is-polaroid-away");
    }, 460);
  };

  polaroid.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    pressed = true;
    dragging = false;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startRect = polaroid.getBoundingClientRect();
  });

  polaroid.addEventListener("pointermove", (event) => {
    if (!pressed || event.pointerId !== pointerId) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!dragging && Math.hypot(deltaX, deltaY) < 5) return;
    if (!dragging) {
      dragging = true;
      polaroid.classList.add("is-dragging");
      home.classList.add("is-polaroid-away");
      polaroid.setAttribute("aria-grabbed", "true");
      polaroid.setPointerCapture?.(event.pointerId);
    }

    const next = constrain(deltaX, deltaY);
    writePosition(next.x, next.y);
    if (event.cancelable) event.preventDefault();
  });

  const finish = (event) => {
    if (!pressed || event.pointerId !== pointerId) return;
    pressed = false;
    if (dragging) {
      dragging = false;
      polaroid.setAttribute("aria-grabbed", "false");
      putBack();
    }
    polaroid.releasePointerCapture?.(event.pointerId);
  };

  polaroid.addEventListener("pointerup", finish);
  polaroid.addEventListener("pointercancel", finish);
  polaroid.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Home") {
      event.preventDefault();
      putBack();
    }
  });
}

setupAboutPolaroidInteraction();

function setupMusicSticker() {
  const player = document.querySelector("[data-music-player]");
  const audio = player?.querySelector("audio");
  const toggles = [...(player?.querySelectorAll("[data-music-toggle]") || [])];
  const previous = player?.querySelector("[data-music-prev]");
  const next = player?.querySelector("[data-music-next]");
  const title = player?.querySelector("[data-music-title]");
  const meta = player?.querySelector("[data-music-meta]");
  const stateIcons = [...(player?.querySelectorAll(".muhid-music-player__state-icon") || [])];
  if (!player || !(audio instanceof HTMLAudioElement) || !toggles.length || !previous || !next || !title || !meta || !stateIcons.length) return;

  const tracks = [
    {
      title: "Divenire",
      meta: "Ludovico Einaudi, Robert Ziegler, and Royal Philharmonic Orchestra • Divenire (Deluxe Edition)",
      src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4a/7e/37/4a7e3771-0b91-806b-66a1-1a166d2a0ceb/mzaf_16913843404009221634.plus.aac.p.m4a",
      volume: 0.8,
      offset: 0,
    },
    { title: "Lamentations", meta: "Kevin MacLeod", src: "assets/muhid-player/jazz-4.mp3", volume: 0.8, offset: 4 },
    { title: "Bossa Antigua", meta: "Kevin MacLeod", src: "assets/muhid-player/jazz-8.mp3", volume: 0.45, offset: 0 },
    { title: "Crinoline Dreams", meta: "Kevin MacLeod", src: "assets/muhid-player/jazz-6.mp3", volume: 0.3, offset: 0 },
  ];
  let trackIndex = 0;

  const setPlaying = (playing) => {
    player.classList.toggle("is-playing", playing);
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(playing));
      toggle.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${tracks[trackIndex].title}`);
    });
    const iconSource = playing ? "assets/muhid-player/pause.svg" : "assets/muhid-player/play.svg";
    stateIcons.forEach((icon) => { icon.src = iconSource; });
  };

  const togglePlayback = async () => {
    if (audio.paused) {
      try {
        if (audio.currentTime < tracks[trackIndex].offset) audio.currentTime = tracks[trackIndex].offset;
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  const selectTrack = async (direction) => {
    const shouldResume = !audio.paused;
    audio.pause();
    trackIndex = (trackIndex + direction + tracks.length) % tracks.length;
    const track = tracks[trackIndex];
    title.textContent = track.title;
    meta.textContent = track.meta;
    audio.src = track.src;
    audio.volume = track.volume;
    audio.load();
    setPlaying(false);
    if (shouldResume) {
      try {
        audio.currentTime = track.offset;
        await audio.play();
      } catch {
        setPlaying(false);
      }
    }
  };

  toggles.forEach((toggle) => toggle.addEventListener("click", togglePlayback));
  previous.addEventListener("click", () => selectTrack(-1));
  next.addEventListener("click", () => selectTrack(1));

  audio.addEventListener("play", () => {
    setPlaying(true);
  });
  audio.addEventListener("pause", () => {
    setPlaying(false);
  });
  audio.addEventListener("ended", () => {
    audio.currentTime = tracks[trackIndex].offset;
    audio.play().catch(() => setPlaying(false));
  });
  audio.volume = tracks[trackIndex].volume;
  setPlaying(false);
}

setupMusicSticker();

function setupAboutQuestions() {
  const faq = document.querySelector("[data-imessage-faq]");
  const exchanges = [...(faq?.querySelectorAll(".imessage-exchange") || [])];
  const answers = [...(faq?.querySelectorAll(".imessage-answer") || [])];
  if (!faq || !exchanges.length) return;

  exchanges.forEach((exchange) => {
    const question = exchange.querySelector(".imessage-question");
    const answer = document.getElementById(question?.getAttribute("aria-controls") || "");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      exchanges.forEach((otherExchange) => {
        const otherQuestion = otherExchange.querySelector(".imessage-question");
        otherExchange.classList.remove("is-open");
        otherQuestion?.setAttribute("aria-expanded", "false");
      });
      answers.forEach((otherAnswer) => {
        otherAnswer.hidden = true;
      });

      exchange.classList.add("is-open");
      question.setAttribute("aria-expanded", "true");
      answer.hidden = false;
    });
  });
}

setupAboutQuestions();

function setupAboutResumePreview() {
  const trigger = document.querySelector("[data-resume-preview]");
  const modal = document.querySelector("[data-resume-modal]");
  const closeButtons = [...(modal?.querySelectorAll("[data-resume-modal-close]") || [])];
  if (!trigger || !modal || !closeButtons.length) return;

  const closeControl = closeButtons.find((button) => button.closest(".about-resume-modal__dialog"));

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("has-resume-modal");
    trigger.focus();
  };

  const openModal = () => {
    modal.hidden = false;
    document.body.classList.add("has-resume-modal");
    closeControl?.focus();
  };

  trigger.addEventListener("click", openModal);
  closeButtons.forEach((button) => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
}

setupAboutResumePreview();

function setupFunMarquee() {
  const marquee = document.querySelector("[data-fun-marquee]");
  const track = marquee?.querySelector("[data-fun-marquee-track]");
  if (!marquee || !track) return;

  const originalTiles = [...track.querySelectorAll("[data-fun-tile]")];
  if (!originalTiles.length) return;

  for (let copy = 0; copy < 2; copy += 1) {
    originalTiles.forEach((tile) => track.appendChild(tile.cloneNode(true)));
  }

  const tiles = [...track.querySelectorAll("[data-fun-tile]")];
  let velocity = 0;
  let momentumFrame = 0;
  let dragging = false;
  let previousX = 0;

  const cycleWidth = () => {
    const first = tiles[0];
    const secondCycle = tiles[originalTiles.length];
    return first && secondCycle ? secondCycle.offsetLeft - first.offsetLeft : track.scrollWidth / 3;
  };

  const wrapScrollPosition = () => {
    const cycle = cycleWidth();
    if (cycle > 0) {
      if (track.scrollLeft < cycle * 0.5) track.scrollLeft += cycle;
      if (track.scrollLeft > cycle * 1.5) track.scrollLeft -= cycle;
    }
  };

  const runMomentum = () => {
    track.scrollLeft += velocity;
    velocity *= 0.95;
    wrapScrollPosition();
    if (Math.abs(velocity) > 0.04) momentumFrame = requestAnimationFrame(runMomentum);
    else {
      velocity = 0;
      momentumFrame = 0;
    }
  };

  const startMomentum = () => {
    if (!momentumFrame) momentumFrame = requestAnimationFrame(runMomentum);
  };

  track.addEventListener("wheel", (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    velocity += delta * 0.55;
    startMomentum();
  }, { passive: false });

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    dragging = true;
    previousX = event.clientX;
    velocity = 0;
    track.classList.add("is-dragging");
    track.setPointerCapture?.(event.pointerId);
    cancelAnimationFrame(momentumFrame);
    momentumFrame = 0;
  });

  track.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const movement = event.clientX - previousX;
    previousX = event.clientX;
    track.scrollLeft -= movement;
    velocity = -movement;
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    track.releasePointerCapture?.(event.pointerId);
    startMomentum();
  };

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("scroll", wrapScrollPosition, { passive: true });

  requestAnimationFrame(() => {
    track.scrollLeft = cycleWidth();
    wrapScrollPosition();
  });
}

setupFunMarquee();

function setupAamiArcade() {
  const game = document.querySelector("[data-aami-game]");
  const canvas = game?.querySelector("[data-game-canvas]");
  const startOverlay = game?.querySelector("[data-game-start]");
  const finishOverlay = game?.querySelector("[data-game-finish]");
  const startButton = game?.querySelector("[data-game-start-button]");
  const playAgainButton = game?.querySelector("[data-game-play-again]");
  const restartButton = game?.querySelector("[data-game-restart]");
  const jumpButton = game?.querySelector("[data-game-jump]");
  const scoreNode = game?.querySelector("[data-game-score]");
  const statusNode = game?.querySelector("[data-game-status]");
  if (!game || !(canvas instanceof HTMLCanvasElement) || !window.Matter) return;
  if (!startOverlay || !finishOverlay || !startButton || !playAgainButton || !restartButton || !jumpButton || !scoreNode || !statusNode) return;

  const { Engine, Bodies, Body, Composite, Events } = window.Matter;
  const context = canvas.getContext("2d");
  if (!context) return;

  const WORLD_WIDTH = 4300;
  const WORLD_HEIGHT = 520;
  const FLOOR_Y = 390;
  const PLAYER_X = 150;
  const TOTAL_STICKERS = 10;
  const stickerSources = [
    "assets/user-stickers/figma-sticker.png",
    "assets/user-stickers/smiley-flower.png",
    "assets/user-stickers/yellow-star.png",
    "assets/user-stickers/yellow-ami-star.png",
    "assets/user-stickers/designsbyaami-logo.png",
  ];
  const stickerImages = stickerSources.map((source) => {
    const image = new Image();
    image.src = source;
    return image;
  });
  const playerImage = new Image();
  playerImage.src = "assets/user-stickers/bunny-headphones.png";

  const groundSegments = [
    { x: 0, width: 900 },
    { x: 1040, width: 780 },
    { x: 1960, width: 870 },
    { x: 2970, width: 650 },
    { x: 3750, width: 650 },
  ];
  const platforms = [
    { x: 540, y: 315, width: 170 },
    { x: 1160, y: 300, width: 180 },
    { x: 1420, y: 248, width: 150 },
    { x: 1710, y: 322, width: 120 },
    { x: 2100, y: 292, width: 170 },
    { x: 2430, y: 235, width: 170 },
    { x: 2760, y: 305, width: 130 },
    { x: 3170, y: 270, width: 170 },
    { x: 3480, y: 320, width: 140 },
    { x: 3890, y: 270, width: 190 },
  ];
  const stickerLayout = [
    { x: 620, y: 265, type: 0 },
    { x: 1100, y: 330, type: 1 },
    { x: 1250, y: 250, type: 2 },
    { x: 1495, y: 198, type: 3 },
    { x: 2175, y: 242, type: 4 },
    { x: 2510, y: 185, type: 0 },
    { x: 3120, y: 335, type: 1 },
    { x: 3255, y: 220, type: 2 },
    { x: 3550, y: 270, type: 3 },
    { x: 3990, y: 220, type: 4 },
  ];

  let engine;
  let player;
  let stickers = [];
  let collected = 0;
  let cameraX = 0;
  let running = false;
  let finished = false;
  let grounded = false;
  let frameId = 0;
  let previousTime = 0;
  let stageWidth = 0;
  let stageHeight = 0;
  let pixelRatio = 1;

  const addStaticBox = (x, y, width, height, label) => {
    const body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
      isStatic: true,
      friction: 0,
      label,
    });
    Composite.add(engine.world, body);
  };

  const buildWorld = () => {
    if (frameId) cancelAnimationFrame(frameId);
    engine = Engine.create({ gravity: { x: 0, y: 1.25 } });
    engine.positionIterations = 8;
    engine.velocityIterations = 6;

    groundSegments.forEach((segment) => {
      addStaticBox(segment.x, FLOOR_Y, segment.width, WORLD_HEIGHT - FLOOR_Y + 80, "ground");
    });
    platforms.forEach((platform) => {
      addStaticBox(platform.x, platform.y, platform.width, 18, "platform");
    });

    player = Bodies.rectangle(PLAYER_X, FLOOR_Y - 36, 38, 48, {
      chamfer: { radius: 8 },
      friction: 0,
      frictionAir: 0.015,
      inertia: Infinity,
      restitution: 0,
      label: "player",
    });
    Composite.add(engine.world, player);

    Events.on(engine, "collisionActive", (event) => {
      grounded = event.pairs.some((pair) => {
        const other = pair.bodyA === player ? pair.bodyB : pair.bodyB === player ? pair.bodyA : null;
        return other && (other.label === "ground" || other.label === "platform") &&
          player.position.y < other.bounds.min.y;
      });
    });

    stickers = stickerLayout.map((sticker) => ({ ...sticker, collected: false }));
    collected = 0;
    cameraX = 0;
    grounded = false;
    finished = false;
    previousTime = performance.now();
    scoreNode.textContent = "0";
    statusNode.textContent = "Ready";
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    stageWidth = Math.max(1, rect.width);
    stageHeight = Math.max(1, rect.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(stageWidth * pixelRatio);
    canvas.height = Math.round(stageHeight * pixelRatio);
  };

  const resetPlayer = () => {
    const previousGround = [...groundSegments].reverse().find((segment) => segment.x < player.position.x);
    const segment = previousGround || groundSegments[0];
    const safeX = Math.max(segment.x + 70, Math.min(player.position.x - 120, segment.x + segment.width - 70));
    Body.setPosition(player, { x: safeX, y: FLOOR_Y - 60 });
    Body.setVelocity(player, { x: 0, y: 0 });
    statusNode.textContent = "Back on track";
  };

  const jump = () => {
    if (!running || finished || !grounded) return;
    Body.setVelocity(player, { x: player.velocity.x, y: -11.5 });
    grounded = false;
  };

  const collectNearbyStickers = () => {
    stickers.forEach((sticker) => {
      if (sticker.collected) return;
      const distanceX = Math.abs(player.position.x - sticker.x);
      const distanceY = Math.abs(player.position.y - sticker.y);
      if (distanceX < 42 && distanceY < 48) {
        sticker.collected = true;
        collected += 1;
        scoreNode.textContent = String(collected);
        statusNode.textContent = collected === TOTAL_STICKERS ? "Sticker book complete" : `Found ${collected} of ${TOTAL_STICKERS}`;
      }
    });
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    const corner = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, corner);
  };

  const drawBackground = (ctx, visibleWidth) => {
    ctx.fillStyle = "#fbfdff";
    ctx.fillRect(cameraX, 0, visibleWidth, WORLD_HEIGHT);

    ctx.strokeStyle = "rgba(120, 184, 214, .22)";
    ctx.lineWidth = 1;
    for (let x = Math.floor(cameraX / 36) * 36; x < cameraX + visibleWidth + 36; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 12, FLOOR_Y);
      ctx.stroke();
    }

    const skylineStart = Math.floor(cameraX / 110) * 110;
    for (let x = skylineStart; x < cameraX + visibleWidth + 120; x += 110) {
      const seed = Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
      const height = 45 + seed * 105;
      ctx.fillStyle = "rgba(20, 47, 61, .055)";
      ctx.fillRect(x, FLOOR_Y - height, 74, height);
      ctx.fillStyle = "rgba(20, 47, 61, .09)";
      for (let row = FLOOR_Y - height + 12; row < FLOOR_Y - 10; row += 14) {
        ctx.fillRect(x + 12, row, 7, 5);
        ctx.fillRect(x + 31, row, 7, 5);
        ctx.fillRect(x + 50, row, 7, 5);
      }
    }

    ctx.fillStyle = "rgba(255, 203, 232, .62)";
    ctx.beginPath();
    ctx.ellipse(cameraX + visibleWidth * 0.22, 90, 42, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(cameraX + visibleWidth * 0.22 - 22, 92, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawGround = (ctx) => {
    groundSegments.forEach((segment) => {
      ctx.fillStyle = "#142f3d";
      ctx.fillRect(segment.x, FLOOR_Y, segment.width, WORLD_HEIGHT - FLOOR_Y + 30);
      ctx.fillStyle = "#df58a3";
      ctx.fillRect(segment.x, FLOOR_Y, segment.width, 7);
      ctx.strokeStyle = "rgba(255, 255, 255, .08)";
      ctx.lineWidth = 1;
      for (let x = segment.x; x < segment.x + segment.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, FLOOR_Y + 7);
        ctx.lineTo(x, WORLD_HEIGHT);
        ctx.stroke();
      }
      for (let y = FLOOR_Y + 31; y < WORLD_HEIGHT; y += 32) {
        ctx.beginPath();
        ctx.moveTo(segment.x, y);
        ctx.lineTo(segment.x + segment.width, y);
        ctx.stroke();
      }
    });

    platforms.forEach((platform, index) => {
      ctx.fillStyle = index % 2 ? "#ffda54" : "#78b8d6";
      drawRoundedRect(ctx, platform.x, platform.y, platform.width, 18, 4);
      ctx.fill();
      ctx.fillStyle = "#142f3d";
      ctx.fillRect(platform.x + 6, platform.y + 13, platform.width - 12, 5);
    });
  };

  const drawFinish = (ctx) => {
    const x = 4180;
    ctx.strokeStyle = "#142f3d";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - 50, FLOOR_Y);
    ctx.lineTo(x - 50, FLOOR_Y - 112);
    ctx.quadraticCurveTo(x, FLOOR_Y - 160, x + 50, FLOOR_Y - 112);
    ctx.lineTo(x + 50, FLOOR_Y);
    ctx.stroke();
    ctx.fillStyle = "#ffcbe8";
    drawRoundedRect(ctx, x - 58, FLOOR_Y - 124, 116, 28, 5);
    ctx.fill();
    ctx.fillStyle = "#142f3d";
    ctx.font = "700 12px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("STICKER CLUB", x, FLOOR_Y - 106);
  };

  const drawScene = () => {
    const scale = stageHeight / WORLD_HEIGHT;
    const visibleWidth = stageWidth / scale;
    context.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, -cameraX * pixelRatio * scale, 0);
    context.clearRect(cameraX, 0, visibleWidth, WORLD_HEIGHT);
    drawBackground(context, visibleWidth);
    drawGround(context);
    drawFinish(context);

    stickers.forEach((sticker, index) => {
      if (sticker.collected) return;
      const bob = Math.sin(performance.now() / 280 + index) * 5;
      const image = stickerImages[sticker.type];
      if (image.complete && image.naturalWidth) {
        context.drawImage(image, sticker.x - 24, sticker.y - 24 + bob, 48, 48);
      }
    });

    context.save();
    context.translate(player.position.x, player.position.y);
    context.rotate(Math.max(-0.12, Math.min(0.12, player.velocity.y * 0.012)));
    if (playerImage.complete && playerImage.naturalWidth) {
      context.drawImage(playerImage, -28, -32, 56, 56);
    } else {
      context.fillStyle = "#142f3d";
      drawRoundedRect(context, -19, -24, 38, 48, 8);
      context.fill();
    }
    context.restore();
  };

  const tick = (time) => {
    const elapsed = Math.min(32, time - previousTime || 16.67);
    previousTime = time;

    if (running && !finished) {
      grounded = false;
      Engine.update(engine, elapsed);
      Body.setVelocity(player, { x: 5.1, y: player.velocity.y });
      collectNearbyStickers();

      const scale = stageHeight / WORLD_HEIGHT;
      const visibleWidth = stageWidth / scale;
      cameraX = Math.max(0, Math.min(WORLD_WIDTH - visibleWidth, player.position.x - visibleWidth * 0.28));

      if (player.position.y > WORLD_HEIGHT + 80) resetPlayer();
      if (player.position.x >= 4160) {
        finished = true;
        running = false;
        statusNode.textContent = collected === TOTAL_STICKERS ? "Perfect run" : `${collected} stickers found`;
        finishOverlay.hidden = false;
      }
    }

    drawScene();
    frameId = requestAnimationFrame(tick);
  };

  const startGame = () => {
    if (finished) buildWorld();
    running = true;
    finished = false;
    startOverlay.hidden = true;
    finishOverlay.hidden = true;
    statusNode.textContent = "Collecting";
    game.focus({ preventScroll: true });
  };

  const restartGame = () => {
    buildWorld();
    startOverlay.hidden = false;
    finishOverlay.hidden = true;
    drawScene();
    frameId = requestAnimationFrame(tick);
  };

  game.addEventListener("keydown", (event) => {
    if (["ArrowUp", " ", "Spacebar", "w", "W"].includes(event.key)) {
      event.preventDefault();
      jump();
    }
  });
  canvas.addEventListener("pointerdown", jump);
  jumpButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    jump();
  });
  startButton.addEventListener("click", startGame);
  playAgainButton.addEventListener("click", restartGame);
  restartButton.addEventListener("click", restartGame);

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    drawScene();
  });
  resizeObserver.observe(canvas);

  buildWorld();
  resizeCanvas();
  drawScene();
  frameId = requestAnimationFrame(tick);
}

setupAamiArcade();

themeButton?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  try {
    localStorage.setItem("amina-theme", nextTheme);
  } catch {
    // Theme still changes for the current page when storage is unavailable.
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
});
