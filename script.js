//-------------------------------------------------------------
// DOM ELEMENTS
//-------------------------------------------------------------
const passwordDisplay = document.getElementById("passwordDisplay");
const copyBtn = document.getElementById("copyBtn");
const copyTooltip = document.getElementById("copyTooltip");
const regenBtn = document.getElementById("regenBtn");
const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

const uppercase = document.getElementById("uppercase");
const lowercase = document.getElementById("lowercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");
const forceInclude = document.getElementById("forceInclude");

const excludeAmb = document.getElementById("excludeAmb");
const customAmbiguous = document.getElementById("customAmbiguous");
const ambCharInputs = document.querySelectorAll(".amb-char");
const ambPreview = document.getElementById("ambPreview");
const poolPreview = document.getElementById("poolPreview");

const showSuggestions = document.getElementById("showSuggestions");
const suggestions = document.getElementById("suggestions");
const suggestionActions = document.getElementById("suggestionActions");
const copyAllBtn = document.getElementById("copyAllBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const upperFragments = document.getElementById("upperFragments");
const lowerFragments = document.getElementById("lowerFragments");
const numberFragments = document.getElementById("numberFragments");
const symbolFragments = document.getElementById("symbolFragments");
const useFragments = document.getElementById("useFragments");

const errUpper = document.getElementById("errUpper");
const errLower = document.getElementById("errLower");
const errNumber = document.getElementById("errNumber");
const errSymbol = document.getElementById("errSymbol");

const categorySelect = document.getElementById("categorySelect");
const fillMode = document.getElementById("fillMode");
const choosePopup = document.getElementById("choosePopup");
const applyCategoryBtn = document.getElementById("applyCategory");
const closePopup = document.getElementById("closePopup");

const popUpper = document.getElementById("popUpper");
const popLower = document.getElementById("popLower");
const popNum = document.getElementById("popNum");
const popSym = document.getElementById("popSym");

const themeToggle = document.getElementById("themeToggle");

//-------------------------------------------------------------
// GLOBAL STATE
//-------------------------------------------------------------
let history = [];
let firstGenerated = false;
let AMBIG = new Set();

//-------------------------------------------------------------
// CHARACTER SETS
//-------------------------------------------------------------
const chars = {
  U: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  L: "abcdefghijklmnopqrstuvwxyz",
  N: "0123456789",
  S: "!@#$%^&*()_+{}[]<>?,./|~`-="
};

//-------------------------------------------------------------
// CATEGORY FRAGMENTS
//-------------------------------------------------------------
const CATEGORY_DATA = {
  animals: {
    U: ["LION", "TIGER", "EAGLE", "FALCON", "WOLF"],
    L: ["lion", "tiger", "wolf"],
    N: ["777", "404"],
    S: ["!!", "@@", "##"]
  },
  planets: {
    U: ["MARS", "VENUS", "EARTH", "NEPTUNE"],
    L: ["mars", "venus"],
    N: ["2025", "88"],
    S: ["<>", "**"]
  },
  tech: {
    U: ["NODE", "REACT", "PYTHON", "LINUX"],
    L: ["code", "dev"],
    N: ["8080", "404"],
    S: ["&&", "//"]
  },
  hacking: {
    U: ["ROOT", "ADMIN", "PROXY", "TARGET"],
    L: ["hack", "dark"],
    N: ["1337", "007"],
    S: ["!!", "$$"]
  },
  random: {
    U: ["BETA", "OMEGA", "DELTA"],
    L: ["alpha", "delta"],
    N: ["1010", "999"],
    S: ["%%", "??"]
  }
};

//-------------------------------------------------------------
// AMBIGUOUS SYSTEM
//-------------------------------------------------------------
function readAmbiguous() {
  AMBIG.clear();
  ambCharInputs.forEach(cb => {
    if (cb.checked) AMBIG.add(cb.value);
  });
}

function sanitize(str) {
  if (!excludeAmb.checked) return str;
  return [...str].filter(c => !AMBIG.has(c)).join("");
}

function renderAmbiguousPreview() {
  ambPreview.innerHTML = "";
  ["i", "l", "1", "O", "0"].forEach(ch => {
    let s = document.createElement("span");
    s.className = "badge " + (AMBIG.has(ch) ? "excluded" : "allowed");
    s.textContent = ch;
    ambPreview.appendChild(s);
  });
}

//-------------------------------------------------------------
// AUTO CLEAN FRAGMENTS + ERROR MESSAGES
//-------------------------------------------------------------
function cleanFragment(inputEl, regexAllowed, errorEl) {
  let original = inputEl.value;
  let cleaned = original.replace(regexAllowed, "");
  let removed = [...original]
    .filter(c => !regexAllowed.test(c));

  // Apply cleaned version (keeping allowed ones)
  inputEl.value = original.replace(/[^A-Za-z0-9!@#$%^&*()_+{}\[\]<>?,./|~`\-=\s,]/g, "");

  if (removed.length > 0) {
    errorEl.textContent = "Removed invalid: " + removed.join(", ");
  } else {
    errorEl.textContent = "";
  }
}

// Uppercase fragments
upperFragments.addEventListener("input", () => {
  let original = upperFragments.value;
  let cleaned = original.toUpperCase().replace(/[^A-Z,\s]/g, "");
  let removed = [...original].filter(c => !/[A-Z,\s]/.test(c.toUpperCase()));

  upperFragments.value = cleaned;
  errUpper.textContent = removed.length ? "Removed: " + removed.join(", ") : "";
});

// Lowercase fragments
lowerFragments.addEventListener("input", () => {
  let original = lowerFragments.value;
  let cleaned = original.toLowerCase().replace(/[^a-z,\s]/g, "");
  let removed = [...original].filter(c => !/[a-z,\s]/.test(c.toLowerCase()));

  lowerFragments.value = cleaned;
  errLower.textContent = removed.length ? "Removed: " + removed.join(", ") : "";
});

// Number fragments
numberFragments.addEventListener("input", () => {
  let original = numberFragments.value;
  let cleaned = original.replace(/[^0-9,\s]/g, "");
  let removed = [...original].filter(c => !/[0-9,\s]/.test(c));

  numberFragments.value = cleaned;
  errNumber.textContent = removed.length ? "Removed: " + removed.join(", ") : "";
});

// Symbol fragments
symbolFragments.addEventListener("input", () => {
  let original = symbolFragments.value;
  let cleaned = original.replace(/[A-Za-z0-9]/g, "");
  let removed = [...original].filter(c => /[A-Za-z0-9]/.test(c));

  symbolFragments.value = cleaned;
  errSymbol.textContent = removed.length ? "Removed: " + removed.join(", ") : "";
});

//-------------------------------------------------------------
// PARSE LISTS
//-------------------------------------------------------------
function parseList(text) {
  return text.split(",").map(s => s.trim()).filter(Boolean);
}

function getFragmentSet() {
  return {
    U: parseList(upperFragments.value),
    L: parseList(lowerFragments.value),
    N: parseList(numberFragments.value),
    S: parseList(symbolFragments.value)
  };
}

//-------------------------------------------------------------
// BUILD POOL
//-------------------------------------------------------------
function buildPool() {
  let p = "";
  if (uppercase.checked) p += chars.U;
  if (lowercase.checked) p += chars.L;
  if (numbers.checked) p += chars.N;
  if (symbols.checked) p += chars.S;

  let original = p;
  p = sanitize(p);

  poolPreview.innerHTML = `
    <b>Pool size:</b> ${p.length} / ${original.length} |
    Removed: ${original.length - p.length}
  `;

  return p;
}

//-------------------------------------------------------------
// FORCE INCLUDE
//-------------------------------------------------------------
function sample(str) {
  return str[Math.floor(Math.random() * str.length)];
}

function getForcedChars() {
  if (!forceInclude.checked) return "";

  let f = "";
  if (uppercase.checked) f += sample(sanitize(chars.U));
  if (lowercase.checked) f += sample(sanitize(chars.L));
  if (numbers.checked) f += sample(sanitize(chars.N));
  if (symbols.checked) f += sample(sanitize(chars.S));
  return f;
}

//-------------------------------------------------------------
// SHUFFLE
//-------------------------------------------------------------
function shuffle(str) {
  return [...str].sort(() => Math.random() - 0.5).join("");
}

//-------------------------------------------------------------
// GENERATE PASSWORD
//-------------------------------------------------------------
function generate() {
  const L = +lengthSlider.value;
  const pool = buildPool();
  if (!pool.length) {
    passwordDisplay.value = "Select at least one character set!";
    return;
  }

  let pwd = "";
  let forced = getForcedChars();

  // Fragments
  if (useFragments.checked) {
    const F = getFragmentSet();
    let temp = "";

    if (F.U.length) temp += F.U[Math.floor(Math.random() * F.U.length)];
    if (F.L.length) temp += F.L[Math.floor(Math.random() * F.L.length)];
    if (F.N.length) temp += F.N[Math.floor(Math.random() * F.N.length)];
    if (F.S.length) temp += F.S[Math.floor(Math.random() * F.S.length)];

    pwd += sanitize(temp);
  }

  pwd += forced;

  if (pwd.length >= L) {
    pwd = pwd.slice(0, L);
    pwd = shuffle(pwd);
    applyOutput(pwd);
    return;
  }

  while (pwd.length < L) {
    pwd += sample(pool);
  }

  applyOutput(shuffle(pwd));
}

//-------------------------------------------------------------
// APPLY OUTPUT
//-------------------------------------------------------------
function applyOutput(pwd) {
  passwordDisplay.value = pwd;
  updateStrength(pwd.length, buildPool().length);
  addHistory(pwd);

  if (!firstGenerated) {
    regenBtn.textContent = "Regenerate";
    firstGenerated = true;
  }

  renderSuggestionsIfNeeded();
}

//-------------------------------------------------------------
// STRENGTH METER
//-------------------------------------------------------------
function updateStrength(len, poolSize) {
  let entropy = Math.floor(len * Math.log2(poolSize));

  let level = "Weak";
  let color = "var(--strength-low)";

  if (entropy > 80) {
    level = "Very Strong";
    color = "var(--strength-high)";
  } else if (entropy > 60) {
    level = "Strong";
    color = "var(--strength-med)";
  } else if (entropy > 40) {
    level = "Medium";
  }

  strengthBar.style.background = color;
  strengthText.textContent = `Strength: ${level} | Entropy: ${entropy} bits`;
}

//-------------------------------------------------------------
// SUGGESTIONS
//-------------------------------------------------------------
function randomPassword() {
  let L = +lengthSlider.value;
  let pool = buildPool();
  let p = "";
  for (let i = 0; i < L; i++) p += sample(pool);
  return p;
}

function renderSuggestionsIfNeeded() {
  if (!showSuggestions.checked) return;

  suggestions.innerHTML = "";
  suggestionActions.classList.remove("hidden");

  for (let i = 0; i < 5; i++) {
    let s = randomPassword();
    let btn = document.createElement("button");
    btn.textContent = s;
    btn.onclick = () => { passwordDisplay.value = s; addHistory(s); };
    suggestions.appendChild(btn);
  }
}

//-------------------------------------------------------------
// HISTORY
//-------------------------------------------------------------
function addHistory(pwd) {
  history.unshift({ pwd, time: new Date().toLocaleString() });
  if (history.length > 10) history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    let div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<span>${item.pwd}</span><span class="history-time">${item.time}</span>`;
    historyList.appendChild(div);
  });
}

clearHistoryBtn.onclick = () => {
  history = [];
  renderHistory();
};

//-------------------------------------------------------------
// COPY FUNCTIONS
//-------------------------------------------------------------
copyBtn.onclick = () => {
  navigator.clipboard.writeText(passwordDisplay.value);
  copyTooltip.classList.add("show");
  setTimeout(() => copyTooltip.classList.remove("show"), 900);
};

copyAllBtn.onclick = () => {
  let all = [...suggestions.querySelectorAll("button")]
    .map(b => b.textContent)
    .join("\n");
  navigator.clipboard.writeText(all);
};

downloadCsvBtn.onclick = () => {
  let rows = [...suggestions.querySelectorAll("button")]
    .map((b, i) => `${i + 1},${b.textContent}`)
    .join("\n");

  let csv = "Index,Password\n" + rows;
  let blob = new Blob([csv], { type: "text/csv" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "password_suggestions.csv";
  a.click();
};

//-------------------------------------------------------------
// CATEGORY AUTO-FILL LOGIC (1,2,3 SYSTEM)
//-------------------------------------------------------------
categorySelect.onchange = () => {
  let cat = categorySelect.value;
  if (!cat) return;

  let mode = fillMode.value;

  if (mode === "upper") applyCategoryUpper(cat);
  else if (mode === "all") applyCategoryAll(cat);
  else if (mode === "choose") showChoosePopup();
};

fillMode.onchange = () => {
  if (fillMode.value === "choose") showChoosePopup();
};

function applyCategoryUpper(cat) {
  let C = CATEGORY_DATA[cat];
  upperFragments.value = C.U.join(", ");
  errUpper.textContent = "";
}

function applyCategoryAll(cat) {
  let C = CATEGORY_DATA[cat];

  upperFragments.value = C.U.join(", ");
  lowerFragments.value = C.L.join(", ");
  numberFragments.value = C.N.join(", ");
  symbolFragments.value = C.S.join(", ");

  errUpper.textContent = "";
  errLower.textContent = "";
  errNumber.textContent = "";
  errSymbol.textContent = "";
}

function showChoosePopup() {
  choosePopup.classList.remove("hidden");
}

closePopup.onclick = () => {
  choosePopup.classList.add("hidden");
};

applyCategoryBtn.onclick = () => {
  let cat = categorySelect.value;
  let C = CATEGORY_DATA[cat];

  if (popUpper.checked) upperFragments.value = C.U.join(", ");
  if (popLower.checked) lowerFragments.value = C.L.join(", ");
  if (popNum.checked) numberFragments.value = C.N.join(", ");
  if (popSym.checked) symbolFragments.value = C.S.join(", ");

  choosePopup.classList.add("hidden");
};

//-------------------------------------------------------------
// UI EVENTS
//-------------------------------------------------------------
regenBtn.onclick = generate;

lengthSlider.oninput = () => {
  lengthValue.textContent = lengthSlider.value;
  if (firstGenerated) generate();
};

[uppercase, lowercase, numbers, symbols, forceInclude, useFragments]
  .forEach(el => el.onchange = generate);

excludeAmb.onchange = () => {
  customAmbiguous.classList.toggle("hidden", !excludeAmb.checked);
  readAmbiguous();
  renderAmbiguousPreview();
  if (firstGenerated) generate();
};

ambCharInputs.forEach(cb =>
  cb.addEventListener("change", () => {
    readAmbiguous();
    renderAmbiguousPreview();
    if (firstGenerated) generate();
  })
);

showSuggestions.onchange = () => {
  suggestions.classList.toggle("hidden", !showSuggestions.checked);
  suggestionActions.classList.toggle("hidden", !showSuggestions.checked);
  if (showSuggestions.checked) renderSuggestionsIfNeeded();
};

// Dark/Light mode
themeToggle.onclick = () => {
  document.body.classList.toggle("light-mode");
};

//-------------------------------------------------------------
// INITIALIZE
//-------------------------------------------------------------
readAmbiguous();
renderAmbiguousPreview();
lengthValue.textContent = lengthSlider.value;
// password stays blank on first load
