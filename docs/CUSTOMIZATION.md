# 🎨 Chart Customization Guide

This guide covers all available customization options for creating stunning, personalized charts.

## Table of Contents

- [Quick Start](#quick-start)
- [Colors & Gradients](#colors--gradients)
- [Borders](#borders)
- [Animations](#animations)
- [Scales & Axes](#scales--axes)
- [Labels & Text](#labels--text)
- [Tooltips](#tooltips)
- [Legend](#legend)
- [Complete Examples](#complete-examples)
- [Best Practices](#best-practices)

---

## Quick Start

### Default Behavior

Without any customization flags, charts use beautiful default settings:

```bash
timeline -p github -u octocat -t bar
```

### Basic Customization

Add custom colors to your chart:

```bash
timeline -p github -u octocat -t bar --colors "#FF6B6B,#4ECDC4,#45B7D1"
```

---

## Colors & Gradients

### Custom Colors

Specify exact colors for your data using hex codes:

```bash
# Single color scheme
timeline -p github -u octocat -t pie \
  --colors "#FF5733,#33FF57,#3357FF,#F3FF33,#FF33F3"

# Professional business colors
timeline -p github -u octocat -t bar \
  --colors "#2C3E50,#34495E,#7F8C8D,#95A5A6,#BDC3C7"

# Vibrant rainbow
timeline -p github -u octocat -t doughnut \
  --colors "#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#4B0082,#9400D3"
```

**Color Schemes by Theme:**

**Modern Tech:**
```bash
--colors "#667eea,#764ba2,#f093fb,#4facfe,#00f2fe"
```

**Nature:**
```bash
--colors "#56ab2f,#a8e063,#38ef7d,#11998e,#0575e6"
```

**Sunset:**
```bash
--colors "#ff6b6b,#ee5a6f,#c44569,#f8b500,#feca57"
```

**Ocean:**
```bash
--colors "#1e3799,#0c2461,#4a69bd,#60a3bc,#82ccdd"
```

### Gradient Colors

Enable smooth color transitions:

```bash
# Basic gradient
timeline -p github -u octocat -t line --gradient

# Custom gradient colors
timeline -p github -u octocat -t line \
  --gradient \
  --gradient-start "#FF6B6B" \
  --gradient-end "#4ECDC4"

# Purple-to-blue gradient
timeline -p github -u octocat -t line \
  --gradient \
  --gradient-start "#667eea" \
  --gradient-end "#764ba2"

# Green gradient
timeline -p github -u octocat -t line \
  --gradient \
  --gradient-start "#56ab2f" \
  --gradient-end "#a8e063"
```

---

## Borders

### Border Width

Control the thickness of chart element borders:

```bash
# Thin borders (default: 2)
timeline -p github -u octocat -t pie --border-width 1

# Medium borders
timeline -p github -u octocat -t doughnut --border-width 3

# Thick borders for emphasis
timeline -p github -u octocat -t bar --border-width 5

# No borders
timeline -p github -u octocat -t pie --border-width 0
```

### Border Color

Customize border colors:

```bash
# Black borders
timeline -p github -u octocat -t pie --border-color "#000000"

# White borders (great for dark backgrounds)
timeline -p github -u octocat -t doughnut --border-color "#FFFFFF"

# Colored borders matching theme
timeline -p github -u octocat -t bar \
  --colors "#FF6B6B,#4ECDC4" \
  --border-color "#2C3E50"

# Transparent borders
timeline -p github -u octocat -t pie --border-width 0
```

---

## Animations

### Enable/Disable Animations

```bash
# Disable animations (faster generation)
timeline -p github -u octocat -t bar --no-animate

# Enable with custom duration (default: 1000ms)
timeline -p github -u octocat -t line --animation-duration 2000

# Fast animation
timeline -p github -u octocat -t pie --animation-duration 500
```

### Animation Easing

Control animation smoothness:

```bash
# Linear (constant speed)
timeline -p github -u octocat -t bar --animation-easing "linear"

# Ease in (slow start)
timeline -p github -u octocat -t bar --animation-easing "easeInQuad"

# Ease out (slow end)
timeline -p github -u octocat -t bar --animation-easing "easeOutQuad"

# Ease in-out (slow start and end)
timeline -p github -u octocat -t bar --animation-easing "easeInOutQuad"

# Cubic easing (smoother)
timeline -p github -u octocat -t bar --animation-easing "easeInOutCubic"
```

---

## Scales & Axes

### Scale Types

Choose the appropriate scale for your data:

```bash
# Linear scale (default)
timeline -p github -u octocat -t line --scale-type linear

# Logarithmic scale (for large value differences)
timeline -p github -u octocat -t line --scale-type logarithmic

# Time scale (for time-series data)
timeline -p github -u octocat -t line --scale-type time
```

### Zero Baseline

Control Y-axis starting point:

```bash
# Start at zero (default)
timeline -p github -u octocat -t bar

# Don't force zero (auto-scale)
timeline -p github -u octocat -t bar --no-zero
```

### Grid Lines

Show or hide grid lines:

```bash
# Show grid lines (default)
timeline -p github -u octocat -t line

# Hide grid lines for clean look
timeline -p github -u octocat -t line --no-grid
```

---

## Labels & Text

### Show/Hide Labels

```bash
# Show all labels (default)
timeline -p github -u octocat -t bar

# Hide labels for minimalist design
timeline -p github -u octocat -t bar --no-labels
```

### Label Size

Customize label font size:

```bash
# Small labels
timeline -p github -u octocat -t bar --label-size 10

# Default size
timeline -p github -u octocat -t bar --label-size 12

# Large labels for presentations
timeline -p github -u octocat -t bar --label-size 18

# Extra large
timeline -p github -u octocat -t bar --label-size 24
```

### Label Color

Change label text color:

```bash
# Dark gray (default)
timeline -p github -u octocat -t bar --label-color "#666666"

# Black
timeline -p github -u octocat -t bar --label-color "#000000"

# Colored labels
timeline -p github -u octocat -t bar --label-color "#FF6B6B"

# Light labels (for dark themes)
timeline -p github -u octocat -t bar --label-color "#FFFFFF"
```

---

## Tooltips

### Enable/Disable Tooltips

```bash
# Show tooltips (default)
timeline -p github -u octocat -t line

# Hide tooltips
timeline -p github -u octocat -t line --no-tooltips
```

### Tooltip Background

Customize tooltip appearance:

```bash
# Dark background (default)
timeline -p github -u octocat -t bar \
  --tooltip-bg "rgba(0, 0, 0, 0.8)"

# Semi-transparent white
timeline -p github -u octocat -t bar \
  --tooltip-bg "rgba(255, 255, 255, 0.9)"

# Colored background
timeline -p github -u octocat -t bar \
  --tooltip-bg "rgba(102, 126, 234, 0.9)"
```

---

## Legend

### Show/Hide Legend

```bash
# Show legend (default)
timeline -p github -u octocat -t pie

# Hide legend
timeline -p github -u octocat -t pie --no-legend
```

### Legend Position

Control where the legend appears:

```bash
# Bottom (default)
timeline -p github -u octocat -t pie --legend-position bottom

# Top
timeline -p github -u octocat -t pie --legend-position top

# Left
timeline -p github -u octocat -t pie --legend-position left

# Right (great for pie/doughnut charts)
timeline -p github -u octocat -t pie --legend-position right
```

---

## Complete Examples

### 1. Professional Business Report

```bash
timeline -p github -u octocat -t bar \
  --colors "#2C3E50,#34495E,#7F8C8D,#95A5A6,#BDC3C7" \
  --border-width 1 \
  --label-size 14 \
  --label-color "#2C3E50" \
  --no-grid \
  --legend-position bottom
```

### 2. Vibrant Presentation

```bash
timeline -p github -u octocat -t pie \
  --colors "#FF6B6B,#4ECDC4,#45B7D1,#FFA07A,#98D8C8,#F7DC6F" \
  --border-width 0 \
  --label-size 16 \
  --legend-position right \
  --animation-duration 2000 \
  --animation-easing "easeInOutCubic"
```

### 3. Minimalist Clean Design

```bash
timeline -p github -u octocat -t line \
  --colors "#000000" \
  --border-width 1 \
  --border-color "#000000" \
  --no-grid \
  --label-size 12 \
  --label-color "#333333" \
  --no-legend \
  --no-tooltips
```

### 4. Gradient Paradise

```bash
timeline -p github -u octocat -t line \
  --gradient \
  --gradient-start "#667eea" \
  --gradient-end "#764ba2" \
  --border-width 3 \
  --label-size 14 \
  --animation-duration 1500
```

### 5. Dark Theme

```bash
timeline -p github -u octocat -t bar \
  --colors "#BB86FC,#03DAC6,#CF6679,#3700B3" \
  --border-color "#000000" \
  --border-width 2 \
  --label-color "#FFFFFF" \
  --tooltip-bg "rgba(0, 0, 0, 0.95)" \
  --no-grid
```

### 6. Scientific/Academic

```bash
timeline -p github -u octocat -t line \
  --colors "#0066CC,#FF6600,#009900,#CC0000" \
  --border-width 2 \
  --scale-type linear \
  --label-size 12 \
  --label-color "#000000" \
  --legend-position top
```

### 7. Rainbow Doughnut

```bash
timeline -p github -u octocat -t doughnut \
  --colors "#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#4B0082,#9400D3" \
  --border-width 3 \
  --border-color "#FFFFFF" \
  --label-size 14 \
  --legend-position right \
  --animation-duration 2000
```

### 8. Fast Generation (No Animation)

```bash
timeline -p github -u octocat -t bar \
  --colors "#4ECDC4,#45B7D1" \
  --no-animate \
  --label-size 12
```

### 9. Logarithmic Scale for Large Repos

```bash
timeline -p github -u octocat -t line \
  --scale-type logarithmic \
  --colors "#667eea,#764ba2" \
  --border-width 2 \
  --label-size 12
```

### 10. Heatmap Custom Colors

```bash
timeline -p github -u octocat -t heatmap \
  --gradient \
  --gradient-start "#ebedf0" \
  --gradient-end "#216e39" \
  --no-legend
```

---

## Best Practices

### 1. Color Selection

**Do:**
- Use 3-7 colors maximum for clarity
- Choose colors with good contrast
- Use color schemes that match your brand
- Consider colorblind-friendly palettes

**Don't:**
- Mix too many bright colors
- Use similar shades that are hard to distinguish
- Forget about accessibility

### 2. Chart Type Selection

- **Line charts:** Time-series data, trends
- **Bar charts:** Comparisons, rankings
- **Pie/Doughnut:** Proportions, percentages
- **Radar:** Multi-dimensional comparisons
- **Heatmap:** Daily activity patterns
- **Polar Area:** Circular data visualization
- **Scatter:** Distribution and patterns
- **Bubble:** Three-variable relationships
- **Mixed:** Complex multi-type data

### 3. Labels & Text

- Use larger labels (16-18px) for presentations
- Use smaller labels (10-12px) for detailed reports
- Keep label colors readable
- Hide labels only when chart is self-explanatory

### 4. Animations

- Use animations for presentations (1500-2000ms)
- Disable animations for batch generation
- Use easing for smooth, professional appearance

### 5. Grid & Borders

- Hide grid for clean, minimalist look
- Use borders to separate data clearly
- Thicker borders (3-5px) for emphasis
- No borders (0px) for seamless appearance

### 6. Legends

- Position legends where they don't obscure data
- Right position works best for pie/doughnut charts
- Bottom position works best for line/bar charts
- Hide legend if you have only 1-2 data points

### 7. Performance

- Disable animations for faster generation
- Use `--quiet` flag to reduce output
- Process fewer repositories for quicker results

---

## Troubleshooting

### Colors Not Applying

Make sure to:
1. Use hex format: `#FF5733` or `#F57`
2. Separate multiple colors with commas
3. Quote the entire color string: `"#FF5733,#33FF57"`

### Labels Too Small

Increase label size:
```bash
--label-size 16  # or higher
```

### Chart Looks Cluttered

Try:
```bash
--no-grid --no-legend --border-width 1
```

### Need Faster Generation

Disable animations:
```bash
--no-animate
```

---

## More Examples

Visit our [GitHub repository](https://github.com/0xshariq/timeline) for:
- Sample outputs
- Community color schemes
- Advanced customization scripts
- CI/CD integration examples

---

**Happy Customizing!** 🎨✨
