import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import { QueueService } from '../services/queue.service'
import { Track } from '../services/api.service'

@Component({
  selector: 'app-player',
  template: `
    <div class="deck-head">
      <div>
        <div class="card-title">Now playing</div>
        <div class="deck-subtitle">
          {{ queue.current ? 'Live playback stream' : 'Pick a track and start the deck' }}
        </div>
      </div>
      <div class="deck-badges">
        <span>{{ queue.history.length }} played</span>
        <span>{{ queue.items.length }} queued</span>
      </div>
    </div>

    <div class="now-playing-shell">
      <div class="now-cover" [class.filled]="!!queue.current?.thumbnail">
        <img *ngIf="queue.current?.thumbnail" [src]="queue.current?.thumbnail || ''" alt="" />
        <div *ngIf="!queue.current?.thumbnail" class="now-cover-fallback">A</div>
      </div>
      <div class="now-copy">
        <div class="signal-line">Studio deck</div>
        <div class="now-playing">{{ queue.current?.title || 'Not playing' }}</div>
        <div class="now-subtitle">
          {{ queue.loading ? 'Loading stream' : queue.current ? (queue.isPlaying ? 'Playing now' : 'Ready to play') : 'Search and pick a track' }}
        </div>

        <div class="deck-visualizer" aria-hidden="true">
          <span *ngFor="let level of visualizerLevels" [style.height.%]="level"></span>
        </div>

        <div class="progress-line" *ngIf="queue.current">
          <div class="progress-track">
            <span class="progress-fill" [style.width.%]="queue.progressPercent"></span>
          </div>
          <div class="progress-meta">
            <span>{{ formatDuration(queue.currentTime) }}</span>
            <span>{{ formatDuration(queue.totalTime || queue.current?.duration) }}</span>
          </div>
        </div>

        <div class="now-stats">
          <div class="mini-stat">
            <span>State</span>
            <strong>{{ queue.loading ? 'Buffering' : queue.current ? (queue.isPlaying ? 'Playing' : 'Paused') : 'Idle' }}</strong>
          </div>
          <div class="mini-stat">
            <span>Length</span>
            <strong>{{ formatDuration(queue.current?.duration) }}</strong>
          </div>
          <div class="mini-stat">
            <span>Up next</span>
            <strong>{{ queue.items.length }}</strong>
          </div>
        </div>
      </div>
    </div>

    <audio #audio controls [src]="queue.streamUrl" (ended)="onEnd()"></audio>

    <div class="player-actions">
      <button type="button" class="primary" (click)="previous()">Previous</button>
      <button type="button" class="primary" (click)="toggle()">Play / Pause</button>
      <button type="button" class="primary" (click)="next()">Next</button>
      <button type="button" (click)="clear()">Clear</button>
    </div>
    <div class="status" *ngIf="queue.loading">Loading audio...</div>
    <div class="status error" *ngIf="queue.error">{{ queue.error }}</div>

    <div class="history-strip" *ngIf="queue.history.length">
      <div class="queue-title">Recently played</div>
      <div class="history-list">
        <button type="button" *ngFor="let item of recentHistory" (click)="replay(item)">{{ item.title }}</button>
      </div>
    </div>

    <div class="queue-title">Queue</div>

    <div class="results-empty compact" *ngIf="!queue.items.length">
      <div class="empty-text">Add tracks from search results to start a queue.</div>
    </div>

    <div *ngFor="let it of queue.items; let i = index" class="queue-item">
      <div class="queue-index">{{ i + 1 }}</div>
      <div class="queue-body">
        <div class="queue-title-text">{{ it.title }}</div>
        <div class="queue-meta">{{ formatDuration(it.duration) }}</div>
      </div>
      <div class="queue-actions">
        <button type="button" (click)="play(i)">Play</button>
        <button type="button" (click)="remove(i)">Drop</button>
      </div>
    </div>
  `
})
export class PlayerComponent implements AfterViewInit {
  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>
  visualizerLevels = [34, 58, 28, 70, 42, 82, 37, 65, 24, 56, 76, 31, 61, 43]

  constructor(public queue: QueueService) {}

  ngAfterViewInit() {
    this.queue.attachAudio(this.audioRef.nativeElement)
  }

  play(index = 0) {
    this.queue.playIndex(index)
  }

  previous() {
    this.queue.previous()
  }

  next() {
    this.queue.next()
  }

  clear() {
    this.queue.clear()
  }

  toggle() {
    this.queue.toggle()
  }

  onEnd() {
    this.next()
  }

  get recentHistory() {
    return this.queue.history.slice(0, 5)
  }

  replay(item: Track) {
    this.queue.replay(item)
  }

  remove(index: number) {
    this.queue.removeAt(index)
  }

  formatDuration(duration?: number | null) {
    if (!duration) {
      return 'Unknown'
    }

    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}
