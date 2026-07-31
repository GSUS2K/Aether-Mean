import { Component } from '@angular/core'
import { ApiService, Track } from '../services/api.service'
import { QueueService } from '../services/queue.service'
import { LibraryService } from '../services/library.service'

@Component({
  selector: 'search-results',
  template: `
    <div class="results-head">
      <div>
        <div class="eyebrow">Search results</div>
        <div class="results-count">
          {{ api.lastResults.length }} tracks found
          <span *ngIf="api.lastQuery">for "{{ api.lastQuery }}"</span>
        </div>
      </div>
      <button type="button" (click)="clear()">Clear</button>
    </div>

    <div class="results-empty" *ngIf="api.searching">
      <div class="empty-title">Searching</div>
      <div class="empty-text">Hang on while Aether Mean checks for playable results.</div>
    </div>

    <div class="results-empty" *ngIf="!api.searching && !api.lastResults.length && !api.error">
      <div class="empty-title">Nothing here yet</div>
      <div class="empty-text">Search for a track to load results.</div>
    </div>

    <div class="results-empty error" *ngIf="!api.searching && api.error && !api.lastResults.length">
      <div class="empty-title">Search failed</div>
      <div class="empty-text">{{ api.error }}</div>
    </div>

    <div class="featured-result" *ngIf="featured">
      <img [src]="featured.thumbnail || ''" class="featured-art" alt="" />
      <div class="featured-copy">
        <div class="eyebrow">Lead pick</div>
        <div class="featured-title">{{ featured.title }}</div>
        <div class="featured-meta">
          <span>{{ formatDuration(featured.duration) }}</span>
          <span>{{ featured.webpage_url || featured.url ? 'Ready to play' : 'Needs source' }}</span>
        </div>
        <div class="controls">
          <button type="button" class="primary" (click)="play(featured)">Play now</button>
          <button type="button" (click)="queue.add(featured)">Queue</button>
          <button type="button" (click)="save(featured)">Save</button>
        </div>
      </div>
    </div>

    <div class="stack-head" *ngIf="secondaryResults.length">
      <div class="stack-title">More in the stack</div>
      <div class="stack-caption">Quick picks for queueing, saving, or instant play.</div>
    </div>

    <div *ngFor="let it of secondaryResults" class="result-item">
      <img [src]="it.thumbnail || ''" class="thumb" alt="" />
      <div class="item-body">
        <div class="item-top">
          <div class="title">{{ it.title }}</div>
          <div class="duration">{{ formatDuration(it.duration) }}</div>
        </div>
        <div class="item-meta">
          <span *ngIf="it.webpage_url || it.url">Playable track</span>
          <span *ngIf="!it.webpage_url && !it.url">No direct source</span>
        </div>
        <div class="controls">
          <button type="button" class="primary" (click)="play(it)">Play</button>
          <button type="button" (click)="queue.add(it)">Queue</button>
          <button type="button" (click)="save(it)">Save</button>
        </div>
      </div>
    </div>
  `
})
export class SearchResultsComponent {
  constructor(public api: ApiService, public queue: QueueService, private library: LibraryService) {}

  get featured() {
    return this.api.lastResults[0] || null
  }

  get secondaryResults() {
    return this.api.lastResults.slice(1)
  }

  play(item: Track) {
    void this.queue.playItem(item)
  }

  save(item: Track) {
    this.library.add(item).subscribe()
  }

  clear() {
    this.api.lastResults = []
    this.api.error = ''
  }

  formatDuration(duration?: number | null) {
    if (!duration) {
      return 'Unknown length'
    }

    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}
