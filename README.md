# Codex Account Switcher

React + Tauri desktop app (macOS-first) for managing multiple Codex accounts, showing 5h / 1week usage, and one-click switching.

## Local development

```bash
npm install
npm run tauri dev
```

## What is already configured

- GitHub Release pipeline (macOS Intel + macOS Apple Silicon + Windows):
  - [`.github/workflows/release.yml`](.github/workflows/release.yml)
- Tauri updater artifacts generation (`latest.json`, `.sig`, installer bundles):
  - [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json)
- In-app update check + install + relaunch:
  - [`src/App.tsx`](src/App.tsx)

## Deploy to GitHub (first time)

1. Create a new GitHub repo.
2. Initialize/push this project:

```bash
git init
git add .
git commit -m "init: codex account switcher"
git branch -M main
git remote add origin https://github.com/Mrz-sakura/codex-tools.git
git push -u origin main
```

## Configure auto-updater (required)

### 1) Generate updater signing key

```bash
npm run tauri signer generate -- -w ~/.tauri/codex-account-switcher.key
```

Save:
- private key file content (for GitHub Secret)
- private key password
- printed public key

### 2) Set updater config

Edit [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json):

- Set `"plugins.updater.active": true`
- Replace `pubkey` with your generated public key.
- Replace endpoint:

```json
"https://github.com/Mrz-sakura/codex-tools/releases/latest/download/latest.json"
```

with your real repo URL.

### 3) Set GitHub Secrets

In `GitHub repo -> Settings -> Secrets and variables -> Actions`:

- `TAURI_SIGNING_PRIVATE_KEY` = private key file content
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` = key password

Optional (recommended for production trust):
- Apple code-sign + notarization secrets (for cleaner macOS install experience)
- Windows code-sign certificate secrets (for SmartScreen reputation)

## Build and publish downloadable packages

### Option A: Tag push (recommended)

1. Bump app version in [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json).
2. Commit and push.
3. Create and push tag:

```bash
git tag v0.1.1
git push origin v0.1.1
```

The workflow builds and publishes release assets to GitHub Releases.

### Option B: Manual dispatch

- Open Actions -> `Release Tauri App` -> `Run workflow`
- Input `release_tag` (example: `v0.1.1`)

## How update detection works in app

- App checks for updates at startup (and you can click `检查更新`).
- It reads the latest metadata from your GitHub Release `latest.json` endpoint.
- If newer version exists, app can download/install and relaunch automatically.

## Notes

- `latest.json` and `.sig` are generated only when updater artifacts are enabled and signing key secrets are set.
- For updater correctness, release version and app version should stay consistent.
