import { Component, HostListener, OnDestroy, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import { ApiService } from './services/api.service'
import { LibraryService } from './services/library.service'
import { QueueService } from './services/queue.service'
import { ThemeService } from './services/theme.service'

@Component({
  selector: 'app-root',
  template: `
    <div class="app-shell" [class.mode-focus]="viewMode === 'focus'" [class.mode-cinema]="viewMode === 'cinema'" [class.perf-low]="performanceMode === 'low'" [class.perf-high]="performanceMode === 'high'">
      <header class="studio-bar">
        <div class="brand">
          <div class="brand-mark"><span>A</span></div>
          <div>
            <div class="eyebrow">Aether Mean</div>
            <div class="brand-subtitle">Desktop audio desk</div>
          </div>
        </div>

        <div class="studio-status">
          <span class="status-dot"></span>
          <span>{{ queue.current ? 'On air' : 'Standing by' }}</span>
        </div>

        <div class="topbar-actions">
          <button type="button" (click)="toggleTheme()">Theme</button>
          <button type="button" (click)="playRandom()">Shuffle</button>
          <button type="button" (click)="openSaved()">Library <span>{{ savedCount }}</span></button>
        </div>
      </header>

      <section class="control-ribbon panel">
        <div class="control-group">
          <div class="control-label">View mode</div>
          <div class="chip-row">
            <button
              *ngFor="let mode of viewModes"
              type="button"
              class="chip-button"
              [class.active]="viewMode === mode.id"
              (click)="setViewMode(mode.id)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <div class="control-label">Performance</div>
          <div class="chip-row">
            <button
              *ngFor="let mode of performanceModes"
              type="button"
              class="chip-button"
              [class.active]="performanceMode === mode.id"
              (click)="setPerformanceMode(mode.id)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="control-group session-glance">
          <div class="control-label">Session</div>
          <div class="session-copy">
            {{ queue.current ? 'Playback is live in the deck.' : 'Idle and ready for a new search.' }}
          </div>
        </div>
      </section>

      <section class="overview-band">
        <article class="overview-card panel spotlight-card">
          <div class="section-kicker">Live desk</div>
          <div class="overview-title">{{ queue.current?.title || 'Ready for a new session' }}</div>
          <p>
            {{ queue.current ? 'Audio is loaded in the main deck.' : 'Search a track, queue a few picks, and keep the good ones.' }}
          </p>
          <div class="overview-tags">
            <span>{{ queue.loading ? 'Buffering' : queue.current ? 'On air' : 'Idle' }}</span>
            <span>{{ queue.items.length }} queued</span>
            <span>{{ savedCount }} saved</span>
          </div>
        </article>

        <article class="overview-card panel stat-card">
          <div class="section-kicker">Discovery</div>
          <div class="stat-value">{{ api.lastResults.length }}</div>
          <div class="stat-label">results in the current run</div>
        </article>

        <article class="overview-card panel stat-card">
          <div class="section-kicker">Playback flow</div>
          <div class="stat-value">{{ queue.history.length }}</div>
          <div class="stat-label">recent plays in session</div>
        </article>

        <article class="overview-card panel command-card">
          <div class="section-kicker">Quick keys</div>
          <div class="command-list">
            <span>Space</span>
            <span>N</span>
            <span>P</span>
            <span>R</span>
            <span>T</span>
          </div>
        </article>
      </section>

      <main class="studio-grid">
        <section class="deck panel">
          <div class="section-kicker">Playback console</div>
          <app-player></app-player>
        </section>

        <section class="discovery panel">
          <div class="discovery-head">
            <div>
              <div class="section-kicker">Find something</div>
              <h1>Discovery</h1>
            </div>
            <div class="live-count">{{ api.lastResults.length }} found</div>
          </div>
          <app-search></app-search>
          <search-results></search-results>
        </section>

        <aside class="library panel">
          <div class="section-kicker">Your collection</div>
          <app-library></app-library>
        </aside>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  savedCount = 0
  viewMode: 'audio' | 'focus' | 'cinema' = 'audio'
  performanceMode: 'low' | 'medium' | 'high' = 'medium'
  viewModes = [
    { id: 'audio' as const, label: 'Audio' },
    { id: 'focus' as const, label: 'Focus' },
    { id: 'cinema' as const, label: 'Cinema' }
  ]
  performanceModes = [
    { id: 'low' as const, label: 'Low' },
    { id: 'medium' as const, label: 'Medium' },
    { id: 'high' as const, label: 'High' }
  ]
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

  setViewMode(mode: 'audio' | 'focus' | 'cinema') {
    this.viewMode = mode
  }

  setPerformanceMode(mode: 'low' | 'medium' | 'high') {
    this.performanceMode = mode
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
