# Aether-Mean

Aether-Mean is a small music app built with Angular, Tauri, and `yt-dlp`.

It is the lighter version of the larger Aether idea. The goal is to keep the app simple, fast, and easy to understand.

## Overview

The app does four basic things well:

- search for music
- play audio
- keep a queue
- save tracks locally

It does not try to be a video app, a full media studio, or a huge platform. The focus is music only.

The project is split into two parts:

- Angular for the interface
- Tauri for the desktop shell and command bridge

Rust commands use `yt-dlp` to search music and resolve playable stream URLs.

## Docs

The docs live outside the repo on `Z:\Aether-Mean-docs\docs`.

- [Project overview](Z:/Aether-Mean-docs/docs/PROJECT_OVERVIEW.md)
- [How to change the code later](Z:/Aether-Mean-docs/docs/EDITING_GUIDE.md)
- [Setup and release guide](Z:/Aether-Mean-docs/docs/SETUP_AND_RELEASE.md)

## Features

- search music with `yt-dlp`
- play audio in the app
- queue songs
- skip forward and backward
- pause and resume playback
- save tracks to a local library
- switch between light and dark theme
- use keyboard shortcuts for playback
- play a random track from the current search results
- run as a desktop app through Tauri

## Requirements

You will need these tools installed:

- Node.js 16 or newer
- npm
- `yt-dlp`
- Rust and the Tauri toolchain if you want the desktop app

## Run from source

### 1. Install the project packages

From the project root:

```bash
cd Aether-Mean
npm install
```

### 2. Start the desktop app in development

```bash
npm run desktop:dev
```

Tauri starts the Angular dev server on `http://127.0.0.1:4200` and opens the desktop window.

### 3. Build the frontend for release

```bash
cd Aether-Mean/frontend
npm run build
```

That creates the minified frontend files in `frontend-dist/`.

## Desktop app

The `src-tauri` folder contains the desktop shell.

For development, run the Tauri app from the root:

```bash
cd Aether-Mean
npm run desktop:dev
```

The shell launches the Angular app and calls Rust commands directly for search, playback, and the local library.

## How the app works

The flow is simple:

1. You search for a track.
2. Angular asks Tauri to search with `yt-dlp`.
3. Tauri returns the results.
4. You press play.
5. Tauri resolves a playable stream URL.
6. The audio element in Angular plays the stream.
7. If you save a track, the app stores it in the local app data folder.

## Project layout

- `frontend/` - Angular app
- `src-tauri/` - Tauri desktop shell
- `data/` - old local data folder, now ignored
- docs are kept on `Z:\Aether-Mean-docs\docs`

## Notes

- The app is intentionally small.
- The saved library uses local JSON instead of MongoDB.
- The desktop shell talks directly to Rust commands instead of a local server.
- The code is split up so it is easier to understand and change later.
- The repo does not need the old Express server or the built frontend output.

## If you want to change the app later

Start with the code overview in [Z:\Aether-Mean-docs\docs\PROJECT_OVERVIEW.md](Z:/Aether-Mean-docs/docs/PROJECT_OVERVIEW.md).

If you are new to editing code, read [Z:\Aether-Mean-docs\docs\EDITING_GUIDE.md](Z:/Aether-Mean-docs/docs/EDITING_GUIDE.md) before making changes.

If you want to build or package the app, use [Z:\Aether-Mean-docs\docs\SETUP_AND_RELEASE.md](Z:/Aether-Mean-docs/docs/SETUP_AND_RELEASE.md).
