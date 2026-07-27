import { Component, OnDestroy, OnInit } from '@angular/core'
import { LibraryService } from '../services/library.service'
import { QueueService } from '../services/queue.service'
import { Track } from '../services/api.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-library',
  template: `
    <div class="library-head">
      <div>
        <div class="card-title">Saved library</div>
        <div class="results-count">{{ saved.length }} tracks stored</div>
      </div>
      <button type="button" (click)="reload()">Refresh</button>
    </div>
    <div class="results-empty compact" *ngIf="!saved.length">
      <div class="empty-text">Save tracks you want to keep here.</div>
    </div>
    <div class="library-list" *ngIf="saved.length">
      <div class="library-item" *ngFor="let item of saved">
        <div class="library-title">{{ item.title }}</div>
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
  private sub?: Subscription

  constructor(private library: LibraryService, private queue: QueueService) {}

  ngOnInit() {
    this.reload()
    this.sub = this.library.changes$.subscribe(() => {
      this.saved = this.library.saved
    })
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
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
}
