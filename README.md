# Aether Mean

Aether Mean is a lightweight desktop music app for playing audio from online search results, keeping a queue, and saving tracks to a local library.

## What it does

- Search for music
- Play audio inside the app
- Queue tracks and move through them
- Save songs to your local library
- Switch between light and dark appearance
- Use keyboard shortcuts for playback

## Download

The easiest way to install Aether Mean is from the GitHub Releases page.

Each release includes builds for:

- Windows
- macOS on Intel and Apple Silicon
- Linux

## System requirements

- Windows 10 or newer
- macOS 12 or newer
- A modern Linux desktop with AppImage or `.deb` support
- An internet connection for search and playback
- The app downloads its helper binary automatically the first time you run it

## First run

1. Download the release for your platform.
2. Install or open the app.
3. Search for a track.
4. Pick a result and press play.
5. Save anything you want to keep in the library.

## How it works

Aether Mean uses Angular for the interface and Tauri with Rust for the desktop layer. Search and stream lookups are handled in the app, and the helper binary is downloaded automatically if it is missing.

## Support

If something breaks, check the latest release notes first. They list build changes, fixes, and packaging updates for each version.
