const cakeStage = document.querySelector("[data-cake-stage]");
const blowButton = document.querySelector("[data-blow-button]");
const blowLabel = document.querySelector("[data-blow-label]");
const afterSection = document.querySelector("[data-after-section]");
const replayButton = document.querySelector("[data-replay]");
const scrollCue = document.querySelector(".scroll-cue");
const envelope = document.querySelector("[data-envelope]");
const envelopeButton = document.querySelector("[data-envelope-button]");
const ambientAudio = document.querySelector("[data-ambient-audio]");
const pageShell = document.querySelector(".page-shell");

const MUSIC_VOLUME = 0.28;
let wishMade = false;
let holdTimer;
let fadeTimer;

function makeWish() {
  if (wishMade) return;
  wishMade = true;
  cakeStage.classList.add("is-blown");
  blowButton.classList.add("is-complete");
  blowLabel.textContent = "wish sent";
  stopAmbient();

  window.setTimeout(() => {
    afterSection.classList.remove("is-hidden");
    afterSection.classList.add("is-revealed");
    afterSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 700);
}

function resetWish() {
  wishMade = false;
  cakeStage.classList.remove("is-blown");
  blowButton.classList.remove("is-complete");
  blowLabel.textContent = "blow out the candles";
  afterSection.classList.remove("is-revealed");
  afterSection.classList.add("is-hidden");
  envelope.classList.remove("is-open");
  envelopeButton.setAttribute("aria-expanded", "false");
  stopAmbient();
  document.querySelector("#wish").scrollIntoView({ behavior: "smooth", block: "center" });
}

function beginHold() {
  if (wishMade) return;
  startAmbient();
  holdTimer = window.setTimeout(makeWish, 520);
}

function cancelHold() {
  window.clearTimeout(holdTimer);
}

function startAmbient() {
  if (wishMade || !ambientAudio) return;
  pageShell.classList.add("candle-lit");
  window.clearInterval(fadeTimer);
  ambientAudio.volume = MUSIC_VOLUME;
  const playAttempt = ambientAudio.play();
  if (playAttempt) playAttempt.catch(() => {});
}

function stopAmbient() {
  if (!ambientAudio) return;
  pageShell.classList.remove("candle-lit");
  window.clearInterval(fadeTimer);
  const startingVolume = ambientAudio.volume || MUSIC_VOLUME;
  const startedAt = performance.now();
  const fadeDuration = 650;

  fadeTimer = window.setInterval(() => {
    const progress = Math.min((performance.now() - startedAt) / fadeDuration, 1);
    ambientAudio.volume = startingVolume * (1 - progress);

    if (progress >= 1) {
      window.clearInterval(fadeTimer);
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
      ambientAudio.volume = MUSIC_VOLUME;
    }
  }, 45);
}

blowButton.addEventListener("click", makeWish);
replayButton.addEventListener("click", resetWish);
cakeStage.addEventListener("pointerdown", beginHold);
cakeStage.addEventListener("pointerup", cancelHold);
cakeStage.addEventListener("pointerleave", cancelHold);
cakeStage.addEventListener("pointercancel", cancelHold);
scrollCue.addEventListener("click", startAmbient);
envelopeButton.addEventListener("click", () => {
  const isOpen = envelope.classList.toggle("is-open");
  envelopeButton.setAttribute("aria-expanded", String(isOpen));
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target === cakeStage) startAmbient();
      }
    });
  },
  { threshold: 0.18 },
);

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));