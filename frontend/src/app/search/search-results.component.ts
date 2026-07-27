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
        <div class="results-count">{{ api.lastResults.length }} tracks found</div>
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

    <div *ngFor="let it of api.lastResults" class="result-item">
      <img [src]="it.thumbnail || ''" class="thumb" alt="" />
      <div class="item-body">
        <div class="item-top">
          <div class="title">{{ it.title }}</div>
          <div class="duration" *ngIf="it.duration">{{ it.duration | number:'1.0-0' }} s</div>
        </div>
        <div class="item-meta">
          <span *ngIf="it.webpage_url || it.url">Playable track</span>
          <span *ngIf="!it.duration">Duration unavailable</span>
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
}
