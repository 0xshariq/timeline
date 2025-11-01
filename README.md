# 📈 GitHub Repo Timeline Chart Generator

This tool generates a **timeline chart** of commit activity for one or more GitHub repositories — or even an entire GitHub profile.  
The chart is generated as a PNG image using **Chart.js** and **node-canvas**.

---

## 🚀 Features
- Generate **commit timeline chart** for:
  - A single repo
  - Multiple repos
  - All public repos from a GitHub profile
- Output chart as `timeline.png`
- Works entirely locally (no browser or manual input)

---

## 🛠️ Setup

### 1. Install dependencies
```bash
sudo apt update
sudo apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install
