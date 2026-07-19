/* ═══════════════════════════════════════════════════════
   HORNIFIER Landing Page — app.js
   Vanilla JS, no dependencies.
   Reads window.HORNIFIER_CONFIG (defined in config.js).
═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── Guard: wait for DOM ─────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ─── Main init ───────────────────────────────────── */
  function init() {
    var cfg = window.HORNIFIER_CONFIG || {};

    // Patch price labels from config so they always match config.js.
    updatePriceLabels(cfg);

    // Wire CTA buttons.
    initBuyButtons(cfg);
    initTrialButtons(cfg);

    // A/B audio player.
    initABPlayer(cfg);

    // FAQ accordion.
    initFAQ();
  }

  /* ─── Price labels ────────────────────────────────── */
  function updatePriceLabels(cfg) {
    // .cta-price spans inside buy buttons
    var ctaPrices = document.querySelectorAll(".cta-price");
    ctaPrices.forEach(function (el) {
      el.textContent = cfg.PRICE || "$49";
    });

    // Standalone price display in pricing card
    var priceDisplay = document.getElementById("price-display");
    if (priceDisplay) priceDisplay.textContent = cfg.PRICE || "$49";

    var priceFullDisplay = document.getElementById("price-full-display");
    if (priceFullDisplay) priceFullDisplay.textContent = cfg.PRICE_FULL || "$69";
  }

  /* ─── Buy button handler ──────────────────────────── */
  function initBuyButtons(cfg) {
    // All buy buttons: #buy-btn, #pricing-buy-btn, #footer-buy-btn, and any .buy class.
    var buySelectors = "#buy-btn, #pricing-buy-btn, #footer-buy-btn, .buy";
    var buyButtons = document.querySelectorAll(buySelectors);

    buyButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleBuy(cfg);
      });
    });
  }

  function handleBuy(cfg) {
    var url = cfg.CHECKOUT_URL;

    if (url) {
      // Attempt Lemon Squeezy overlay (lemon.js must be loaded externally for this path).
      // To use the in-page modal in the Next.js port, load lemon.js in <head>:
      //   <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
      // Then open() below will show the Lemon overlay instead of a new tab.
      //
      // Commented example for Next.js / future integration:
      //   import { initializePaddle } from '@paddle/paddle-js'; // if using Paddle
      //   // Lemon Squeezy approach:
      //   LemonSqueezy.Setup({ eventHandler: (event) => { ... } });
      //   LemonSqueezy.Url.Open(url);

      if (window.LemonSqueezy && typeof window.LemonSqueezy.Url === "object") {
        window.LemonSqueezy.Url.Open(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } else {
      // Checkout URL not yet configured — show a graceful inline notice.
      showComingSoonInline(document.getElementById("pricing-buy-btn") || document.getElementById("buy-btn"), "checkout");
    }
  }

  /* ─── Trial button handler ────────────────────────── */
  function initTrialButtons(cfg) {
    var trialButtons = document.querySelectorAll("#trial-btn, #footer-trial-btn");
    trialButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleTrial(cfg, btn);
      });
    });
  }

  function handleTrial(cfg, triggerBtn) {
    var url = cfg.TRIAL_URL;

    if (url) {
      if (window.LemonSqueezy && typeof window.LemonSqueezy.Url === "object") {
        window.LemonSqueezy.Url.Open(url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } else {
      showComingSoonInline(triggerBtn, "trial");
    }
  }

  /* ─── Inline "coming soon" helper ────────────────── */
  // Attaches a temporary text notice next to the triggering element.
  var _comingSoonTimers = {};

  function showComingSoonInline(referenceEl, key) {
    if (!referenceEl) return;

    var existingId = "coming-soon-" + key;
    var existing = document.getElementById(existingId);
    if (existing) {
      // Already shown — reset the auto-hide timer.
      clearTimeout(_comingSoonTimers[key]);
    } else {
      var notice = document.createElement("span");
      notice.className = "inline-notice";
      notice.id = existingId;

      if (key === "checkout") {
        notice.textContent = "Checkout opens soon — HORNIFIER launches shortly.";
      } else {
        notice.textContent = "Trial available at launch.";
      }

      // Insert after the button (or inside its parent).
      var parent = referenceEl.parentNode;
      if (parent) {
        parent.insertBefore(notice, referenceEl.nextSibling);
      }
    }

    // Auto-remove after 4 s.
    _comingSoonTimers[key] = setTimeout(function () {
      var el = document.getElementById(existingId);
      if (el) el.parentNode && el.parentNode.removeChild(el);
    }, 4000);
  }

  /* ─── Audio Player (3-source: DRY / KLIPSCHORN / TRUMPET BELL) ─── */
  function initABPlayer() {
    var player = document.getElementById("ab-player");
    if (!player) return;

    var sources = {
      dry:  { el: document.getElementById("audio-dry"),  label: "DRY — unprocessed",             btn: document.getElementById("btn-dry")  },
      wet:  { el: document.getElementById("audio-wet"),  label: "KLIPSCHORN — warm horn coloration", btn: document.getElementById("btn-wet")  },
      wet2: { el: document.getElementById("audio-wet2"), label: "TRUMPET BELL — bright presence",  btn: document.getElementById("btn-wet2") }
    };

    var playBtn    = document.getElementById("ab-play-btn");
    var playIcon   = document.getElementById("play-icon");
    var stateLabel = document.getElementById("ab-state-label");
    var comingSoon = document.getElementById("ab-coming-soon");

    if (!playBtn) return;

    var currentKey = "dry";
    var isPlaying  = false;

    function currentEl() { return sources[currentKey].el; }

    function showDemosMissing() {
      var controls = player.querySelector(".ab-controls");
      if (controls) controls.style.display = "none";
      if (comingSoon) comingSoon.hidden = false;
    }

    function safePlay(el, onSuccess) {
      // Safari can return undefined from play() — guard before chaining .then/.catch
      var p;
      try { p = el.play(); } catch (e) { return; }
      if (p && typeof p.then === "function") {
        p.then(onSuccess).catch(function () {
          // Autoplay blocked or file missing — fail silently, don't hide controls
        });
      } else {
        // Synchronous play (old Safari) — assume success
        if (onSuccess) onSuccess();
      }
    }

    Object.keys(sources).forEach(function (key) {
      var src = sources[key];
      if (src.el) src.el.addEventListener("error", showDemosMissing);
      if (src.btn) {
        src.btn.addEventListener("click", function () {
          if (currentKey === key) return;
          var savedTime = currentEl().currentTime;
          currentEl().pause();
          currentKey = key;
          setActiveBtnUI();
          if (isPlaying) {
            var el = currentEl();
            el.currentTime = savedTime;
            safePlay(el, null);
          }
          if (stateLabel) stateLabel.textContent = sources[currentKey].label;
        });
      }
    });

    playBtn.addEventListener("click", function () {
      var el = currentEl();
      if (!el) return;
      if (isPlaying) {
        el.pause();
        setPlaying(false);
      } else {
        safePlay(el, function () { setPlaying(true); });
      }
    });

    function setPlaying(on) {
      isPlaying = on;
      playIcon.innerHTML = on ? "&#9646;&#9646;" : "&#9654;";
      playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
      if (stateLabel) stateLabel.textContent = sources[currentKey].label;
    }

    function setActiveBtnUI() {
      Object.keys(sources).forEach(function (key) {
        var btn = sources[key].btn;
        if (btn) btn.classList.toggle("active", key === currentKey);
      });
    }

    // Initialise button state
    setActiveBtnUI();
  }

  /* ─── FAQ Accordion ───────────────────────────────── */
  function initFAQ() {
    var faqList = document.getElementById("faq-list");
    if (!faqList) return;

    var questions = faqList.querySelectorAll(".faq-question");

    questions.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isExpanded = btn.getAttribute("aria-expanded") === "true";
        var answer = btn.nextElementSibling;

        // Close all other items first (single-open accordion).
        questions.forEach(function (otherBtn) {
          if (otherBtn !== btn) {
            otherBtn.setAttribute("aria-expanded", "false");
            var otherAnswer = otherBtn.nextElementSibling;
            if (otherAnswer) otherAnswer.hidden = true;
          }
        });

        // Toggle this one.
        var newExpanded = !isExpanded;
        btn.setAttribute("aria-expanded", String(newExpanded));
        if (answer) answer.hidden = !newExpanded;
      });
    });
  }

})();
