(() => {
  "use strict";

  const DESKTOP_WIDTH = 1280;
  const MODE_KEY = "aami-desktop-view";
  const TIP_KEY = "aami-desktop-tip-seen";
  const ROOT = document.documentElement;
  const MOBILE_VIEWPORT = "width=device-width, initial-scale=1";
  const state = {
    capable: false,
    desktop: false,
    control: null,
    viewportObserver: null,
    loaderObserver: null,
    overlay: null,
    overlayTimer: 0,
    resizeTimer: 0,
    managedTimers: new Set(),
    recalculationTimers: new Set(),
    animationFrame: 0,
    overlayFrame: 0,
    pageReady: false,
  };

  const readSession = (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writeSession = (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Browsing can continue when storage is unavailable.
    }
  };

  const removeSession = (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Browsing can continue when storage is unavailable.
    }
  };

  const isSmallTouchDevice = () => {
    const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
    const hasTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    const shortScreenEdge = Math.min(
      Number(window.screen?.width) || window.innerWidth,
      Number(window.screen?.height) || window.innerHeight,
    );
    return Boolean(coarsePointer && hasTouch && shortScreenEdge <= 600);
  };

  const getPhysicalViewport = () => {
    const viewport = window.visualViewport;
    if (viewport?.width && viewport?.height && viewport?.scale) {
      return {
        width: viewport.width * viewport.scale,
        height: viewport.height * viewport.scale,
      };
    }

    const screenWidth = Number(window.screen?.width) || window.innerWidth;
    const screenHeight = Number(window.screen?.height) || window.innerHeight;
    const landscape = window.matchMedia?.("(orientation: landscape)")?.matches;

    return landscape
      ? { width: Math.max(screenWidth, screenHeight), height: Math.min(screenWidth, screenHeight) }
      : { width: Math.min(screenWidth, screenHeight), height: Math.max(screenWidth, screenHeight) };
  };

  const calculateDesktopScale = () => {
    const physicalWidth = getPhysicalViewport().width;
    return Math.min(1, Math.max(0.1, physicalWidth / DESKTOP_WIDTH));
  };

  const getViewportMeta = () => {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      document.head.prepend(viewport);
    }
    return viewport;
  };

  const desktopViewportContent = () => {
    const scale = calculateDesktopScale();
    return {
      content: `width=${DESKTOP_WIDTH}, initial-scale=${scale.toFixed(5)}`,
      scale,
    };
  };

  const setDesktopCssState = (scale) => {
    ROOT.classList.add("desktop-preview-active");
    ROOT.dataset.desktopPreview = "active";
    ROOT.style.setProperty("--desktop-preview-scale", scale.toFixed(5));
    ROOT.style.setProperty("--desktop-preview-inverse-scale", (1 / scale).toFixed(5));
  };

  const clearDesktopCssState = () => {
    ROOT.classList.remove("desktop-preview-active");
    delete ROOT.dataset.desktopPreview;
    ROOT.style.removeProperty("--desktop-preview-scale");
    ROOT.style.removeProperty("--desktop-preview-inverse-scale");
  };

  const applyDesktopViewport = () => {
    const viewport = getViewportMeta();
    const next = desktopViewportContent();
    if (viewport.content !== next.content) viewport.content = next.content;
    setDesktopCssState(next.scale);
    state.desktop = true;
    return next.scale;
  };

  const applyMobileViewport = () => {
    const viewport = getViewportMeta();
    if (viewport.content !== MOBILE_VIEWPORT) viewport.content = MOBILE_VIEWPORT;
    clearDesktopCssState();
    state.desktop = false;
  };

  const enforceDesktopViewport = () => {
    if (!state.desktop) return;
    applyDesktopViewport();
  };

  const startViewportProtection = () => {
    state.viewportObserver?.disconnect();
    state.viewportObserver = new MutationObserver(() => {
      if (!state.desktop) return;
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = window.requestAnimationFrame(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        const expected = desktopViewportContent().content;
        if (!viewport || viewport.content !== expected) enforceDesktopViewport();
      });
    });
    state.viewportObserver.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["content"],
    });
  };

  const stopViewportProtection = () => {
    state.viewportObserver?.disconnect();
    state.viewportObserver = null;
    window.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
  };

  const updateControl = () => {
    if (!state.control) return;
    const icon = state.control.querySelector("img");
    state.control.setAttribute(
      "aria-label",
      state.desktop ? "Return to mobile view" : "Switch to desktop view",
    );
    state.control.title = state.desktop ? "Return to mobile view" : "Desktop view";
    if (icon) {
      icon.src = state.desktop
        ? "/assets/icons/lucide-smartphone.svg"
        : "/assets/icons/lucide-monitor.svg";
    }
  };

  const clearOverlayTimer = () => {
    window.clearTimeout(state.overlayTimer);
    state.overlayTimer = 0;
  };

  const scheduleManaged = (callback, delay) => {
    const timer = window.setTimeout(() => {
      state.managedTimers.delete(timer);
      callback();
    }, delay);
    state.managedTimers.add(timer);
    return timer;
  };

  const dismissOverlay = ({ restoreFocus = false } = {}) => {
    if (!state.overlay) return;
    const overlay = state.overlay;
    clearOverlayTimer();
    window.cancelAnimationFrame(state.overlayFrame);
    state.overlayFrame = 0;
    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");
    scheduleManaged(() => overlay.remove(), 180);
    state.overlay = null;
    if (restoreFocus) state.control?.focus({ preventScroll: true });
  };

  const createOverlay = ({ kind, title, description, action, onAction }) => {
    dismissOverlay();

    const overlay = document.createElement("div");
    const titleId = `desktop-preview-${kind}-title`;
    const descriptionId = `desktop-preview-${kind}-description`;
    overlay.className = `desktop-preview-overlay desktop-preview-overlay--${kind}`;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", titleId);
    overlay.setAttribute("aria-describedby", descriptionId);
    overlay.setAttribute("aria-hidden", "true");
    overlay.tabIndex = -1;
    overlay.innerHTML = `
      <div class="desktop-preview-message">
        <h2 id="${titleId}">${title}</h2>
        <p id="${descriptionId}">${description}</p>
        <button type="button" class="desktop-preview-message__action">${action}</button>
      </div>
    `;

    const actionButton = overlay.querySelector(".desktop-preview-message__action");
    actionButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onAction();
    });
    overlay.addEventListener("pointerdown", (event) => {
      if (event.target === overlay) dismissOverlay({ restoreFocus: true });
    });
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") dismissOverlay({ restoreFocus: true });
    });

    document.body.append(overlay);
    state.overlay = overlay;
    state.overlayFrame = window.requestAnimationFrame(() => {
      state.overlayFrame = 0;
      overlay.classList.add("is-visible");
      overlay.setAttribute("aria-hidden", "false");
      overlay.focus({ preventScroll: true });
    });
    state.overlayTimer = window.setTimeout(
      () => dismissOverlay({ restoreFocus: true }),
      5000,
    );
  };

  const isLandscape = () => {
    const physical = getPhysicalViewport();
    return physical.width > physical.height;
  };

  const showRotationMessage = () => {
    if (!state.desktop || isLandscape()) return;
    createOverlay({
      kind: "rotation",
      title: "Rotate your screen.",
      description: "Turn your phone sideways for the full experience.",
      action: "Got it",
      onAction: () => dismissOverlay({ restoreFocus: true }),
    });
  };

  const attemptLandscapeLock = async () => {
    try {
      await window.screen?.orientation?.lock?.("landscape");
    } catch {
      // Most mobile browsers require fullscreen or do not support locking.
    }
  };

  const unlockOrientation = () => {
    try {
      window.screen?.orientation?.unlock?.();
    } catch {
      // Unlocking is optional and unsupported in some browsers.
    }
  };

  const resetHorizontalScroll = () => {
    window.scrollTo({ left: 0, top: window.scrollY, behavior: "auto" });
  };

  const runDelayedRecalculations = () => {
    state.recalculationTimers.forEach((timer) => window.clearTimeout(timer));
    state.recalculationTimers.clear();
    [0, 120, 320, 700].forEach((delay) => {
      const timer = window.setTimeout(() => {
        state.recalculationTimers.delete(timer);
        if (!state.desktop) return;
        enforceDesktopViewport();
        resetHorizontalScroll();
        if (isLandscape() && state.overlay?.classList.contains("desktop-preview-overlay--rotation")) {
          dismissOverlay();
        }
      }, delay);
      state.recalculationTimers.add(timer);
    });
  };

  const enableDesktopView = ({ showRotation = true } = {}) => {
    writeSession(MODE_KEY, "1");
    applyDesktopViewport();
    startViewportProtection();
    updateControl();
    resetHorizontalScroll();
    attemptLandscapeLock();
    runDelayedRecalculations();
    if (showRotation) scheduleManaged(showRotationMessage, 180);
  };

  const disableDesktopView = () => {
    state.managedTimers.forEach((timer) => window.clearTimeout(timer));
    state.managedTimers.clear();
    state.recalculationTimers.forEach((timer) => window.clearTimeout(timer));
    state.recalculationTimers.clear();
    dismissOverlay();
    stopViewportProtection();
    removeSession(MODE_KEY);
    applyMobileViewport();
    updateControl();
    unlockOrientation();
    resetHorizontalScroll();
  };

  const showRecommendation = () => {
    if (!state.capable || state.desktop || readSession(TIP_KEY) === "1") return;
    writeSession(TIP_KEY, "1");
    createOverlay({
      kind: "recommendation",
      title: "This portfolio looks more dope in desktop mode.",
      description: "Switch to the wider layout for the full visual experience.",
      action: "Switch to desktop",
      onAction: () => {
        dismissOverlay();
        enableDesktopView({ showRotation: true });
      },
    });
  };

  const waitForLoader = () => {
    const hasFinished = () =>
      !document.body.classList.contains("is-loading") &&
      !document.querySelector(".portfolio-loader");

    if (hasFinished()) {
      showRecommendation();
      return;
    }

    state.loaderObserver?.disconnect();
    state.loaderObserver = new MutationObserver(() => {
      if (!hasFinished()) return;
      state.loaderObserver?.disconnect();
      state.loaderObserver = null;
      showRecommendation();
    });
    state.loaderObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  };

  const createControl = () => {
    if (!state.capable || state.control) return;
    const navbar = document.querySelector(".site-navbar");
    if (!navbar) return;

    const control = document.createElement("button");
    control.type = "button";
    control.className = "desktop-view-toggle";
    control.innerHTML = '<img src="/assets/icons/lucide-monitor.svg" alt="" aria-hidden="true" />';
    control.addEventListener("click", () => {
      if (state.desktop) disableDesktopView();
      else enableDesktopView({ showRotation: true });
    });
    navbar.insertAdjacentElement("afterend", control);
    state.control = control;
    updateControl();
  };

  const handleResize = () => {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => {
      if (!state.desktop) return;
      enforceDesktopViewport();
      resetHorizontalScroll();
      if (isLandscape() && state.overlay?.classList.contains("desktop-preview-overlay--rotation")) {
        dismissOverlay();
      }
    }, 90);
  };

  const cleanup = () => {
    clearOverlayTimer();
    window.clearTimeout(state.resizeTimer);
    state.managedTimers.forEach((timer) => window.clearTimeout(timer));
    state.managedTimers.clear();
    state.recalculationTimers.forEach((timer) => window.clearTimeout(timer));
    state.recalculationTimers.clear();
    state.loaderObserver?.disconnect();
    stopViewportProtection();
    window.cancelAnimationFrame(state.overlayFrame);
    state.overlayFrame = 0;
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", runDelayedRecalculations);
    window.visualViewport?.removeEventListener("resize", handleResize);
  };

  state.capable = isSmallTouchDevice();
  ROOT.dataset.desktopPreviewCapable = state.capable ? "true" : "false";
  state.desktop = state.capable && readSession(MODE_KEY) === "1";
  if (state.desktop) applyDesktopViewport();

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      state.pageReady = true;
      createControl();
      if (state.desktop) startViewportProtection();
      else waitForLoader();
    },
    { once: true },
  );

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", runDelayedRecalculations, { passive: true });
  window.visualViewport?.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("pagehide", cleanup, { once: true });
})();
