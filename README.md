
<div align="center">
# � Repository Timeline Generator

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

**Generate beautiful commit timeline charts for your Git repositories across multiple platforms.**

_Beautiful CLI • Multi-Platform • Interactive • Analytics_

</div>

---

## ✨ Features

- 🎨 **10 Chart Types** - Line, Bar, Pie, Doughnut, Radar, Heatmap, Polar Area, Scatter, Bubble, and Mixed
- 🎨 **Full Customization** - Colors, gradients, borders, animations, scales, labels, tooltips, and legends
- 🌐 **Multi-Platform Support** - GitHub, GitLab, Bitbucket, and SourceHut
- 💻 **Interactive CLI** - Gradient banners, colored prompts, progress spinners
- 📊 **Smart Analytics** - Statistics dashboard with top repositories
- 🎯 **Flexible Selection** - Analyze all repos or choose specific ones
- 🚀 **Real-time Progress** - Live updates while fetching commit data
- 🎨 **Color Schemes** - Vibrant, consistent colors for better readability
- 📈 **Advanced Visualizations** - Heatmaps, contribution patterns, activity analysis
- 💾 **Export Options** - PNG images with high resolution (1600x800px)
- ⚙️ **Config Management** - Save default settings (username, platform, chart type)

---

## � Quick Start

### Prerequisites

Install system dependencies for canvas rendering:

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

**macOS:**

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Fedora/RHEL:**

```bash
sudo dnf install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

### Installation

#### Option 1: Install from npm (Recommended)

```bash
# Install globally
npm install -g @0xshariq/timeline

# If you get canvas errors, rebuild it:
npm rebuild canvas -g

# Run anywhere
timeline
```

Or with pnpm:

```bash
pnpm add -g @0xshariq/timeline

# If you get canvas errors:
pnpm rebuild canvas -g

timeline
```

Or with yarn:

```bash
yarn global add @0xshariq/timeline

# If you get canvas errors:
yarn global rebuild canvas

timeline
```

**Note:** Canvas automatically rebuilds on every run to ensure compatibility. This takes a few seconds initially. If you still encounter issues, see the [Troubleshooting Guide](TROUBLESHOOTING.md).

#### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/0xshariq/timeline.git
cd timeline

# Install dependencies
pnpm install

# Run the CLI
pnpm start

# Or link globally
pnpm link --global
timeline  # Now you can use it anywhere!
```

#### Option 3: Run with npx (No Installation)

```bash
npx @0xshariq/timeline
```

---

## 💻 How to Use

> **🔧 Having issues?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) for solutions to common problems including canvas errors and rate limits.

### ⚠️ Important: GitHub Authentication (Avoid Rate Limits)

GitHub API has strict rate limits:

- **Without authentication**: 60 requests/hour ❌ (Will fail for most users!)
- **With authentication**: 5,000 requests/hour ✅ (Recommended)

#### Step 1: Create a GitHub Personal Access Token

1. Go to **GitHub.com** → Click your profile picture → **Settings**
2. Scroll down to **Developer settings** (bottom of left sidebar)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token (classic)**
5. Give it a name (e.g., "timeline-cli")
6. Select scopes:
   - ✅ **`public_repo`** (required for public repositories)
   - ✅ **`repo`** (only if you want to access private repos)
7. Click **Generate token** at the bottom
8. **⚠️ Copy the token immediately** (you won't see it again!)

#### Step 2: Set the Token

**Option A: Temporary (Current Session Only)**

```bash
export GITHUB_TOKEN=ghp_your_token_here
timeline -p github -u 0xshariq
```

**Option B: Permanent (Recommended)**

For **Bash** users (~/.bashrc):

```bash
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc
source ~/.bashrc
```

For **Zsh** users (~/.zshrc):

```bash
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc
source ~/.zshrc
```

For **Fish** users:

```bash
set -Ux GITHUB_TOKEN ghp_your_token_here
```

#### Step 3: Verify It's Working

```bash
# Check if token is set
echo $GITHUB_TOKEN

# Test with timeline
timeline -p github -u 0xshariq --verbose
```

#### Troubleshooting Rate Limits

**If you still see "403: rate limit exceeded":**

1. Make sure token is set: `echo $GITHUB_TOKEN`
2. Verify token has correct permissions on GitHub
3. Wait for rate limit reset (error shows reset time)
4. Try with fewer repositories: `timeline -p github -u username -r "repo1,repo2"`

**Security Tips:**

- Never commit tokens to Git repositories
- Use minimum required permissions
- Rotate tokens periodically
- Revoke unused tokens in GitHub settings

### Basic Usage

```bash
# Interactive mode (recommended for beginners)
timeline

# Or with npx (no installation)
npx @0xshariq/timeline
```

### Command-Line Flags

Timeline supports powerful command-line flags for automation:

```bash
timeline [options]
timeline <command> [options]
```

#### Global Options

| Flag                    | Alias         | Description                 | Example            |
| ----------------------- | ------------- | --------------------------- | ------------------ |
| `-p, --platform <name>` |               | Git platform                | `-p github`        |
| `-u, --username <name>` |               | Username                    | `-u octocat`       |
| `-r, --repos <list>`    |               | Comma-separated repos       | `-r "repo1,repo2"` |
| `-a, --all`             |               | Analyze all repos           | `--all`            |
| `-t, --type <type>`     | `-c, --chart` | Chart type                  | `-t line`          |
| `-v, --verbose`         |               | Show detailed output        | `--verbose`        |
| `-q, --quiet`           |               | Minimal output              | `--quiet`          |
| `--no-merge`            |               | Exclude merge commits       | `--no-merge`       |
| `-o, --open`            |               | Open chart after generation | `--open`           |
| `-V, --version`         |               | Show version                | `--version`        |
| `-h, --help`            |               | Show help                   | `--help`           |

#### Chart Customization Options

**Colors & Gradients:**
| Flag | Description | Example |
|------|-------------|---------|
| `--colors <colors>` | Custom colors (hex, comma-separated) | `--colors "#FF5733,#33FF57,#3357FF"` |
| `--gradient` | Enable gradient colors | `--gradient` |
| `--gradient-start <color>` | Gradient start color | `--gradient-start "#667eea"` |
| `--gradient-end <color>` | Gradient end color | `--gradient-end "#764ba2"` |

**Borders:**
| Flag | Description | Example |
|------|-------------|---------|
| `--border-width <width>` | Border width (number) | `--border-width 3` |
| `--border-color <color>` | Border color (hex) | `--border-color "#000000"` |

**Animations:**
| Flag | Description | Example |
|------|-------------|---------|
| `--no-animate` | Disable animations | `--no-animate` |
| `--animation-duration <ms>` | Animation duration | `--animation-duration 2000` |
| `--animation-easing <easing>` | Easing function | `--animation-easing "easeInOutCubic"` |

**Scales:**
| Flag | Description | Example |
|------|-------------|---------|
| `--scale-type <type>` | Scale type (linear, logarithmic, time) | `--scale-type logarithmic` |
| `--no-zero` | Don't begin Y-axis at zero | `--no-zero` |
| `--no-grid` | Hide grid lines | `--no-grid` |

**Labels & Text:**
| Flag | Description | Example |
|------|-------------|---------|
| `--no-labels` | Hide labels | `--no-labels` |
| `--label-size <size>` | Label font size | `--label-size 14` |
| `--label-color <color>` | Label color (hex) | `--label-color "#333333"` |

**Tooltips:**
| Flag | Description | Example |
|------|-------------|---------|
| `--no-tooltips` | Disable tooltips | `--no-tooltips` |
| `--tooltip-bg <color>` | Tooltip background color | `--tooltip-bg "rgba(0,0,0,0.9)"` |

**Legend:**
| Flag | Description | Example |
|------|-------------|---------|
| `--no-legend` | Hide legend | `--no-legend` |
| `--legend-position <pos>` | Position (top, bottom, left, right) | `--legend-position right` |

> Refer customization guide [CUSTOMIZATION.md](docs/CUSTOMIZATION.md)

### Subcommands

#### 1. `quick` - Quick generation

```bash
timeline quick -p <platform> -u <username> [options]

# Examples
timeline quick -p github -u octocat
timeline quick -p gitlab -u johndoe -t pie
timeline quick -p bitbucket -u alice --no-merge
```

**Required options:**

- `-p, --platform` - Platform name
- `-u, --username` - Username

**Optional:**

- `-t, --type` - Chart type (default: line)
- `--no-merge` - Exclude merge commits

#### 2. `platforms` - List platforms

```bash
timeline platforms

# Output:
# 📦 Supported Platforms:
#   🐙 github     - GitHub
#   🦊 gitlab     - GitLab
#   🪣 bitbucket  - Bitbucket
#   🎯 sourcehut  - SourceHut
```

#### 3. `charts` - List chart types

```bash
timeline charts

# Output:
# 📊 Available Chart Types:
#   📈 line      - Timeline of commits over time
#   📊 bar       - Compare commits across repositories
#   🥧 pie       - Repository contribution percentage
#   🍩 doughnut  - Like pie chart with center hole
#   📡 radar     - Multi-dimensional comparison
#   🔥 heatmap   - Activity calendar (GitHub-style)
```

#### 4. `config` - Show configuration

```bash
timeline config

# Shows package version, Node version, etc.
```

#### 5. `examples` - Show usage examples

```bash
timeline examples

# Displays common usage patterns
```

### Usage Examples

#### Interactive Mode

```bash
# Full interactive experience
timeline
```

You'll be prompted for:

You'll be prompted for:

1. **Platform Selection** - Choose your Git platform
2. **Username** - Enter your username
3. **Repository Selection** - All or specific repos
4. **Chart Type** - Choose visualization type
5. **Options** - Verbosity, merge commits, auto-open

#### Quick Commands

```bash
# GitHub user with line chart (default)
timeline quick -p github -u octocat

# GitLab user with pie chart
timeline quick -p gitlab -u johndoe -t pie

# Bitbucket with bar chart, no merge commits
timeline quick -p bitbucket -u alice -t bar --no-merge
```

#### With Flags (Skip Prompts)

```bash
# Specific platform and user
timeline -p github -u octocat

# All repos with verbose output
timeline -p github -u octocat --all --verbose

# Specific repos with heatmap
timeline -p gitlab -u johndoe -r "project1,project2,project3" -t heatmap

# Pie chart, open automatically
timeline -p bitbucket -u bob --all -t pie --open

# Bar chart without merge commits, quiet mode
timeline -p github -u charlie --all -t bar --no-merge --quiet
```

#### Chart Customization Examples

```bash
# Custom colors (3 repositories with specific colors)
timeline -p github -u octocat -t bar --colors "#FF5733,#33FF57,#3357FF"

# Gradient colors for line chart
timeline -p github -u octocat -t line --gradient --gradient-start "#667eea" --gradient-end "#764ba2"

# Thick borders with custom color
timeline -p github -u octocat -t pie --border-width 5 --border-color "#FF0000"

# No animations for faster generation
timeline -p github -u octocat -t bar --no-animate

# Logarithmic scale for large value differences
timeline -p github -u octocat -t line --scale-type logarithmic

# Large labels with custom color
timeline -p github -u octocat -t bar --label-size 16 --label-color "#FF6B6B"

# No grid lines, no legend for clean look
timeline -p github -u octocat -t line --no-grid --no-legend

# Right-positioned legend
timeline -p github -u octocat -t pie --legend-position right

# Combine multiple customizations
timeline -p github -u octocat -t bar \
  --colors "#FF6B6B,#4ECDC4,#45B7D1,#FFA07A,#98D8C8" \
  --border-width 3 \
  --label-size 14 \
  --no-grid \
  --animation-duration 2000

# Perfect for presentations (clean, no tooltips)
timeline -p github -u octocat -t pie \
  --colors "#667eea,#764ba2,#f093fb,#4facfe" \
  --no-tooltips \
  --label-size 16 \
  --border-width 0

# Heatmap with custom colors
timeline -p github -u octocat -t heatmap \
  --gradient \
  --gradient-start "#9be9a8" \
  --gradient-end "#216e39"
```

#### Automation & CI/CD

```bash
# Perfect for scripts and automation
timeline quick -p github -u $GIT_USERNAME -t line

# Generate multiple charts
for type in line bar pie; do
  timeline quick -p github -u octocat -t $type
done

# Environment variables
export TIMELINE_PLATFORM=github
export TIMELINE_USER=octocat
timeline quick -p $TIMELINE_PLATFORM -u $TIMELINE_USER
```

### Interactive Workflow

When you run `timeline` in interactive mode:

**Step 1: Platform**

**Step 4: Chart Type**

```
? Select chart type: (Use arrow keys)
❯ 📈 Line Chart      - Timeline of commits over time
  📊 Bar Chart       - Compare commits across repositories
  🥧 Pie Chart       - Repository contribution percentage
  🍩 Doughnut Chart  - Like pie chart with center hole
  📡 Radar Chart     - Multi-dimensional repository comparison
  🔥 Heatmap         - Activity calendar (GitHub-style)
```

**Step 5: Options**

**Step 5: Options**

```
? Select options: (Press space to select)
❯ ◉ Show detailed progress
  ◉ Include merge commits
  ◯ Open chart after generation
```

**Step 6: Processing**

**Step 6: Processing**

```
──────────────────────────────────────────────────

⠼ Processing awesome-project (3/12)
ℹ Found 12 repositories
✓ my-library: 89 commits
✓ cli-tool: 143 commits
⚠ Skipped empty-repo: No commits found
✓ awesome-project: 67 commits
...
```

**Step 7: Results**

**Statistics Summary:**

```
📊 Statistics Summary
─────────────────────
Total Commits: 847
Repositories: 12
Date Range: 2023-01-15 to 2024-11-02 (657 days)
Average per Repo: 70 commits
Average per Day: 1.29 commits

🏆 Top Repositories:
  1. cli-tool: 143 commits
  2. my-library: 89 commits
  3. awesome-project: 67 commits
  4. web-app: 58 commits
  5. api-server: 52 commits
```

**Success Message:**

```
╭─────────────────────────────────────────────╮
│                                             │
│   ✨ Chart saved as timeline.png ✨        │
│                                             │
│   You can find it in the current directory │
│                                             │
╰─────────────────────────────────────────────╯
```

---

## 🌐 Supported Platforms

| Platform         | Support | API Version | Rate Limit |
| ---------------- | ------- | ----------- | ---------- |
| **GitHub** 🐙    | ✅ Full | REST v3     | 60/hour    |
| **GitLab** 🦊    | ✅ Full | REST v4     | 10/sec     |
| **Bitbucket** 🪣 | ✅ Full | API 2.0     | Varies     |
| **SourceHut** 🎯 | ✅ Full | GraphQL     | Check docs |

### Increase Rate Limits (Optional)

Add authentication tokens to provider files for higher limits:

**GitHub** (`src/providers/github.js`):

```javascript
async fetchRepos() {
  const res = await fetch(`${this.baseUrl}/users/${this.username}/repos`, {
    headers: { 'Authorization': 'token YOUR_GITHUB_TOKEN' }
  });
  // ...
}
```

**GitLab** (`src/providers/gitlab.js`):

```javascript
headers: { 'PRIVATE-TOKEN': 'YOUR_GITLAB_TOKEN' }
```

---

## � Output

## 📈 Chart Types & Output

### Available Chart Types

#### 📈 Line Chart (Default)

**Best for:** Timeline analysis, trend visualization

**Output:** `timeline-line.png`

```
• Shows commit frequency over time
• Multiple repositories as different colored lines
• Date range on X-axis, commit count on Y-axis
• Perfect for seeing activity patterns
```

#### 📊 Bar Chart

**Best for:** Repository comparison, total commits

**Output:** `timeline-bar.png`

```
• Compares total commits across repositories
• Each bar represents a different repository
• Easy to identify most active projects
• Great for portfolio showcases
```

#### 🥧 Pie Chart

**Best for:** Contribution percentage, repository share

**Output:** `timeline-pie.png`

```
• Shows percentage of commits per repository
• Visual breakdown of contribution distribution
• Color-coded segments with percentages
• Ideal for understanding project focus
```

#### 🍩 Doughnut Chart

**Best for:** Similar to pie but with modern look

**Output:** `timeline-doughnut.png`

```
• Same as pie chart with center hole
• More modern and aesthetic design
• Shows percentages and repository names
• Center can display total commits
```

#### 📡 Radar Chart

**Best for:** Multi-dimensional comparison

**Output:** `timeline-radar.png`

```
• Compares repositories across multiple metrics
• Shows commits, contributors, activity patterns
• Pentagon/hexagon shape for 5-6 metrics
• Perfect for comprehensive repository analysis
```

#### 🔥 Heatmap (GitHub-style)

**Best for:** Daily activity patterns, contribution calendar

**Output:** `timeline-heatmap.png`

```
• GitHub-style contribution calendar
• Each cell represents a day
• Color intensity shows commit frequency
• Week rows, day columns (365 days)
• Perfect for seeing work patterns
```

#### 🎯 Polar Area Chart

**Best for:** Circular data visualization, radial comparison

**Output:** `timeline-polarArea.png`

```
• Radial representation of repository data
• Similar to pie chart but with radius variation
• Shows both proportion and magnitude
• Beautiful circular design
• Great for presentations
```

#### ⚡ Scatter Chart

**Best for:** Finding patterns, outlier detection, distribution analysis

**Output:** `timeline-scatter.png`

```
• Plots individual commits over time
• Shows commit distribution patterns
• Identifies activity clusters and gaps
• Great for detecting unusual patterns
• X-axis: time, Y-axis: commits
```

#### 💬 Bubble Chart

**Best for:** Multi-dimensional data with three variables

**Output:** `timeline-bubble.png`

```
• Like scatter but with bubble sizes
• Shows repository size, activity, and time
• Bubble size represents commit count
• Perfect for complex relationships
• Multiple dimensions in one chart
```

#### 🎨 Mixed Chart

**Best for:** Combining different chart types, complex comparisons

**Output:** `timeline-mixed.png`

```
• Combines line and bar charts
• Show different data types together
• Compare trends and totals
• Highly customizable
• Professional analytics appearance
```

### Generated Chart Features

All charts include:

✅ **High Resolution** - 1600x800px for clarity  
✅ **Professional Design** - Clean, modern aesthetics  
✅ **Color Coded** - Vibrant, consistent color schemes  
✅ **Proper Scaling** - Auto-adjusted axes  
✅ **Metadata** - Titles with statistics  
✅ **Legend** - Clear repository identification  
✅ **Data Labels** - Percentages, values on charts

---

## 🏗️ Project Structure

```
repo-timeline/
├── src/
│   ├── index.js              # CLI entry point (styled prompts)
│   ├── timeline.js           # Core logic & orchestration
│   ├── chart.js              # Chart.js configuration
│   ├── config.default.js     # Default settings
│   ├── providers/            # Platform-specific APIs
│   │   ├── github.js         # GitHub integration
│   │   ├── gitlab.js         # GitLab integration
│   │   ├── bitbucket.js      # Bitbucket integration
│   │   └── sourcehut.js      # SourceHut integration
│   └── utils/                # Helper utilities
│       ├── colors.js         # Color schemes
│       └── stats.js          # Statistics calculations
├── index.js                  # Entry point
├── package.json              # Dependencies & scripts
└── README.md                 # Documentation
```

---

## 🎨 CLI Features

### Visual Components

| Feature              | Description                        |
| -------------------- | ---------------------------------- |
| 🎨 Gradient Banners  | Eye-catching startup screen        |
| 🌈 Colored Prompts   | Cyan questions, gray feedback      |
| ⏳ Progress Spinners | Real-time animated feedback        |
| 📦 Styled Boxes      | Important messages in frames       |
| ✓ Status Icons       | Success (✓), Info (ℹ), Warning (⚠) |
| 🎯 Emoji Indicators  | Visual context throughout          |

### Interactive Options

```javascript
// Available configurations
{
  verbose: true,           // Show detailed progress
  includeMerges: true,     // Include merge commits
  openChart: false         // Auto-open after generation
}
```

---

## 🔧 Development

### Run in Development Mode

```bash
pnpm run dev  # Auto-reload on file changes
```

### Adding New Platforms

1. **Create Provider** (`src/providers/newplatform.js`):

```javascript
export class NewPlatformProvider {
  constructor(username) {
    this.username = username;
    this.baseUrl = "https://api.newplatform.com";
  }

  async fetchRepos() {
    // Return array of repo names
  }

  async fetchAllCommits(repo, config) {
    // Return array of commits
    // Format: [{ date, author, message }, ...]
  }
}
```

2. **Register in Timeline** (`src/timeline.js`):

```javascript
import { NewPlatformProvider } from "./providers/newplatform.js";

const providers = {
  // ...existing
  newplatform: NewPlatformProvider,
};
```

3. **Add to CLI Menu** (`src/index.js`):

```javascript
choices: [
  // ...existing
  { name: "🎯 NewPlatform", value: "newplatform" },
];
```

### Dependencies

| Package             | Purpose                 |
| ------------------- | ----------------------- |
| `@inquirer/prompts` | Interactive CLI prompts |
| `chalk`             | Terminal styling        |
| `ora`               | Progress spinners       |
| `boxen`             | Terminal boxes          |
| `gradient-string`   | Gradient text           |
| `chart.js`          | Chart generation        |
| `canvas`            | Node canvas renderer    |
| `node-fetch`        | HTTP requests           |

---

## 🐛 Troubleshooting

> Refer the troubleshooting guide [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📝 Scripts

```bash
# For users
npm install -g @0xshariq/timeline  # Install globally
npx @0xshariq/timeline              # Run without installing
timeline                            # Run if installed globally

# For developers
pnpm start          # Run the CLI
pnpm run dev        # Run with auto-reload
node index.js       # Direct execution
```

---

## 📦 Publishing to npm

For maintainers:

```bash
# Login to npm
npm login

# Bump version
npm version patch  # or minor, or major

# Publish (scoped package)
npm publish --access public

# Verify
npm view @0xshariq/timeline
```

---

## � License

ISC License - Feel free to use and modify!

---

## 🤝 Contributing

Contributions welcome! Ideas:

- 🔐 Add built-in auth token support
- 📊 More chart types (bar, pie)
- 🎨 Additional color schemes
- 📁 Export to JSON/CSV
- 🌍 More Git platforms
- 📱 Generate HTML reports

---

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Chart.js](https://www.chartjs.org/) - Powerful charting
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) - Beautiful prompts
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Ora](https://github.com/sindresorhus/ora) - Elegant spinners

---

<div align="center">

**Made with ❤️ and ☕**

_Happy Analyzing!_ 🚀

</div>
