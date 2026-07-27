import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import { ApiService } from './services/api.service'
import { LibraryService } from './services/library.service'
import { QueueService } from './services/queue.service'
import { ThemeService } from './services/theme.service'

@Component({
  selector: 'app-root',
  template: `
    <div class="app-shell">
      <header class="topbar panel">
        <div class="brand">
          <div class="brand-mark">A</div>
          <div>
            <div class="eyebrow">Aether Mean</div>
            <div class="brand-subtitle">Audio search and playback</div>
          </div>
        </div>

        <div class="topbar-actions">
          <button type="button" (click)="toggleTheme()">Theme</button>
          <button type="button" (click)="playRandom()">Random</button>
          <button type="button" (click)="openSaved()">Saved {{ savedCount }}</button>
        </div>
      </header>

      <section class="hero panel">
        <div class="hero-copy">
          <div class="eyebrow">Studio mode</div>
          <h1>Search, queue, and play without leaving the desktop.</h1>
          <p>
            Built for fast listening. Search the web, queue tracks, and keep a local library of the
            songs you actually want to return to.
          </p>
        </div>

        <div class="hero-meta">
          <div class="metric">
            <div class="metric-value">{{ api.lastResults.length }}</div>
            <div class="metric-label">Results</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{ queue.items.length }}</div>
            <div class="metric-label">Queue</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{ savedCount }}</div>
            <div class="metric-label">Saved</div>
          </div>
        </div>
      </section>

      <section class="search-row panel">
        <app-search></app-search>
      </section>

      <section class="workspace">
        <div class="results panel">
          <search-results></search-results>
        </div>

        <aside class="sidebar">
          <div class="panel">
            <app-player></app-player>
          </div>
          <div class="panel">
            <app-library></app-library>
          </div>
        </aside>
      </section>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  savedCount = 0
  private savedSub?: Subscription

  constructor(
    private theme: ThemeService,
    public queue: QueueService,
    public api: ApiService,
    private library: LibraryService
  ) {}

  ngOnInit() {
    this.theme.init()
    this.refreshSavedCount()
    this.savedSub = this.library.changes$.subscribe(() => {
      this.savedCount = this.library.saved.length
    })
  }

  ngOnDestroy() {
    this.savedSub?.unsubscribe()
  }

  refreshSavedCount() {
    this.library.list().subscribe({
      next: (saved) => {
        this.savedCount = saved.length
      }
    })
  }

  toggleTheme() {
    this.theme.toggle()
  }

  playRandom() {
    this.queue.playRandom(this.api.lastResults)
  }

  openSaved() {
    this.refreshSavedCount()
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return
    }

    if (event.key === ' ') {
      event.preventDefault()
      this.queue.toggle()
    }

    if (event.key.toLowerCase() === 'n') {
      this.queue.next()
    }

    if (event.key.toLowerCase() === 'p') {
      this.queue.previous()
    }

    if (event.key.toLowerCase() === 'r') {
      this.playRandom()
    }

    if (event.key.toLowerCase() === 't') {
      this.toggleTheme()
    }
  }
}
