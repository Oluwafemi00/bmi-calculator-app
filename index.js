const CATEGORIES = {
  UNDERWEIGHT: {
    label: "Underweight",
    color: "#1757A0",
    bg: "var(--blue-bg)",
    text: "var(--blue)",
    max: 18.5,
  },
  NORMAL: {
    label: "Normal weight",
    color: "#2A7D4F",
    bg: "var(--green-bg)",
    text: "var(--green)",
    max: 25,
  },
  OVERWEIGHT: {
    label: "Overweight",
    color: "#A0720A",
    bg: "var(--yellow-bg)",
    text: "var(--yellow)",
    max: 30,
  },
  OBESE: {
    label: "Obese",
    color: "#B83232",
    bg: "var(--red-bg)",
    text: "var(--red)",
    max: Infinity,
  },
};

const $ = (id) => document.getElementById(id);
const heightEl = $("height"),
  weightEl = $("weight"),
  targetEl = $("target-bmi");
const bmiValue = $("bmiValue"),
  bmiCategory = $("bmiCategory"),
  bmiNote = $("bmiNote");
const gaugeMarker = $("gaugeMarker"),
  shareBtn = $("shareBtn");
const calcBtn = $("calcBtn"),
  hwrBtn = $("hwrBtn"),
  targetBtn = $("targetBtn");
const historyList = $("historyList");
let currentUnit = "metric";

// Unit toggle
document.querySelectorAll(".unit-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".unit-pill")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentUnit = btn.dataset.unit;
    const isImp = currentUnit === "imperial";
    $("h-unit").textContent = isImp ? "in" : "cm";
    $("w-unit").textContent = isImp ? "lb" : "kg";
    heightEl.placeholder = isImp ? "69" : "175";
    weightEl.placeholder = isImp ? "155" : "70";
    heightEl.value = "";
    weightEl.value = "";
    resetDisplay();
    validate();
  });
});

function getMetric() {
  let h = parseFloat(heightEl.value),
    w = parseFloat(weightEl.value);
  const t = parseFloat(targetEl.value) || 22;
  if (currentUnit === "imperial") {
    h = h * 0.0254;
    w = w * 0.453592;
  } else {
    h = h / 100;
  }
  return { h, w, t };
}

function getCategory(bmi) {
  if (bmi < 18.5) return CATEGORIES.UNDERWEIGHT;
  if (bmi < 25) return CATEGORIES.NORMAL;
  if (bmi < 30) return CATEGORIES.OVERWEIGHT;
  return CATEGORIES.OBESE;
}

function bmiToGaugePercent(bmi) {
  // Map BMI 16-40 to 0-100%
  const clamped = Math.min(Math.max(bmi, 16), 40);
  return ((clamped - 16) / 24) * 100;
}

function setDisplay(num, catLabel, color, note) {
  bmiValue.classList.remove("animate");
  void bmiValue.offsetWidth;
  bmiValue.classList.add("animate");
  bmiValue.textContent = num;
  bmiValue.style.color = color || "var(--text)";
  bmiCategory.textContent = catLabel;
  bmiCategory.style.color = color || "var(--text2)";
  bmiNote.textContent = note || "";
}

function updateGauge(bmi) {
  const pct = bmiToGaugePercent(bmi);
  gaugeMarker.style.left = pct + "%";
}

function resetDisplay() {
  bmiValue.textContent = "—";
  bmiValue.style.color = "var(--text)";
  bmiCategory.textContent = "Enter your details";
  bmiCategory.style.color = "var(--text3)";
  bmiNote.textContent = "";
  gaugeMarker.style.left = "0%";
  shareBtn.style.display = "none";
}

function validate() {
  const ok = heightEl.value && weightEl.value;
  [calcBtn, hwrBtn, targetBtn].forEach((b) => (b.disabled = !ok));
}
[heightEl, weightEl].forEach((el) => el.addEventListener("input", validate));

// Calculate BMI
calcBtn.addEventListener("click", () => {
  const { h, w } = getMetric();
  const bmi = (w / (h * h)).toFixed(1);
  const cat = getCategory(bmi);
  setDisplay(bmi, cat.label, cat.color, "");
  updateGauge(parseFloat(bmi));
  shareBtn.style.display = "flex";
  saveHistory(bmi, cat);
});

// Healthy weight range
hwrBtn.addEventListener("click", () => {
  const { h } = getMetric();
  const min = (18.5 * h * h).toFixed(1);
  const max = (24.9 * h * h).toFixed(1);
  const unit = currentUnit === "imperial" ? "lb" : "kg";
  const minDisp =
    currentUnit === "imperial" ? (min / 0.453592).toFixed(1) : min;
  const maxDisp =
    currentUnit === "imperial" ? (max / 0.453592).toFixed(1) : max;
  setDisplay(
    `${minDisp}–${maxDisp}`,
    "Ideal weight range",
    "var(--green)",
    unit,
  );
});

// Target goal
targetBtn.addEventListener("click", () => {
  const { h, w, t } = getMetric();
  const targetW = t * h * h;
  const diff = targetW - w;
  const unit = currentUnit === "imperial" ? "lb" : "kg";
  const diffDisp =
    currentUnit === "imperial"
      ? Math.abs(diff / 0.453592).toFixed(1)
      : Math.abs(diff).toFixed(1);
  const msg =
    diff > 0
      ? `Gain ${diffDisp}${unit} to reach BMI ${t}`
      : `Lose ${diffDisp}${unit} to reach BMI ${t}`;
  setDisplay(t, msg, diff > 0 ? "var(--blue)" : "var(--yellow)", "");
});

// Theme toggle
$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  $("themeToggle").textContent = dark ? "☀️" : "🌙";
  if (bmiChart) {
    bmiChart.options.scales.x.ticks.color = dark ? "#605A52" : "#A09A93";
    bmiChart.options.scales.y.ticks.color = dark ? "#605A52" : "#A09A93";
    bmiChart.options.scales.x.grid.color = dark
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.04)";
    bmiChart.options.scales.y.grid.color = dark
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.04)";
    bmiChart.update();
  }
});

// HISTORY
function saveHistory(bmi, cat) {
  const h = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  h.unshift({
    bmi,
    label: cat.label,
    color: cat.color,
    bg: cat.bg,
    text: cat.text,
    date: new Date().toLocaleDateString(),
  });
  localStorage.setItem("bmiHistory", JSON.stringify(h.slice(0, 8)));
  renderHistory();
  updateChart();
}

function renderHistory() {
  const h = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  if (!h.length) {
    historyList.innerHTML = '<li class="empty-state">No calculations yet</li>';
    return;
  }
  historyList.innerHTML = h
    .map(
      (item) => `
        <li class="history-item">
          <div class="history-left">
            <span class="history-bmi">${item.bmi}</span>
            <span class="history-date">${item.date}</span>
          </div>
          <span class="history-tag" style="background:${item.bg || "var(--surface2)"}; color:${item.text || item.color}">${item.label}</span>
        </li>
      `,
    )
    .join("");
}

$("clearHistory").addEventListener("click", () => {
  localStorage.removeItem("bmiHistory");
  renderHistory();
  updateChart();
});

// CHART
let bmiChart;
function initChart() {
  const isDark = document.body.classList.contains("dark");
  const tickColor = isDark ? "#605A52" : "#A09A93";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const ctx = $("bmiChart").getContext("2d");
  bmiChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "BMI",
          data: [],
          borderColor: "#2A7D4F",
          backgroundColor: "rgba(42,125,79,0.06)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#2A7D4F",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            color: tickColor,
            font: { family: "'DM Sans', sans-serif", size: 11 },
          },
          grid: { color: gridColor },
          border: { display: false },
        },
        y: {
          beginAtZero: false,
          ticks: {
            color: tickColor,
            font: { family: "'DM Sans', sans-serif", size: 11 },
          },
          grid: { color: gridColor },
          border: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1A1714",
          titleColor: "#F0EDE8",
          bodyColor: "#A09A93",
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: "'DM Sans', sans-serif", size: 12 },
          bodyFont: { family: "'DM Sans', sans-serif", size: 11 },
        },
      },
    },
  });
}

function updateChart() {
  const h = JSON.parse(localStorage.getItem("bmiHistory") || "[]")
    .slice()
    .reverse();
  if (!bmiChart) return;
  bmiChart.data.labels = h.map((i) => i.date);
  bmiChart.data.datasets[0].data = h.map((i) => parseFloat(i.bmi));
  if (h.length) {
    const last = getCategory(h[h.length - 1].bmi);
    bmiChart.data.datasets[0].borderColor = last.color;
    bmiChart.data.datasets[0].pointBackgroundColor = last.color;
    bmiChart.data.datasets[0].backgroundColor = last.color + "18";
  }
  bmiChart.update();
}

// SHARE
shareBtn.addEventListener("click", async () => {
  const bmi = bmiValue.textContent;
  const label = bmiCategory.textContent;
  const target = targetEl.value || "N/A";
  const text = `My BMI is ${bmi} (${label}). Target: ${target}. Check yours!`;
  try {
    if (navigator.share) {
      await navigator.share({
        title: "My BMI",
        text,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(text);
      shareBtn.textContent = "Copied!";
      setTimeout(() => {
        shareBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> Share result`;
      }, 2000);
    }
  } catch (e) {}
});

// Init
initChart();
renderHistory();
updateChart();
