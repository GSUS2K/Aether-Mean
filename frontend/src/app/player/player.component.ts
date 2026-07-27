import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import { QueueService } from '../services/queue.service'

@Component({
  selector: 'app-player',
  template: `
    <div class="now-playing">{{ queue.current?.title || 'Not playing' }}</div>
    <audio #audio controls [src]="queue.streamUrl" (ended)="onEnd()"></audio>
    <div class="player-actions">
      <button (click)="previous()">Previous</button>
      <button (click)="toggle()">Play / Pause</button>
      <button (click)="next()">Next</button>
      <button (click)="clear()">Clear</button>
    </div>
    <div class="status" *ngIf="queue.loading">Loading audio...</div>
    <div class="status error" *ngIf="queue.error">{{ queue.error }}</div>
    <div class="queue-title">Queue</div>
    <div *ngFor="let it of queue.items; let i = index" class="queue-item">
      <span>{{ i + 1 }}. {{ it.title }}</span>
      <button (click)="play(i)">Play</button>
    </div>
  `
})
export class PlayerComponent implements AfterViewInit {
  @ViewChild('audio', { static: true }) audioRef!: ElementRef<HTMLAudioElement>

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
}
