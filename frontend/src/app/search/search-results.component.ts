import { Component } from '@angular/core'
import { ApiService, Track } from '../services/api.service'
import { QueueService } from '../services/queue.service'
import { LibraryService } from '../services/library.service'

@Component({
  selector: 'search-results',
  template: `
    <div *ngFor="let it of api.lastResults" class="item">
      <img [src]="it.thumbnail || ''" class="thumb" alt="" />
      <div class="item-body">
        <div class="title">{{ it.title }}</div>
        <div class="controls">
          <button (click)="play(it)">Play</button>
          <button (click)="queue.add(it)">Queue</button>
          <button (click)="save(it)">Save</button>
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
}
