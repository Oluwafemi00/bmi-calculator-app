// DOM Variable creation

const height = document.getElementById("height");
const weight = document.getElementById("weight");
const button = document.querySelector(".btn-calculator");
const output = document.querySelector("h1");
const hwr = document.querySelector(".hwr-calculator");
const targetBmi = document.querySelector(".target-bmi");
const tBtn = document.querySelector(".tb-btn");
const inToMeter = document.querySelector(".convert-in");
const lbToKg = document.querySelector(".convert-lb");
const inCalc = document.querySelector(".btn-in");
const lbCalc = document.querySelector(".btn-lb");
const unitSelect = document.getElementById("unit");
const themeToggle = document.getElementById("themeToggle");
const bmiBar = document.getElementById("bmiBar");

// validating input
function validateInputs() {
  const h = height.value.trim();
  const w = weight.value.trim();

  if (h && w && Number(h) > 0 && Number(w) > 0) {
    button.disabled = false;
    hwr.disabled = false;
    tBtn.disabled = false;
  } else {
    button.disabled = true;
    hwr.disabled = true;
    tBtn.disabled = true;
  }
}

height.addEventListener("input", validateInputs);
weight.addEventListener("input", validateInputs);
targetBmi.addEventListener("input", validateInputs);

// App logics

//Calculate BMI logic
button.addEventListener("click", function () {
  let h = Number(height.value);
  let w = Number(weight.value);

  if (unitSelect.value === "imperial") {
    h *= 0.0254; // inches → meters
    w *= 0.453592; // pounds → kg
  }

  bmi = w / h ** 2;
  bmi = bmi.toFixed(1);

  const category = getBmiCategory(bmi);
  const MAX_BMI = 40;
  let percentage = Math.min((bmi / MAX_BMI) * 100, 100);
  bmiBar.style.width = percentage + "%";
  bmiBar.style.background = category.color;
  animateBMI(parseFloat(bmi));

  output.innerHTML = `<div class="result">
      Your BMI is <strong>${bmi}</strong><br>
      Category: <strong style="color:${category.color}">
        ${category.label}
      </strong>
    </div>`;
});

// Calculate Healthy Weight Range
hwr.addEventListener("click", function () {
  let h = Number(height.value);

  if (unitSelect.value === "imperial") {
    h *= 0.0254; // inches → meters
    w *= 0.453592; // pounds → kg
  }

  let minweight = Number((18.5 * h ** 2).toFixed(1));
  let maxweight = Number((24.9 * h ** 2).toFixed(1));
  output.textContent =
    "Your Healthy Weight Range is " + minweight + " Kg - " + maxweight + " Kg";
});

// converting inches to meter
// inCalc.addEventListener("click", function () {
//   let meter = Number((inToMeter.value * 0.0254).toFixed(2));
// height.value = meter;
//   inToMeter.value = meter;
// });
// converting pounds to kilogram
// lbCalc.addEventListener("click", function () {
//   let kG = Number((lbToKg.value * 0.453592).toFixed(2));
// weight.value = kG;
//   lbToKg.value = kG;
// });

// calculating target BMI
tBtn.addEventListener("click", function () {
  let h = Number(height.value);
  let w = Number(weight.value);
  let target = Number(targetBmi.value);

  if (unitSelect.value === "imperial") {
    h *= 0.0254; // inches → meters
    w *= 0.453592; // pounds → kg
  }

  let targetWeight = Number((target * h ** 2).toFixed(1));
  let weightChange = Number((targetWeight - w).toFixed(1));
  output.textContent = getWeightMessage(weightChange);
});

function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "blue" };
  if (bmi < 25) return { label: "Normal weight", color: "green" };
  if (bmi < 30) return { label: "Overweight", color: "orange" };
  return { label: "Obese", color: "red" };
}

function getWeightMessage(weightChange) {
  if (targetBmi.value) {
    if (weightChange > 0) {
      return `You need to gain ${weightChange} kg to reach your target BMI.`;
    } else if (weightChange < 0) {
      return `You need to lose ${Math.abs(weightChange)} kg to reach your target BMI.`;
    } else {
      return "You are exactly at your target BMI 🎯";
    }
  } else {
    output.textContent = "Input your target BMI";
  }
}
//Dark mode

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀ Light Mode";
  } else {
    themeToggle.textContent = "🌙 Dark Mode";
  }
});

function animateBMI(finalBMI) {
  let start = 0;
  const duration = 500;
  const increment = finalBMI / (duration / 10);

  const interval = setInterval(() => {
    start += increment;
    if (start >= finalBMI) {
      start = finalBMI;
      clearInterval(interval);
    }
    output.querySelector("strong").textContent = start.toFixed(1);
  }, 10);
}
