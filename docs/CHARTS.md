# 📊 Chart Types Documentation

Complete guide to all available chart types in Repository Timeline Generator, including both 2D and 3D visualizations.

---

## Table of Contents

- [2D Charts (Chart.js)](#2d-charts-chartjs)
  - [Line Chart](#-line-chart)
  - [Bar Chart](#-bar-chart)
  - [Pie Chart](#-pie-chart)
  - [Doughnut Chart](#-doughnut-chart)
  - [Radar Chart](#-radar-chart)
  - [Heatmap](#-heatmap)
  - [Polar Area Chart](#-polar-area-chart)
  - [Scatter Chart](#-scatter-chart)
  - [Bubble Chart](#-bubble-chart)
  - [Mixed Chart](#-mixed-chart)
- [3D Charts (Three.js)](#3d-charts-threejs)
  - [3D Bar Chart](#-3d-bar-chart)
  - [3D Line Chart](#-3d-line-chart)
  - [3D Scatter Chart](#-3d-scatter-chart)
  - [3D Surface Chart](#-3d-surface-chart)
  - [3D Bubble Chart](#-3d-bubble-chart)
- [Comparison Table](#comparison-table)
- [Usage Examples](#usage-examples)

---

## 2D Charts (Chart.js)

Traditional flat visualizations powered by Chart.js. Best for standard reporting, documentation, and presentations.

### 📈 Line Chart

**Type:** `line`  
**Output:** `charts/timeline-line.png`  
**Technology:** Chart.js

#### Description

Shows commit activity over time as a continuous line graph. Perfect for visualizing trends and patterns in your development workflow.

#### Best Used For

- Timeline analysis
- Trend visualization
- Activity pattern detection
- Long-term progress tracking
- Comparing multiple repositories over time

#### Visual Characteristics

```
• X-Axis: Dates (chronological timeline)
• Y-Axis: Commit count
• Lines: Each repository is a different colored line
• Points: Individual data points for each date
• Area: Optional fill under the line
• Grid: Optional background grid for reference
```

#### Features

- ✅ Multiple lines for different repositories
- ✅ Smooth curves with tension control
- ✅ Point markers on data values
- ✅ Tooltips showing exact values
- ✅ Zoom and pan support
- ✅ Animation on load
- ✅ Responsive legend

#### Example Command

```bash
timeline -p github -u octocat -t line
timeline quick -p gitlab -u johndoe -t line
```

#### When to Use

- You want to see commit trends over time
- You're comparing activity between repositories
- You need to identify busy/quiet periods
- You're tracking project momentum

---

### 📊 Bar Chart

**Type:** `bar`  
**Output:** `charts/timeline-bar.png`  
**Technology:** Chart.js

#### Description

Displays total commits per repository as vertical bars. Ideal for comparing the overall activity across different projects.

#### Best Used For

- Repository comparison
- Total commit counts
- Portfolio showcases
- Quick activity overview
- Side-by-side comparisons

#### Visual Characteristics

```
• X-Axis: Repository names
• Y-Axis: Total commit count
• Bars: Vertical bars for each repository
• Width: Adjustable bar width and spacing
• Colors: Each repository has a unique color
• Values: Optional data labels on top of bars
```

#### Features

- ✅ Grouped bars for multiple datasets
- ✅ Stacked bar option
- ✅ Horizontal bar variant
- ✅ Adjustable bar thickness
- ✅ Custom colors per bar
- ✅ Data labels on bars

#### Example Command

```bash
timeline -p github -u octocat -t bar
timeline -p github -u octocat -t bar --colors "#FF6B6B,#4ECDC4,#45B7D1"
```

#### When to Use

- You want to compare total commits across repos
- You're presenting repository statistics
- You need a simple, clear comparison
- You're creating a portfolio visualization

---

### 🥧 Pie Chart

**Type:** `pie`  
**Output:** `charts/timeline-pie.png`  
**Technology:** Chart.js

#### Description

Shows the percentage distribution of commits across repositories as a circular pie. Each slice represents a repository's contribution.

#### Best Used For

- Contribution percentage
- Repository share visualization
- Focus area identification
- Proportional analysis
- Portfolio breakdown

#### Visual Characteristics

```
• Shape: Circular pie divided into slices
• Slices: Each repository is a slice
• Size: Slice size = commit percentage
• Labels: Repository names with percentages
• Colors: Distinct color for each slice
• Center: Optional total commit count
```

#### Features

- ✅ Percentage labels on slices
- ✅ Legend with repository names
- ✅ Custom color schemes
- ✅ Exploded slices (pull out)
- ✅ Rotation animation
- ✅ Hover effects

#### Example Command

```bash
timeline -p github -u octocat -t pie
timeline -p github -u octocat -t pie --colors "#667eea,#764ba2,#f093fb"
```

#### When to Use

- You want to show contribution proportions
- You need a simple percentage breakdown
- You're analyzing project focus areas
- You're creating visual reports

---

### 🍩 Doughnut Chart

**Type:** `doughnut`  
**Output:** `charts/timeline-doughnut.png`  
**Technology:** Chart.js

#### Description

Similar to pie chart but with a hole in the center, providing a more modern aesthetic. The center can display total statistics.

#### Best Used For

- Modern portfolio presentations
- Contribution distribution
- Focus visualization
- Aesthetic reports
- Dashboard widgets

#### Visual Characteristics

```
• Shape: Ring-shaped (pie with center hole)
• Slices: Arc segments around the ring
• Center: Empty space for text/stats
• Labels: Percentages and names
• Thickness: Adjustable ring width
• Animation: Rotation on load
```

#### Features

- ✅ Center text support (total commits)
- ✅ Adjustable inner/outer radius
- ✅ Multiple rings (nested doughnuts)
- ✅ Smooth animations
- ✅ Modern, clean look
- ✅ Mobile-friendly

#### Example Command

```bash
timeline -p github -u octocat -t doughnut
```

#### When to Use

- You want a modern alternative to pie chart
- You need space for center statistics
- You're creating dashboard-style reports
- You prefer minimalist design

---

### 📡 Radar Chart

**Type:** `radar`  
**Output:** `charts/timeline-radar.png`  
**Technology:** Chart.js

#### Description

Multi-dimensional comparison displayed as a polygon. Each axis represents a different metric, showing repository characteristics at a glance.

#### Best Used For

- Multi-dimensional comparison
- Repository profiling
- Performance metrics
- Capability assessment
- Comprehensive analysis

#### Visual Characteristics

```
• Shape: Pentagon/hexagon with multiple axes
• Axes: One per metric (commits, activity, etc.)
• Lines: Repository profiles as polygons
• Fill: Semi-transparent area fills
• Center: Origin point (zero)
• Angles: Even distribution around circle
```

#### Features

- ✅ Multiple overlapping polygons
- ✅ 5-6 different metrics
- ✅ Semi-transparent fills
- ✅ Customizable axis labels
- ✅ Grid lines for reference
- ✅ Interactive hover

#### Example Command

```bash
timeline -p github -u octocat -t radar
```

#### When to Use

- You want to compare multiple metrics
- You need comprehensive repository profiling
- You're analyzing development patterns
- You're comparing project capabilities

---

### 🔥 Heatmap

**Type:** `heatmap`  
**Output:** `charts/timeline-heatmap.png`  
**Technology:** Chart.js

#### Description

GitHub-style contribution calendar showing daily commit activity. Color intensity represents the number of commits on each day.

#### Best Used For

- Daily activity patterns
- Contribution calendars
- Work habit analysis
- GitHub-style visualization
- Year-long activity view

#### Visual Characteristics

```
• Layout: Grid of squares (365 days)
• Rows: Weeks (52-53 rows)
• Columns: Days of week (7 columns)
• Colors: Intensity-based (light to dark)
• Legend: Color scale reference
• Labels: Month names, day names
```

#### Features

- ✅ 365-day activity view
- ✅ Color intensity mapping
- ✅ Week/month labels
- ✅ Hover tooltips with dates
- ✅ GitHub-inspired design
- ✅ Pattern recognition

#### Example Command

```bash
timeline -p github -u octocat -t heatmap
timeline -p github -u octocat -t heatmap --gradient-start "#9be9a8" --gradient-end "#216e39"
```

#### When to Use

- You want to show daily commit patterns
- You're analyzing work habits
- You need GitHub-style visualization
- You're tracking consistency

---

### 🎯 Polar Area Chart

**Type:** `polarArea`  
**Output:** `charts/timeline-polarArea.png`  
**Technology:** Chart.js

#### Description

Circular chart where both angle and radius represent data values. Combines aspects of pie and bar charts in a radial format.

#### Best Used For

- Circular data visualization
- Radial comparison
- Aesthetic presentations
- Multi-repository analysis
- Portfolio showcases

#### Visual Characteristics

```
• Shape: Circular with radiating segments
• Segments: Equal angles, varying radii
• Radius: Represents commit count
• Colors: One per repository
• Center: Origin point
• Labels: Repository names with values
```

#### Features

- ✅ Beautiful circular design
- ✅ Both angle and radius data
- ✅ Smooth animations
- ✅ Custom color schemes
- ✅ Legend support
- ✅ Hover interactions

#### Example Command

```bash
timeline -p github -u octocat -t polarArea
```

#### When to Use

- You want an attractive circular visualization
- You need radial data representation
- You're creating presentation materials
- You prefer unique chart styles

---

### ⚡ Scatter Chart

**Type:** `scatter`  
**Output:** `charts/timeline-scatter.png`  
**Technology:** Chart.js

#### Description

Plots individual commits as points on a 2D grid. Useful for identifying patterns, clusters, and outliers in commit behavior.

#### Best Used For

- Pattern detection
- Outlier identification
- Distribution analysis
- Correlation visualization
- Activity clustering

#### Visual Characteristics

```
• X-Axis: Time (dates)
• Y-Axis: Commits per day
• Points: Individual commits as dots
• Size: Optional point size variation
• Colors: Repository-based coloring
• Clusters: Visual groupings of activity
```

#### Features

- ✅ Individual point plotting
- ✅ Pattern recognition
- ✅ Cluster identification
- ✅ Outlier detection
- ✅ Trend lines (optional)
- ✅ Multiple datasets

#### Example Command

```bash
timeline -p github -u octocat -t scatter
```

#### When to Use

- You want to find patterns in commits
- You need to identify unusual activity
- You're analyzing commit distribution
- You're looking for correlations

---

### 💬 Bubble Chart

**Type:** `bubble`  
**Output:** `charts/timeline-bubble.png`  
**Technology:** Chart.js

#### Description

Advanced scatter chart where bubble size represents a third dimension (like repository size or commit count). Perfect for multi-dimensional data.

#### Best Used For

- Multi-dimensional analysis
- Complex relationships
- Three-variable visualization
- Advanced analytics
- Research presentations

#### Visual Characteristics

```
• X-Axis: Time or metric 1
• Y-Axis: Commits or metric 2
• Bubble Size: Third metric (repo size, etc.)
• Colors: Repository identification
• Transparency: Optional opacity control
• Overlap: Bubbles can overlap
```

#### Features

- ✅ Three dimensions of data
- ✅ Variable bubble sizes
- ✅ Custom color schemes
- ✅ Transparency control
- ✅ Detailed tooltips
- ✅ Interactive zoom

#### Example Command

```bash
timeline -p github -u octocat -t bubble
```

#### When to Use

- You have three related data dimensions
- You need complex relationship visualization
- You're doing advanced analysis
- You're creating research charts

---

### 🎨 Mixed Chart

**Type:** `mixed`  
**Output:** `charts/timeline-mixed.png`  
**Technology:** Chart.js

#### Description

Combines multiple chart types (line + bar) in a single visualization. Allows showing different data representations simultaneously.

#### Best Used For

- Complex comparisons
- Multi-type data
- Professional analytics
- Advanced reporting
- Comprehensive analysis

#### Visual Characteristics

```
• Primary: Line chart for trends
• Secondary: Bar chart for totals
• Axes: Dual Y-axes support
• Colors: Distinct for each type
• Legend: Shows both chart types
• Tooltips: Unified for all data
```

#### Features

- ✅ Multiple chart types combined
- ✅ Dual Y-axes support
- ✅ Synchronized tooltips
- ✅ Unified legend
- ✅ Custom combinations
- ✅ Professional appearance

#### Example Command

```bash
timeline -p github -u octocat -t mixed
```

#### When to Use

- You need multiple data representations
- You're comparing trends and totals
- You're creating professional reports
- You need advanced visualizations

---

## 3D Charts (Three.js)

Interactive 3D visualizations powered by Three.js. Best for impressive presentations, modern dashboards, and immersive data exploration.

### 🎲 3D Bar Chart

**Type:** `bar3d`  
**Output:** `charts/timeline-bar3d.png`  
**Technology:** Three.js

#### Description

Three-dimensional bars rising from a base plane. Each bar represents a repository's total commits with height corresponding to the count.

#### Best Used For

- Impressive presentations
- 3D portfolio showcases
- Modern visualizations
- Interactive demos
- Depth perception of data

#### Visual Characteristics

```
• Geometry: 3D rectangular prisms (boxes)
• Height: Commit count (Z-axis)
• Position: Repository (X-axis)
• Depth: Visual thickness
• Lighting: Ambient + directional lights
• Camera: Perspective view
• Grid: 3D floor grid for reference
```

#### Technical Details

- **Rendering Engine:** Three.js WebGL renderer
- **Materials:** MeshStandardMaterial with metalness
- **Lighting:** Ambient (0.5) + 2 Directional lights (0.8, 0.4)
- **Camera:** PerspectiveCamera at 75° FOV
- **Resolution:** 1920x1080 pixels
- **Format:** PNG with transparency support

#### Features

- ✅ Real 3D geometry
- ✅ Professional lighting
- ✅ Shadow effects
- ✅ Depth perception
- ✅ Metallic materials
- ✅ Camera perspective
- ✅ Floor grid reference

#### Example Command

```bash
timeline -p github -u octocat -t bar3d
timeline quick -p github -u octocat -t bar3d
```

#### When to Use

- You want to impress with 3D visualization
- You're creating modern presentations
- You need depth perception in data
- You want interactive-looking charts

#### Performance Notes

- Rendering time: 2-5 seconds
- Memory usage: Higher than 2D charts
- Best for: Desktop/high-res displays
- File size: Larger than 2D equivalents

---

### 📈 3D Line Chart

**Type:** `line3d`  
**Output:** `charts/timeline-line3d.png`  
**Technology:** Three.js

#### Description

Three-dimensional line paths floating in 3D space. Shows commit trends with added depth dimension for visual impact.

#### Best Used For

- 3D trend visualization
- Multi-dimensional timelines
- Depth-enhanced patterns
- Modern analytics
- Immersive data exploration

#### Visual Characteristics

```
• Lines: 3D tube geometry paths
• Depth: Z-axis for added dimension
• Height: Commit count (Y-axis)
• Timeline: X-axis progression
• Colors: Gradient or solid per repository
• Lighting: Soft ambient with highlights
• Camera: Orbital perspective
```

#### Technical Details

- **Geometry:** TubeGeometry or Line3D
- **Materials:** LineBasicMaterial with thickness
- **Depth Mapping:** Automatic Z-spacing
- **Animation:** Smooth camera transitions
- **Resolution:** 1920x1080 pixels

#### Features

- ✅ Floating 3D paths
- ✅ Depth perception
- ✅ Smooth curves
- ✅ Multiple lines in 3D space
- ✅ Professional lighting
- ✅ Camera angles

#### Example Command

```bash
timeline -p github -u octocat -t line3d
```

#### When to Use

- You want 3D trend visualization
- You're showcasing temporal data in 3D
- You need impressive analytics
- You're creating modern reports

#### Current Status

🚧 **Coming Soon** - Full implementation in progress

---

### 🔮 3D Scatter Chart

**Type:** `scatter3d`  
**Output:** `charts/timeline-scatter3d.png`  
**Technology:** Three.js

#### Description

Points floating in 3D space representing individual commits. Allows pattern detection across three dimensions.

#### Best Used For

- Multi-dimensional pattern detection
- 3D clustering analysis
- Outlier identification in 3D
- Research visualizations
- Advanced analytics

#### Visual Characteristics

```
• Points: 3D spheres at XYZ coordinates
• X-Axis: Time dimension
• Y-Axis: Commit count
• Z-Axis: Repository or additional metric
• Size: Point size variation optional
• Colors: Repository-based or gradient
• Lighting: Soft to show depth
```

#### Technical Details

- **Geometry:** SphereGeometry for points
- **Materials:** MeshPhongMaterial
- **Point Count:** Handles 1000+ points
- **Clustering:** Visual density patterns
- **Camera:** Interactive orbital view

#### Features

- ✅ True 3D point cloud
- ✅ Pattern recognition in 3D
- ✅ Depth-based clustering
- ✅ Interactive perspective
- ✅ Gradient coloring
- ✅ Size variation

#### Example Command

```bash
timeline -p github -u octocat -t scatter3d
```

#### When to Use

- You need 3D pattern analysis
- You're working with complex datasets
- You want to identify 3D clusters
- You're doing research visualization

#### Current Status

🚧 **Coming Soon** - Full implementation in progress

---

### 🌊 3D Surface Chart

**Type:** `surface3d`  
**Output:** `charts/timeline-surface3d.png`  
**Technology:** Three.js

#### Description

Continuous 3D surface showing activity patterns over time and across repositories. Like a 3D heatmap with elevation.

#### Best Used For

- Continuous data visualization
- Activity pattern mapping
- Terrain-like representations
- Complex trend analysis
- Research presentations

#### Visual Characteristics

```
• Surface: 3D mesh with height variation
• X-Axis: Time progression
• Y-Axis: Repository dimension
• Z-Axis: Commit intensity (elevation)
• Colors: Gradient based on height
• Lighting: Multiple sources for depth
• Smoothness: Interpolated surface
```

#### Technical Details

- **Geometry:** PlaneGeometry with vertex displacement
- **Materials:** MeshStandardMaterial with color mapping
- **Vertices:** High-resolution mesh
- **Normals:** Calculated for smooth lighting
- **Wireframe:** Optional wireframe overlay

#### Features

- ✅ Smooth 3D surface
- ✅ Height-based coloring
- ✅ Contour-like visualization
- ✅ Gradient mapping
- ✅ Professional lighting
- ✅ Wireframe option

#### Example Command

```bash
timeline -p github -u octocat -t surface3d
```

#### When to Use

- You need continuous data representation
- You're visualizing activity landscapes
- You want terrain-like charts
- You're doing advanced analysis

#### Current Status

🚧 **Coming Soon** - Full implementation in progress

---

### 💫 3D Bubble Chart

**Type:** `bubble3d`  
**Output:** `charts/timeline-bubble3d.png`  
**Technology:** Three.js

#### Description

Spheres of varying sizes floating in 3D space. Each bubble represents a commit or repository with size, position, and color conveying different data dimensions.

#### Best Used For

- Four-dimensional data
- Complex relationships
- Multi-metric visualization
- Advanced analytics
- Research presentations

#### Visual Characteristics

```
• Bubbles: 3D spheres with varying radii
• X-Axis: Time or metric 1
• Y-Axis: Commits or metric 2
• Z-Axis: Additional dimension
• Size: Fourth dimension (bubble radius)
• Colors: Fifth dimension (optional)
• Lighting: Realistic sphere shading
```

#### Technical Details

- **Geometry:** SphereGeometry with variable radius
- **Materials:** MeshPhongMaterial with specular
- **Transparency:** Optional semi-transparent
- **Shadows:** Real-time shadow casting
- **Interaction:** Potential for rotation

#### Features

- ✅ Four-dimensional data
- ✅ Variable bubble sizes
- ✅ True 3D positioning
- ✅ Realistic shading
- ✅ Depth perception
- ✅ Complex relationships

#### Example Command

```bash
timeline -p github -u octocat -t bubble3d
```

#### When to Use

- You have four related data dimensions
- You need maximum data density
- You're doing research visualization
- You want impressive 3D charts

#### Current Status

🚧 **Coming Soon** - Full implementation in progress

---

## Comparison Table

### 2D vs 3D Charts

| Feature              | 2D Charts         | 3D Charts        |
| -------------------- | ----------------- | ---------------- |
| **Technology**       | Chart.js          | Three.js         |
| **Rendering Speed**  | Fast (< 1s)       | Slower (2-5s)    |
| **File Size**        | Small (50-200KB)  | Larger (200KB-1MB) |
| **Visual Impact**    | Professional      | Impressive       |
| **Best For**         | Reports, docs     | Presentations    |
| **Interactivity**    | Tooltips, hover   | Camera angles    |
| **Browser Support**  | Universal         | Modern browsers  |
| **Print Quality**    | Excellent         | Good             |
| **Accessibility**    | High              | Medium           |

### Chart Type Selection Guide

| Your Need                      | Recommended Chart Type |
| ------------------------------ | ---------------------- |
| **Timeline trends**            | Line (2D or 3D)        |
| **Repository comparison**      | Bar (2D or 3D)         |
| **Contribution percentage**    | Pie or Doughnut        |
| **Daily activity patterns**    | Heatmap                |
| **Multi-metric comparison**    | Radar                  |
| **Pattern detection**          | Scatter (2D or 3D)     |
| **Complex relationships**      | Bubble (2D or 3D)      |
| **Professional reports**       | Mixed or Bar           |
| **Impressive presentations**   | 3D Bar or Surface      |
| **Research visualization**     | 3D Scatter or Bubble   |

---

## Usage Examples

### Basic Chart Generation

```bash
# 2D Line chart (default)
timeline -p github -u octocat

# 3D Bar chart
timeline -p github -u octocat -t bar3d

# Heatmap for daily patterns
timeline -p github -u octocat -t heatmap

# Pie chart for contribution breakdown
timeline -p github -u octocat -t pie
```

### With Customization

```bash
# Custom colors for bar chart
timeline -p github -u octocat -t bar \
  --colors "#FF6B6B,#4ECDC4,#45B7D1"

# Gradient line chart
timeline -p github -u octocat -t line \
  --gradient --gradient-start "#667eea" --gradient-end "#764ba2"

# Heatmap with custom gradient
timeline -p github -u octocat -t heatmap \
  --gradient-start "#9be9a8" --gradient-end "#216e39"

# 3D bar with custom styling
timeline -p github -u octocat -t bar3d \
  --colors "#FF5733,#33FF57,#3357FF"
```

### Quick Mode

```bash
# Quick 2D generation
timeline quick -p github -u octocat -t line

# Quick 3D generation
timeline quick -p github -u octocat -t bar3d

# Multiple charts in sequence
for type in line bar pie bar3d; do
  timeline quick -p github -u octocat -t $type
done
```

### Advanced Options

```bash
# Professional report (clean, no grid)
timeline -p github -u octocat -t bar \
  --no-grid --no-animate --border-width 0

# Presentation mode (large labels)
timeline -p github -u octocat -t pie \
  --label-size 16 --legend-position top

# Research visualization (scatter with details)
timeline -p github -u octocat -t scatter \
  --verbose --label-size 10 --border-width 1
```

---

## Performance Tips

### 2D Charts

1. **Use gradients sparingly** - Can slow down rendering
2. **Limit animations** - Use `--no-animate` for faster generation
3. **Reduce data points** - Filter date ranges if possible
4. **Optimize colors** - Use hex codes instead of gradients

### 3D Charts

1. **Be patient** - 3D rendering takes 2-5 seconds
2. **Limit repositories** - Fewer repos = faster rendering
3. **Use modern Node** - Node.js 18+ recommended
4. **Adequate memory** - 3D charts use more RAM
5. **Consider alternatives** - Use 2D for simple needs

---

## Troubleshooting

### Chart Not Generating

```bash
# Check canvas installation
npm list canvas

# Rebuild canvas
npm rebuild canvas

# Verify Node version (18+ required)
node --version
```

### 3D Charts Failing

```bash
# Install Three.js
npm install three

# Check for errors
timeline -p github -u octocat -t bar3d --verbose
```

### Quality Issues

```bash
# Use high-quality colors
timeline -p github -u octocat -t bar \
  --colors "#FF6B6B,#4ECDC4,#45B7D1,#FFA07A"

# Increase label size
timeline -p github -u octocat -t line --label-size 14

# Add border for clarity
timeline -p github -u octocat -t pie --border-width 2
```

---

## Best Practices

### For Reports

- Use **bar** or **line** charts
- Enable **labels** and **legend**
- Use **professional color schemes**
- Disable **animations** for faster generation
- Use **high contrast colors**

### For Presentations

- Use **3D charts** for visual impact
- Enable **gradients** for modern look
- Use **large labels** (14-16px)
- Position **legend** strategically
- Use **border** for clarity

### For Analysis

- Use **scatter** or **bubble** for patterns
- Use **heatmap** for daily patterns
- Use **radar** for multi-metric comparison
- Enable **tooltips** for details
- Use **verbose mode** for insights

---

## Contributing

Want to add a new chart type? Check out:

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [src/charts/2d/](../src/charts/2d/) - 2D chart implementation
- [src/charts/3d/](../src/charts/3d/) - 3D chart implementation

---

**Made with ❤️ using Chart.js and Three.js**
