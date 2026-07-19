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

  /* ─── A/B Audio Player ────────────────────────────── */
  function initABPlayer() {
    var player = document.getElementById("ab-player");
    if (!player) return;

    var audioDry = document.getElementById("audio-dry");
    var audioWet = document.getElementById("audio-wet");
    var playBtn = document.getElementById("ab-play-btn");
    var playIcon = document.getElementById("play-icon");
    var modeBtn = document.getElementById("ab-mode-btn");
    var modeLabel = document.getElementById("ab-label");
    var stateLabel = document.getElementById("ab-state-label");
    var comingSoon = document.getElementById("ab-coming-soon");

    if (!audioDry || !audioWet || !playBtn || !modeBtn) return;

    var state = {
      isDry: true,     // currently playing dry or wet
      isPlaying: false,
      audioErrorCount: 0
    };

    // Graceful degradation — if either audio file fails to load, show "coming soon".
    function onAudioError() {
      state.audioErrorCount += 1;
      // Only need one error to know demos are missing.
      if (state.audioErrorCount >= 1) {
        showDemosMissing();
      }
    }

    function showDemosMissing() {
      // Hide the controls, show the "coming soon" message.
      var controls = player.querySelector(".ab-controls");
      if (controls) controls.style.display = "none";
      if (comingSoon) comingSoon.hidden = false;
    }

    audioDry.addEventListener("error", onAudioError);
    audioWet.addEventListener("error", onAudioError);

    // Probe: attempt to load audio to detect 404s early (without autoplay).
    // Setting src triggers a load, onerror fires synchronously if file is missing.
    // We use preload="none" so this is just a metadata probe on user interaction;
    // actual errors surface when play() is called.

    // ── Play / Pause ──
    playBtn.addEventListener("click", function () {
      var current = state.isDry ? audioDry : audioWet;

      if (state.isPlaying) {
        current.pause();
        setPlaying(false);
      } else {
        // If the other track was paused, sync position before playing.
        var other = state.isDry ? audioWet : audioDry;
        current.currentTime = other.currentTime || 0;

        var playPromise = current.play();
        if (playPromise !== undefined) {
          playPromise.then(function () {
            setPlaying(true);
          }).catch(function () {
            // Audio not available — show coming soon gracefully.
            showDemosMissing();
          });
        } else {
          setPlaying(true);
        }
      }
    });

    // ── Toggle Dry / Wet ──
    modeBtn.addEventListener("click", function () {
      if (!state.isPlaying) {
        // Not playing — just switch label.
        state.isDry = !state.isDry;
        updateModeUI();
        return;
      }

      // Preserve playhead across the switch.
      var outgoing = state.isDry ? audioDry : audioWet;
      var incoming = state.isDry ? audioWet : audioDry;
      var savedTime = outgoing.currentTime;

      outgoing.pause();
      incoming.currentTime = savedTime;

      state.isDry = !state.isDry;
      updateModeUI();

      var playPromise = incoming.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          showDemosMissing();
        });
      }
    });

    // Audio elements have loop=true so ended fires only during seamless loops — no action needed.

    function setPlaying(playing) {
      state.isPlaying = playing;
      // Unicode: pause ‖ vs play ▶
      playIcon.innerHTML = playing ? "&#9646;&#9646;" : "&#9654;";
      playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    }

    function updateModeUI() {
      var label = state.isDry ? "DRY" : "WET";
      modeLabel.textContent = label;
      modeBtn.classList.toggle("wet", !state.isDry);
      modeBtn.setAttribute("aria-label", "Switch to " + (state.isDry ? "wet" : "dry"));
      if (stateLabel) {
        stateLabel.textContent = state.isDry ? "DRY — unprocessed" : "WET — HORNIFIER processed";
      }
    }
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
