// Constants for categories
const CATEGORIES = {
  UNDERWEIGHT: { label: "Underweight", color: "#3498db", max: 18.5 },
  NORMAL: { label: "Normal weight", color: "#2ecc71", max: 25 },
  OVERWEIGHT: { label: "Overweight", color: "#f1c40f", max: 30 },
  OBESE: { label: "Obese", color: "#e74c3c", max: Infinity },
};

const elements = {
  height: document.getElementById("height"),
  weight: document.getElementById("weight"),
  targetBmi: document.getElementById("target-bmi"),
  unit: document.getElementById("unit"),
  outputValue: document.querySelector(".bmi-value"),
  outputLabel: document.querySelector(".bmi-label"),
  bmiBar: document.getElementById("bmiBar"),
  buttons: document.querySelectorAll("button:not(#themeToggle)"),
};

// Helper: Get metric values regardless of input unit
function getNormalizedData() {
  let h = parseFloat(elements.height.value);
  let w = parseFloat(elements.weight.value);
  const isImperial = elements.unit.value === "imperial";

  return {
    h: isImperial ? h * 0.0254 : h / 100, // Handle cm to m or in to m
    w: isImperial ? w * 0.453592 : w,
    target: parseFloat(elements.targetBmi.value) || 22,
  };
}

// Logic: Get Category Object
function getCategory(bmi) {
  if (bmi < CATEGORIES.UNDERWEIGHT.max) return CATEGORIES.UNDERWEIGHT;
  if (bmi < CATEGORIES.NORMAL.max) return CATEGORIES.NORMAL;
  if (bmi < CATEGORIES.OVERWEIGHT.max) return CATEGORIES.OVERWEIGHT;
  return CATEGORIES.OBESE;
}

// UI: Update Display
function updateDisplay(value, label, color = "#4caf50") {
  elements.outputValue.textContent = value;
  elements.outputLabel.textContent = label;
  elements.outputLabel.style.color = color;

  // Update Progress Bar
  const percentage = Math.min((parseFloat(value) / 40) * 100, 100);
  elements.bmiBar.style.width = `${percentage}%`;
  elements.bmiBar.style.background = color;
}

// Event: Calculate BMI
document.querySelector(".btn-calculator").addEventListener("click", () => {
  const { h, w } = getNormalizedData();
  const bmi = (w / (h * h)).toFixed(1);
  const cat = getCategory(bmi);
  updateDisplay(bmi, cat.label, cat.color);
  showShareButton();
});

// Event: Healthy Weight Range
document.querySelector(".hwr-calculator").addEventListener("click", () => {
  const { h } = getNormalizedData();
  const min = (18.5 * h ** 2).toFixed(1);
  const max = (24.9 * h ** 2).toFixed(1);
  updateDisplay(`${min}-${max}`, "Healthy Range (kg)");
});

// Event: Target Goal
document.querySelector(".tb-btn").addEventListener("click", () => {
  const { h, w, target } = getNormalizedData();
  const targetW = target * h ** 2;
  const diff = (targetW - w).toFixed(1);
  const msg = diff > 0 ? `Gain ${diff}kg` : `Lose ${Math.abs(diff)}kg`;
  updateDisplay(target, msg);
});

// Validation
const validate = () => {
  const isValid = elements.height.value && elements.weight.value;
  elements.buttons.forEach((btn) => (btn.disabled = !isValid));
};

[elements.height, elements.weight].forEach((el) =>
  el.addEventListener("input", validate),
);

// Theme Toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  document.getElementById("themeToggle").textContent = isDark ? "☀️" : "🌙";
});

const unitPlaceholders = {
  metric: { height: "cm", weight: "kg" },
  imperial: { height: "in", weight: "lb" },
};

elements.unit.addEventListener("change", (e) => {
  const selected = e.target.value;
  document.getElementById("h-unit").textContent =
    `(${unitPlaceholders[selected].height})`;
  document.getElementById("w-unit").textContent =
    `(${unitPlaceholders[selected].weight})`;

  // Update placeholders
  elements.height.placeholder = `Height (${unitPlaceholders[selected].height})`;
  elements.weight.placeholder = `Weight (${unitPlaceholders[selected].weight})`;

  // Clear inputs to avoid conversion confusion
  elements.height.value = "";
  elements.weight.value = "";
  elements.outputValue.textContent = "--.-";
  elements.outputLabel.textContent = "Units changed";

  validate(); // Re-check buttons
});

const historyList = document.getElementById("historyList");
const clearBtn = document.getElementById("clearHistory");

// 1. Function to save to LocalStorage
function saveResult(bmi, category) {
  const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  const newEntry = {
    bmi,
    label: category.label,
    color: category.color,
    date: new Date().toLocaleDateString(),
  };

  history.unshift(newEntry); // Add to the start
  localStorage.setItem("bmiHistory", JSON.stringify(history.slice(0, 5))); // Keep last 5
  renderHistory();
  updateChart();
}

// 2. Function to display history on screen
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  historyList.innerHTML = history
    .map(
      (item) => `
    <li class="history-item">
      <span><strong>${item.bmi}</strong> (${item.date})</span>
      <span class="history-tag" style="background:${item.color}">${item.label}</span>
    </li>
  `,
    )
    .join("");
}

// 3. Update your Calculate button listener to trigger the save
document.querySelector(".btn-calculator").addEventListener("click", () => {
  const { h, w } = getNormalizedData();
  const bmi = (w / (h * h)).toFixed(1);
  const cat = getCategory(bmi);
  updateDisplay(bmi, cat.label, cat.color);

  saveResult(bmi, cat); // <--- Save it!
});

// 4. Clear History
clearBtn.addEventListener("click", () => {
  localStorage.removeItem("bmiHistory");
  renderHistory();
});

// 5. Initial load
renderHistory();

let bmiChart; // Global variable to hold the chart instance

function initChart() {
  const ctx = document.getElementById("bmiChart").getContext("2d");
  bmiChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [], // Dates go here
      datasets: [
        {
          label: "BMI Trend",
          data: [], // BMI values go here
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.3, // Makes the line curvy
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false },
      },
      plugins: { legend: { display: false } },
    },
  });
}

function updateChart() {
  const history = JSON.parse(
    localStorage.getItem("bmiHistory") || "[]",
  ).reverse();

  // Update chart data
  bmiChart.data.labels = history.map((item) => item.date);
  bmiChart.data.datasets[0].data = history.map((item) => item.bmi);

  // Match line color to the latest BMI category color
  if (history.length > 0) {
    bmiChart.data.datasets[0].borderColor = history[history.length - 1].color;
  }

  bmiChart.update();
}

// Call initChart when the page loads
initChart();
renderHistory(); // Existing function
updateChart(); // Initial chart draw

const shareBtn = document.getElementById("shareBtn");

async function shareResult() {
  const bmi = elements.outputValue.textContent;
  const label = elements.outputLabel.textContent;
  const target = elements.targetBmi.value || "N/A";

  const shareData = {
    title: "My BMI Progress",
    text: `My current BMI is ${bmi} (${label}). My target is ${target}. Check yours!`,
    url: window.location.href, // Shares the link to your app
  };

  try {
    // Check if the browser supports the Share API (mostly mobile)
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard for Desktop
      await navigator.clipboard.writeText(shareData.text);
      alert("Result copied to clipboard! 📋");
    }
  } catch (err) {
    console.error("Error sharing:", err);
  }
}

// Show the button only after a calculation
function showShareButton() {
  shareBtn.style.display = "block";
}

shareBtn.addEventListener("click", shareResult);
