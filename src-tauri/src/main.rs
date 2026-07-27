#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Track {
  id: String,
  title: String,
  #[serde(default)]
  duration: Option<u64>,
  #[serde(default)]
  thumbnail: Option<String>,
  #[serde(default)]
  webpage_url: Option<String>,
  #[serde(default)]
  url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct LibraryFile {
  #[serde(default)]
  saved: Vec<Track>,
}

fn run_command(program: &str, args: &[&str]) -> Result<String, String> {
  let output = Command::new(program)
    .args(args)
    .output()
    .map_err(|err| format!("failed to start {program}: {err}"))?;

  if !output.status.success() {
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    if stderr.is_empty() {
      return Err(format!("{program} exited with {}", output.status));
    }
    return Err(stderr);
  }

  Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn parse_track(line: &str) -> Option<Track> {
  let value: serde_json::Value = serde_json::from_str(line).ok()?;
  let id = value
    .get("id")
    .and_then(|v| v.as_str())
    .or_else(|| value.get("webpage_url").and_then(|v| v.as_str()))
    .or_else(|| value.get("url").and_then(|v| v.as_str()))?
    .to_string();

  let title = value
    .get("title")
    .and_then(|v| v.as_str())
    .unwrap_or("Untitled")
    .to_string();

  let duration = value.get("duration").and_then(|v| v.as_u64());
  let thumbnail = value
    .get("thumbnail")
    .and_then(|v| v.as_str())
    .map(|s| s.to_string());
  let webpage_url = value
    .get("webpage_url")
    .and_then(|v| v.as_str())
    .map(|s| s.to_string())
    .or_else(|| value.get("url").and_then(|v| v.as_str()).map(|s| s.to_string()));
  let url = value
    .get("url")
    .and_then(|v| v.as_str())
    .map(|s| s.to_string());

  Some(Track {
    id,
    title,
    duration,
    thumbnail,
    webpage_url,
    url,
  })
}

fn library_path(app: &AppHandle) -> Result<PathBuf, String> {
  app.path_resolver()
    .app_data_dir()
    .map(|dir| dir.join("library.json"))
    .ok_or_else(|| "unable to resolve the app data directory".to_string())
}

fn read_library(path: &Path) -> LibraryFile {
  match fs::read_to_string(path) {
    Ok(contents) => serde_json::from_str(&contents).unwrap_or_default(),
    Err(_) => LibraryFile::default(),
  }
}

fn write_library(path: &Path, library: &LibraryFile) -> Result<(), String> {
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|err| format!("failed to create library folder: {err}"))?;
  }

  let contents = serde_json::to_string_pretty(library)
    .map_err(|err| format!("failed to serialise library: {err}"))?;
  fs::write(path, contents).map_err(|err| format!("failed to write library: {err}"))
}

#[tauri::command]
fn search_tracks(query: String) -> Result<Vec<Track>, String> {
  let query = query.trim();
  if query.is_empty() {
    return Ok(Vec::new());
  }

  let output = run_command(
    "yt-dlp",
    &[
      "--dump-json",
      "--no-warnings",
      &format!("ytsearch5:{query}"),
    ],
  )?;

  let mut tracks = Vec::new();
  for line in output.lines() {
    if let Some(track) = parse_track(line.trim()) {
      tracks.push(track);
    }
  }

  Ok(tracks)
}

#[tauri::command]
fn stream_url(webpage_url: String) -> Result<String, String> {
  let url = webpage_url.trim();
  if url.is_empty() {
    return Err("missing track url".to_string());
  }

  let output = run_command(
    "yt-dlp",
    &["-f", "bestaudio", "-g", "--no-warnings", "--no-playlist", url],
  )?;

  let stream = output
    .lines()
    .map(str::trim)
    .find(|line| !line.is_empty())
    .ok_or_else(|| "yt-dlp did not return a stream url".to_string())?;

  Ok(stream.to_string())
}

#[tauri::command]
fn list_library(app: AppHandle) -> Result<LibraryFile, String> {
  let path = library_path(&app)?;
  Ok(read_library(&path))
}

#[tauri::command]
fn add_library_item(app: AppHandle, item: Track) -> Result<LibraryFile, String> {
  let path = library_path(&app)?;
  let mut library = read_library(&path);
  library.saved.retain(|track| track.id != item.id);
  library.saved.insert(0, item);
  write_library(&path, &library)?;
  Ok(library)
}

#[tauri::command]
fn remove_library_item(app: AppHandle, id: String) -> Result<LibraryFile, String> {
  let path = library_path(&app)?;
  let mut library = read_library(&path);
  library.saved.retain(|track| track.id != id);
  write_library(&path, &library)?;
  Ok(library)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      search_tracks,
      stream_url,
      list_library,
      add_library_item,
      remove_library_item
    ])
    .setup(|app| {
      if let Some(window) = app.get_window("main") {
        window.set_focus().ok();
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
