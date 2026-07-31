const PRIDE_COLORS = [
  { name: "Red", hex: "#E40303" },
  { name: "Orange", hex: "#FF8C00" },
  { name: "Yellow", hex: "#FFED00" },
  { name: "Green", hex: "#008026" },
  { name: "Blue", hex: "#004DFF" },
  { name: "Violet", hex: "#750787" },
  { name: "Light blue", hex: "#5BCEFA" },
  { name: "Light pink", hex: "#F5A9B8" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Brown", hex: "#613915" },
  { name: "Magenta", hex: "#D60270" },
  { name: "Purple", hex: "#9B4F96" },
  { name: "Cyan", hex: "#00A2E8" }
];

const PRESETS = {
  rainbow: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787"],
  transgender: ["#5BCEFA", "#F5A9B8", "#FFFFFF", "#F5A9B8", "#5BCEFA"],
  bisexual: ["#D60270", "#D60270", "#9B4F96", "#0038A8", "#0038A8"],
  pansexual: ["#FF218C", "#FFD800", "#21B1FF"],
  nonbinary: ["#FFF430", "#FFFFFF", "#9C59D1", "#000000"],
  sunsetLesbian: ["#D52D00", "#FF9A56", "#FFFFFF", "#D362A4", "#A30262"]
};

const PRESET_LABELS = {
  rainbow: "Rainbow",
  transgender: "Trans",
  bisexual: "Bi",
  pansexual: "Pan",
  nonbinary: "Nonbinary",
  sunsetLesbian: "Sunset Lesbian"
};

// Approximate visible bounds of the heart path. Laying stripes out inside these
// bounds keeps the clipped outside bands the same geometric size as inner bands.
const HEART_BOUNDS = {
  left: 113,
  right: 911,
  top: 112,
  bottom: 884
};

const state = {
  stripes: PRESETS.rainbow.map(makeStripe),
  orientation: "vertical",
  gloss: false
};

const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
const stripeEditor = document.getElementById("stripeEditor");
const selectionCount = document.getElementById("selectionCount");
const selectedSummary = document.getElementById("selectedSummary");
const status = document.getElementById("status");
const palette = document.getElementById("pridePalette");
const stripeOrderHint = document.getElementById("stripeOrderHint");

function makeStripe(hex) {
  return { id: crypto.randomUUID ? crypto.randomUUID() : `stripe-${Date.now()}-${Math.random()}`, hex: normalizeHex(hex) || "#E40303" };
}

function normalizeHex(value) {
  let hex = String(value || "").trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : null;
}

function heartPath(context, size = 1024) {
  const s = size / 1024;
  context.beginPath();
  context.moveTo(512 * s, 884 * s);
  context.bezierCurveTo(430 * s, 813 * s, 169 * s, 634 * s, 123 * s, 400 * s);
  context.bezierCurveTo(82 * s, 192 * s, 230 * s, 92 * s, 365 * s, 124 * s);
  context.bezierCurveTo(433 * s, 140 * s, 483 * s, 184 * s, 512 * s, 236 * s);
  context.bezierCurveTo(541 * s, 184 * s, 591 * s, 140 * s, 659 * s, 124 * s);
  context.bezierCurveTo(794 * s, 92 * s, 942 * s, 192 * s, 901 * s, 400 * s);
  context.bezierCurveTo(855 * s, 634 * s, 594 * s, 813 * s, 512 * s, 884 * s);
  context.closePath();
}

function drawStripes() {
  const startEdge = state.orientation === "vertical" ? HEART_BOUNDS.left : HEART_BOUNDS.top;
  const endEdge = state.orientation === "vertical" ? HEART_BOUNDS.right : HEART_BOUNDS.bottom;
  const dimension = endEdge - startEdge;
  const stripeSize = dimension / state.stripes.length;

  state.stripes.forEach((stripe, index) => {
    const start = startEdge + index * stripeSize;
    const end = index === state.stripes.length - 1
      ? endEdge
      : startEdge + (index + 1) * stripeSize;
    ctx.fillStyle = stripe.hex;

    if (state.orientation === "vertical") {
      ctx.fillRect(start, 0, end - start + .5, canvas.height);
    } else {
      ctx.fillRect(0, start, canvas.width, end - start + .5);
    }
  });
}

function drawGloss() {
  ctx.save();
  ctx.globalAlpha = .58;
  const shine = ctx.createLinearGradient(240, 190, 560, 600);
  shine.addColorStop(0, "rgba(255,255,255,.9)");
  shine.addColorStop(.55, "rgba(255,255,255,.15)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.ellipse(355, 318, 160, 90, -.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderHeart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  heartPath(ctx);
  ctx.clip();
  drawStripes();
  if (state.gloss) drawGloss();
  ctx.restore();

  ctx.save();
  heartPath(ctx);
  ctx.strokeStyle = "rgba(60,18,36,.12)";
  ctx.lineWidth = 14;
  ctx.stroke();
  ctx.restore();

  updateSummary();
  updateOrientationUi();
}

function renderPalette() {
  palette.innerHTML = PRIDE_COLORS.map(color => `
    <button type="button" class="palette-color" data-add-color="${color.hex}" title="Add ${color.name}" aria-label="Add ${color.name} stripe">
      <span style="background:${color.hex}"></span>
      <small>${color.name}</small>
    </button>
  `).join("");

  palette.querySelectorAll("[data-add-color]").forEach(button => {
    button.addEventListener("click", () => addStripe(button.dataset.addColor));
  });
}

function renderStripeEditor() {
  stripeEditor.innerHTML = state.stripes.map((stripe, index) => `
    <article class="stripe-row" data-stripe-id="${stripe.id}">
      <span class="stripe-number">${index + 1}</span>
      <input class="native-color" type="color" value="${stripe.hex}" aria-label="Choose stripe ${index + 1} color" data-color-picker="${stripe.id}">
      <label class="hex-field">
        <span class="sr-only">Stripe ${index + 1} hex color</span>
        <input type="text" value="${stripe.hex}" maxlength="7" spellcheck="false" data-hex-input="${stripe.id}" aria-label="Stripe ${index + 1} hex color">
      </label>
      <div class="stripe-actions" aria-label="Stripe ${index + 1} controls">
        <button type="button" data-action="up" data-id="${stripe.id}" ${index === 0 ? "disabled" : ""} aria-label="Move stripe ${index + 1} earlier">←</button>
        <button type="button" data-action="down" data-id="${stripe.id}" ${index === state.stripes.length - 1 ? "disabled" : ""} aria-label="Move stripe ${index + 1} later">→</button>
        <button type="button" data-action="duplicate" data-id="${stripe.id}" aria-label="Duplicate stripe ${index + 1}">⧉</button>
        <button type="button" class="remove-stripe" data-action="remove" data-id="${stripe.id}" ${state.stripes.length <= 1 ? "disabled" : ""} aria-label="Remove stripe ${index + 1}">×</button>
      </div>
    </article>
  `).join("");

  stripeEditor.querySelectorAll("[data-color-picker]").forEach(input => {
    input.addEventListener("input", () => updateStripeColor(input.dataset.colorPicker, input.value));
  });

  stripeEditor.querySelectorAll("[data-hex-input]").forEach(input => {
    input.addEventListener("change", () => {
      const normalized = normalizeHex(input.value);
      if (!normalized) {
        const stripe = state.stripes.find(item => item.id === input.dataset.hexInput);
        input.value = stripe.hex;
        flashStatus("Enter a valid six-digit hex color.");
        return;
      }
      updateStripeColor(input.dataset.hexInput, normalized);
    });
  });

  stripeEditor.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => handleStripeAction(button.dataset.action, button.dataset.id));
  });

  selectionCount.textContent = `${state.stripes.length} stripe${state.stripes.length === 1 ? "" : "s"}`;
}

function updateStripeColor(id, hex) {
  const stripe = state.stripes.find(item => item.id === id);
  const normalized = normalizeHex(hex);
  if (!stripe || !normalized) return;
  stripe.hex = normalized;
  renderStripeEditor();
  renderHeart();
}

function addStripe(hex = "#E40303", afterIndex = state.stripes.length - 1) {
  state.stripes.splice(afterIndex + 1, 0, makeStripe(hex));
  renderStripeEditor();
  renderHeart();
}

function handleStripeAction(action, id) {
  const index = state.stripes.findIndex(item => item.id === id);
  if (index < 0) return;

  if (action === "up" && index > 0) {
    [state.stripes[index - 1], state.stripes[index]] = [state.stripes[index], state.stripes[index - 1]];
  }
  if (action === "down" && index < state.stripes.length - 1) {
    [state.stripes[index + 1], state.stripes[index]] = [state.stripes[index], state.stripes[index + 1]];
  }
  if (action === "duplicate") addStripe(state.stripes[index].hex, index);
  if (action === "remove" && state.stripes.length > 1) state.stripes.splice(index, 1);

  renderStripeEditor();
  renderHeart();
}

function loadPreset(name) {
  const colors = PRESETS[name];
  if (!colors) return;
  state.stripes = colors.map(makeStripe);
  renderStripeEditor();
  renderHeart();
  flashStatus(`${PRESET_LABELS[name]} colors loaded.`);
}

function appendPreset(name) {
  const colors = PRESETS[name];
  if (!colors) return;
  state.stripes.push(...colors.map(makeStripe));
  renderStripeEditor();
  renderHeart();
  flashStatus(`${PRESET_LABELS[name]} stripes added.`);
}

function updateSummary() {
  selectedSummary.innerHTML = state.stripes.map((stripe, index) => `
    <span class="summary-chip" title="Stripe ${index + 1}: ${stripe.hex}">
      <span class="summary-index">${index + 1}</span>
      <span class="summary-dot" style="background:${stripe.hex}"></span>
      <span>${stripe.hex}</span>
    </span>
  `).join("");
}

function setOrientation(orientation) {
  if (!['vertical', 'horizontal'].includes(orientation)) return;
  state.orientation = orientation;
  renderHeart();
  flashStatus(`${orientation[0].toUpperCase()}${orientation.slice(1)} stripes selected.`);
}

function updateOrientationUi() {
  document.querySelectorAll('[data-orientation]').forEach(button => {
    button.setAttribute('aria-checked', String(button.dataset.orientation === state.orientation));
  });

  const vertical = state.orientation === 'vertical';
  stripeOrderHint.textContent = vertical
    ? 'Stripe order runs left to right. All stripes are rendered at equal width.'
    : 'Stripe order runs top to bottom. All stripes are rendered at equal height.';

  stripeEditor.querySelectorAll('[data-action="up"]').forEach(button => {
    button.textContent = vertical ? '←' : '↑';
  });
  stripeEditor.querySelectorAll('[data-action="down"]').forEach(button => {
    button.textContent = vertical ? '→' : '↓';
  });
}

function flashStatus(message) {
  status.textContent = message;
  clearTimeout(flashStatus.timer);
  flashStatus.timer = setTimeout(() => { status.textContent = ""; }, 2600);
}

function downloadPng() {
  const filename = `heartforged-${state.orientation}-${state.stripes.length}-stripe-heart.png`;
  flashStatus("Preparing transparent PNG…");

  canvas.toBlob(blob => {
    if (!blob) {
      flashStatus("Could not create the PNG. Please try again.");
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = objectUrl;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Keep the object URL alive long enough for browsers to start reading it.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    flashStatus("Transparent PNG downloaded.");
  }, "image/png");
}

function reset() {
  state.stripes = PRESETS.rainbow.map(makeStripe);
  state.orientation = "vertical";
  state.gloss = false;
  document.getElementById("glossToggle").checked = false;
  renderStripeEditor();
  renderHeart();
  flashStatus("Reset to rainbow stripes.");
}

document.querySelectorAll("[data-orientation]").forEach(button => {
  button.addEventListener("click", () => setOrientation(button.dataset.orientation));
});

document.getElementById("addCustomStripe").addEventListener("click", () => addStripe("#E40303"));
document.getElementById("addPresetStripes").addEventListener("click", () => {
  appendPreset(document.getElementById("presetToAdd").value);
});
document.getElementById("glossToggle").addEventListener("change", event => {
  state.gloss = event.target.checked;
  renderHeart();
});
document.getElementById("downloadButton").addEventListener("click", downloadPng);
document.getElementById("resetButton").addEventListener("click", reset);
document.querySelectorAll("[data-preset]").forEach(button => {
  button.addEventListener("click", () => loadPreset(button.dataset.preset));
});

renderPalette();
renderStripeEditor();
renderHeart();
