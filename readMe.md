# BMI Tracker 🏋️

> A refined, single-file health calculator with live gauge animation, session history, trend chart, and a warm editorial design system.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)

---

## Overview

BMI Tracker calculates Body Mass Index in real time, visualises the result on a colour-coded animated gauge, and persists a history of your last 8 sessions across page reloads — all without a single backend call or npm package.

**Live demo:** Open `bmi-tracker.html` directly in any browser. No server required.

---

## Features

| Feature                      | Details                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------ |
| **BMI Calculation**          | Instant calculation with a pop animation on the result number                  |
| **Animated SVG Gauge**       | Circular ring fills proportionally with colour-coded zones                     |
| **Metric / Imperial Toggle** | Switch between cm/kg and in/lb instantly — inputs clear to avoid confusion     |
| **Healthy Weight Range**     | Calculates and displays ideal weight range for your height                     |
| **Target BMI Goal**          | Enter a target BMI — outputs exactly how much to gain or lose in correct units |
| **Session History**          | Last 8 results saved to `localStorage` with colour-coded category tags         |
| **Trend Chart**              | Chart.js line graph of historical BMIs, coloured by latest category            |
| **Dark Mode**                | Full dark/light theme toggle, updates chart colours dynamically                |
| **Share Result**             | Web Share API on mobile; clipboard fallback on desktop                         |

---

## Technical Highlights

- **Zero build step** — pure HTML, CSS, and JS; only Chart.js from CDN
- **SVG ring animation** via `stroke-dashoffset` manipulation — no canvas, no library
- **CSS custom properties** drive the entire dark/light theme with a single class toggle on `<body>`
- **DOM reflow trick** (`void el.offsetWidth`) restarts CSS animations reliably without setTimeout hacks
- **localStorage** for cross-session persistence with a clean read/write helper pattern
- Category colours are defined as **single source of truth** tokens, reused across gauge, labels, history tags, and chart

---

## Project Structure

```
BMI Tracker/
├── index.html
├── style.css
└── script.js
```

Intentionally single-file to demonstrate organised, self-contained component thinking without a framework.

---

## Design Decisions

- **DM Serif Display + DM Sans** pairing — editorial serif for numbers, geometric sans for UI labels
- **Warm off-white** (`#F5F2EE`) background instead of clinical white — signals craft and intentionality
- **Category colour system** — Underweight (blue), Normal (green), Overweight (amber), Obese (red) — applied consistently across every UI surface

---

## Run Locally

```bash
# No install needed — just open the file
open index.html

# Or with a local server
npx serve .
```

---

## What This Demonstrates

- Managing multiple interdependent UI states cleanly in vanilla JS
- SVG-based data visualisation without a charting library
- Accessible, keyboard-friendly UI without a framework
- Writing a full-featured app in a single, readable HTML file
