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
      <header class="hero">
        <div class="hero-copy">
          <div class="eyebrow">Aether Mean</div>
          <h1>Lightweight music control for desktop</h1>
          <p>Search tracks, queue them fast, and keep your local favorites in one place.</p>
        </div>
        <div class="hero-actions">
          <button type="button" (click)="toggleTheme()">Theme</button>
          <button type="button" (click)="playRandom()">Random</button>
          <button type="button" (click)="openSaved()">Saved {{ savedCount }}</button>
        </div>
      </header>

      <section class="search-row">
        <app-search></app-search>
      </section>

      <section class="results">
        <div class="left panel">
          <search-results></search-results>
        </div>
        <div class="right">
          <div class="panel">
            <app-player></app-player>
          </div>
          <div class="panel">
            <app-library></app-library>
          </div>
        </div>
      </section>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  savedCount = 0
  private savedSub?: Subscription

  constructor(
    private theme: ThemeService,
    private queue: QueueService,
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
