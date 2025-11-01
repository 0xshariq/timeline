import fetch from "node-fetch";
import { createCanvas } from "canvas";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import fs from "fs";

// Register Chart.js components (required in Node)
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

// ====== CONFIGURATION ======
const GITHUB_USERNAME = "0xshariq"; // Change or leave empty to prompt for user
const REPOS = []; // Leave empty to fetch all repos of the user
// Example: const REPOS = ["package-installer-cli", "another-repo"];
// ============================

// Fetch all repos for a given user
async function fetchRepos(username) {
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
  if (!res.ok) throw new Error("Failed to fetch repos");
  const data = await res.json();
  return data.map((r) => r.name);
}

// Fetch commits for a specific repo
async function fetchCommits(owner, repo, page = 1) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`
  );
  if (!res.ok) throw new Error(`Failed to fetch commits for ${repo}`);
  const data = await res.json();
  return data;
}

// Fetch all commits for a repo (with pagination)
async function getAllCommits(owner, repo) {
  let page = 1;
  let commits = [];
  while (true) {
    const data = await fetchCommits(owner, repo, page);
    if (data.length === 0) break;
    commits.push(...data);
    page++;
  }
  return commits;
}

// Group commits by date
function groupByDate(commits) {
  const map = {};
  for (const c of commits) {
    const date = c.commit.author.date.slice(0, 10);
    map[date] = (map[date] || 0) + 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .reduce(
      (acc, [date, count]) => {
        acc.labels.push(date);
        acc.data.push(count);
        return acc;
      },
      { labels: [], data: [] }
    );
}

// Generate chart for multiple datasets (repos)
async function generateChart() {
  const owner = GITHUB_USERNAME || process.argv[2];
  if (!owner) throw new Error("Please set GITHUB_USERNAME or pass it as argument");

  const reposToProcess = REPOS.length ? REPOS : await fetchRepos(owner);

  console.log(`📊 Generating timeline for ${reposToProcess.length} repositories...`);

  const datasets = [];

  for (const repo of reposToProcess) {
    const commits = await getAllCommits(owner, repo);
    const grouped = groupByDate(commits);

    datasets.push({
      label: repo,
      data: grouped.data,
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
    });
  }

  // Merge all labels (unique sorted dates)
  const allDates = [
    ...new Set(datasets.flatMap((d) => d.labels || [])),
  ].sort((a, b) => new Date(a) - new Date(b));

  // Canvas setup
  const width = 1200;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: allDates,
      datasets,
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: `${owner}'s GitHub Commit Timeline`,
        },
        legend: {
          position: "bottom",
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Date" },
        },
        y: {
          title: { display: true, text: "Commits" },
          beginAtZero: true,
        },
      },
    },
  });

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("timeline.png", buffer);
  console.log("✅ Timeline chart saved as timeline.png");
}

generateChart().catch((err) => console.error("❌ Error:", err.message));
