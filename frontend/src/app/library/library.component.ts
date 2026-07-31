import { Component, OnDestroy, OnInit } from '@angular/core'
import { ApiService, Track } from '../services/api.service'
import { LibraryService } from '../services/library.service'
import { Playlist, PlaylistService } from '../services/playlist.service'
import { QueueService } from '../services/queue.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-library',
  template: `
    <div class="library-head">
      <div>
        <div class="card-title">Saved library</div>
        <div class="results-count">{{ filteredSaved.length }} tracks shown</div>
      </div>
      <button type="button" (click)="reload()">Refresh</button>
    </div>

    <div class="playlist-builder panel-lite">
      <input
        type="text"
        class="library-search"
        [(ngModel)]="playlistName"
        placeholder="Name a playlist"
      />
      <div class="controls">
        <button type="button" class="primary" (click)="saveQueuePlaylist()" [disabled]="!playlistName.trim() || !queue.items.length">
          Save queue
        </button>
        <button type="button" (click)="saveSavedPlaylist()" [disabled]="!playlistName.trim() || !saved.length">
          Save saved
        </button>
      </div>
    </div>

    <div class="playlist-head">
      <div>
        <div class="section-kicker">Playlists</div>
        <div class="results-count">{{ playlists.length }} local stacks</div>
      </div>
    </div>

    <div class="results-empty compact" *ngIf="!playlists.length">
      <div class="empty-text">Save your current queue or library into reusable playlists.</div>
    </div>

    <div class="playlist-grid" *ngIf="playlists.length">
      <div class="playlist-card" *ngFor="let playlist of playlists" [attr.data-accent]="playlist.accent">
        <div class="playlist-name">{{ playlist.name }}</div>
        <div class="queue-meta">{{ playlist.tracks.length }} tracks</div>
        <div class="controls">
          <button type="button" class="primary" (click)="playPlaylist(playlist)">Play</button>
          <button type="button" (click)="queuePlaylist(playlist)">Queue</button>
          <button type="button" (click)="removePlaylist(playlist.id)">Delete</button>
        </div>
      </div>
    </div>

    <div class="playlist-head">
      <div>
        <div class="section-kicker">Party starters</div>
        <div class="results-count">One-click scenes for different moods</div>
      </div>
    </div>

    <div class="party-grid">
      <button type="button" class="party-card" *ngFor="let preset of partyPresets" (click)="launchParty(preset.query)">
        <span class="party-name">{{ preset.name }}</span>
        <span class="party-copy">{{ preset.copy }}</span>
      </button>
    </div>

    <input
      *ngIf="saved.length"
      type="text"
      class="library-search"
      [(ngModel)]="filter"
      placeholder="Filter saved tracks"
    />

    <div class="library-summary" *ngIf="saved.length">
      <div class="library-pill">
        <span>Latest save</span>
        <strong>{{ saved[0].title }}</strong>
      </div>

      <div class="library-mosaic">
        <img *ngFor="let item of previewItems" [src]="item.thumbnail || ''" alt="" />
      </div>
    </div>

    <div class="results-empty compact" *ngIf="!saved.length">
      <div class="empty-text">Save tracks you want to keep here.</div>
    </div>
    <div class="results-empty compact" *ngIf="saved.length && !filteredSaved.length">
      <div class="empty-text">No saved tracks match "{{ filter }}".</div>
    </div>
    <div class="library-list" *ngIf="filteredSaved.length">
      <div class="library-item" *ngFor="let item of filteredSaved">
        <div class="library-row">
          <img *ngIf="item.thumbnail" [src]="item.thumbnail || ''" class="library-thumb" alt="" />
          <div class="library-row-copy">
            <div class="library-title">{{ item.title }}</div>
            <div class="queue-meta">{{ formatDuration(item.duration) }}</div>
          </div>
        </div>
        <div class="controls">
          <button type="button" class="primary" (click)="play(item)">Play</button>
          <button type="button" (click)="remove(item.id)">Remove</button>
        </div>
      </div>
    </div>
  `
})
export class LibraryComponent implements OnInit, OnDestroy {
  saved: Track[] = []
  filter = ''
  playlistName = ''
  playlists: Playlist[] = []
  partyPresets = [
    { name: 'House party', query: 'house party dance hits', copy: 'Bright and fast sing-along energy' },
    { name: 'Chill room', query: 'chill room indie late night', copy: 'Low-key, warm, and easy to leave on' },
    { name: 'Road trip', query: 'road trip feel good pop', copy: 'Bigger hooks and movement' },
    { name: 'Rain mode', query: 'rainy night lofi vocals', copy: 'Soft, moody, and spacious' }
  ]
  private sub?: Subscription
  private playlistSub?: Subscription

  constructor(
    private library: LibraryService,
    public queue: QueueService,
    private playlistsStore: PlaylistService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.reload()
    this.playlists = this.playlistsStore.playlists
    this.sub = this.library.changes$.subscribe(() => {
      this.saved = this.library.saved
    })
    this.playlistSub = this.playlistsStore.changes$.subscribe(() => {
      this.playlists = this.playlistsStore.playlists
    })
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
    this.playlistSub?.unsubscribe()
  }

  reload() {
    this.library.list().subscribe({
      next: (saved) => {
        this.saved = saved
      }
    })
  }

  play(item: Track) {
    void this.queue.playItem(item)
  }

  remove(id: string) {
    this.library.remove(id).subscribe({
      next: (state) => {
        this.saved = state.saved || []
      }
    })
  }

  saveQueuePlaylist() {
    this.playlistsStore.create(this.playlistName, this.queue.items, 'mint')
    this.playlistName = ''
    this.playlists = this.playlistsStore.playlists
  }

  saveSavedPlaylist() {
    this.playlistsStore.create(this.playlistName, this.saved, 'amber')
    this.playlistName = ''
    this.playlists = this.playlistsStore.playlists
  }

  playPlaylist(playlist: Playlist) {
    this.queue.loadQueue(playlist.tracks, true)
  }

  queuePlaylist(playlist: Playlist) {
    playlist.tracks.forEach((track) => this.queue.add(track))
  }

  removePlaylist(id: string) {
    this.playlistsStore.remove(id)
    this.playlists = this.playlistsStore.playlists
  }

  launchParty(query: string) {
    this.api.triggerSearch(query)
  }

  formatDuration(duration?: number | null) {
    if (!duration) {
      return 'Saved track'
    }

    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  get previewItems() {
    return this.saved.filter((item) => !!item.thumbnail).slice(0, 3)
  }

  get filteredSaved() {
    const query = this.filter.trim().toLowerCase()
    if (!query) {
      return this.saved
    }

    return this.saved.filter((item) => item.title.toLowerCase().includes(query))
  }
}
