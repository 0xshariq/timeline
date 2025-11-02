# Troubleshooting Guide

## Canvas Error: "Cannot find module '../build/Release/canvas.node'"

This error occurs when canvas needs to be rebuilt for your system. **The CLI automatically rebuilds canvas on every run**, so this should be rare. If you still see this error, it means system dependencies are missing.

### Automatic Rebuild (Built-in)

The timeline tool automatically rebuilds canvas on every execution. You'll see:
```
✔ Canvas ready
```

This happens in the background and ensures canvas works correctly for both local and global installations.

### Manual Solution (If Auto-rebuild Fails)

If the automatic rebuild fails, you likely need to install system dependencies first:

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

After installing dependencies, the automatic rebuild should work on next run.

**For pnpm (global installation):**
```bash
# Navigate to canvas directory and rebuild
cd ~/.local/share/pnpm/global/5/node_modules/canvas
pnpm rebuild

# Or reinstall the package
pnpm remove -g @0xshariq/timeline
pnpm add -g @0xshariq/timeline
```

**For npm (global installation):**
```bash
# Rebuild canvas globally
npm rebuild canvas

# Or reinstall
npm uninstall -g @0xshariq/timeline
npm install -g @0xshariq/timeline
```

**For yarn (global installation):**
```bash
# Rebuild canvas
yarn rebuild canvas

# Or reinstall
yarn global remove @0xshariq/timeline
yarn global add @0xshariq/timeline
```

**For local installation:**
```bash
cd /path/to/repo-timeline
npm rebuild canvas
# or
pnpm rebuild canvas
```

After rebuilding, verify it works:
```bash
timeline --version
```

### Solution 2: Reinstall the Package

```bash
# Uninstall
npm uninstall -g @0xshariq/timeline

# Reinstall
npm install -g @0xshariq/timeline
```

### Solution 3: Install System Dependencies

Canvas requires native dependencies. Install them first:

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

Then rebuild canvas:
```bash
npm rebuild canvas -g
```

## Rate Limit Errors (403)

### Error: "403: rate limit exceeded"

This means you're hitting API rate limits.

### Solution: Set Authentication Token

**For GitHub:**
1. Get token: https://github.com/settings/tokens
2. Create new token with `public_repo` scope
3. Set it:
   ```bash
   export GITHUB_TOKEN=ghp_your_token_here
   ```
4. Make it permanent:
   ```bash
   echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc
   source ~/.bashrc
   ```

**For GitLab:**
```bash
export GITLAB_TOKEN=your_token_here
```

**For Bitbucket:**
```bash
export BITBUCKET_APP_PASSWORD=your_app_password
```

## Interactive Prompts Not Working

If you're seeing garbled output or prompts aren't working:

### Solution: Check Terminal Support

```bash
# Check if your terminal supports TTY
tty

# If it returns "not a tty", use non-interactive mode:
timeline quick -p github -u username -t line
```

## Chart Generation Fails

### Error: "No data to generate chart"

This usually means:
1. All repositories are empty
2. Rate limit exceeded
3. User not found

### Solution:

1. Verify username exists on the platform
2. Check authentication token
3. Try with specific repositories:
   ```bash
   timeline -p github -u username -r "repo1,repo2"
   ```

## Permission Errors

### Error: "EACCES: permission denied"

### Solution 1: Fix npm Permissions

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Solution 2: Use sudo (Not Recommended)

```bash
sudo npm install -g @0xshariq/timeline
```

## Still Having Issues?

1. **Check Node version**: `node --version` (requires >= 18.0.0)
2. **Clear npm cache**: `npm cache clean --force`
3. **Check logs**: Look for error details in terminal output
4. **Open an issue**: https://github.com/0xshariq/timeline/issues

Include:
- Error message (full output)
- Node version
- OS and version
- Package manager (npm/pnpm/yarn)
- Installation method
