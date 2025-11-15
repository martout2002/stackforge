# Bun as Default Package Manager (Project-Only)

This project is configured to use **Bun** instead of npm/yarn/pnpm - **only within this project directory**.

## What's Configured

### 1. `bunfig.toml` (Project-level)
- Configured to use bun for all package installations in this project
- Prefers bun over node for running scripts
- Uses `bun.lockb` as the lockfile

### 2. `package.json`
- Set `packageManager` field to specify bun
- Updated engines to require bun >= 1.0.0
- This hints to IDEs and tools to use bun for this project

### 3. `.bunrc` (Project-level)
- Runtime configuration for bun in this project only

## ✅ This Only Affects This Project

The configuration files (`bunfig.toml`, `.bunrc`) are in your project directory, so they **only apply when you're working in this project**. Your other projects will continue to use npm/yarn/pnpm as normal.

## Usage (In This Project)

```bash
# Install dependencies
bun install

# Run dev server
bun dev

# Run any script
bun run build
bun run lint
bun run format

# Add packages
bun add <package>
bun add -d <package>  # dev dependency

# Remove packages
bun remove <package>

# Update packages
bun update
```

## You Can Still Use npm

If you prefer, you can still use `npm` commands in this project:
```bash
npm install  # works, but slower
npm run dev  # works
```

However, bun is recommended for this project because it's much faster.

## Why Bun for This Project?

- **Faster**: 10-100x faster than npm for most operations
- **Compatible**: Drop-in replacement for npm/yarn/pnpm
- **Built-in**: Includes bundler, test runner, and more
- **Modern**: Written in Zig, optimized for performance

## Lockfile

This project uses `bun.lockb` (binary lockfile). If you see `package-lock.json` or `yarn.lock`, you can safely delete them:

```bash
rm -f package-lock.json yarn.lock pnpm-lock.yaml
```

## How It Works

When you run `bun install` or `bun dev` in this project:
1. Bun reads `bunfig.toml` and `package.json`
2. It uses the settings defined there
3. **Other projects on your system are unaffected**

When you `cd` to a different project without these config files, npm/yarn/pnpm work normally.

## CI/CD

For GitHub Actions or other CI systems, use:

```yaml
- uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest
- run: bun install
- run: bun run build
```
