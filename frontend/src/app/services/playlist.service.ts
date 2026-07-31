import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { Track } from './api.service'

export interface Playlist {
  id: string
  name: string
  tracks: Track[]
  accent: string
}

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  playlists: Playlist[] = []
  private readonly storageKey = 'aether-mean-playlists'
  private readonly changes = new Subject<void>()
  changes$ = this.changes.asObservable()

  constructor() {
    this.load()
  }

  create(name: string, tracks: Track[], accent = 'mint') {
    const trimmed = name.trim()
    if (!trimmed || !tracks.length) {
      return
    }

    this.playlists.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      tracks: tracks.map((track) => ({ ...track })),
      accent
    })
    this.persist()
  }

  remove(id: string) {
    this.playlists = this.playlists.filter((playlist) => playlist.id !== id)
    this.persist()
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.storageKey)
      this.playlists = raw ? JSON.parse(raw) : []
    } catch {
      this.playlists = []
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.playlists))
    this.changes.next()
  }
}
