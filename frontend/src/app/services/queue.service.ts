import { Injectable } from '@angular/core'
import { ApiService, Track } from './api.service'

@Injectable({ providedIn: 'root' })
export class QueueService {
  items: Track[] = []
  history: Track[] = []
  current: Track | null = null
  streamUrl = ''
  loading = false
  error = ''
  currentTime = 0
  totalTime = 0
  isPlaying = false
  private audioEl: HTMLAudioElement | null = null
  private playToken = 0

  constructor(private api: ApiService) {}

  attachAudio(element: HTMLAudioElement) {
    this.audioEl = element
    this.audioEl.addEventListener('timeupdate', () => {
      this.currentTime = this.audioEl?.currentTime || 0
    })
    this.audioEl.addEventListener('loadedmetadata', () => {
      this.totalTime = Number.isFinite(this.audioEl?.duration) ? this.audioEl?.duration || 0 : 0
    })
    this.audioEl.addEventListener('play', () => {
      this.isPlaying = true
    })
    this.audioEl.addEventListener('pause', () => {
      this.isPlaying = false
    })
  }

  add(item: Track) {
    this.items.push(item)
  }

  loadQueue(items: Track[], autoplay = true) {
    this.items = items.map((item) => ({ ...item }))
    if (autoplay && this.items.length) {
      void this.playItem(this.items[0])
    }
  }

  clear() {
    this.items = []
    this.history = []
    this.current = null
    this.streamUrl = ''
    this.loading = false
    this.error = ''
    this.currentTime = 0
    this.totalTime = 0
    this.isPlaying = false

    if (this.audioEl) {
      this.audioEl.pause()
      this.audioEl.removeAttribute('src')
      this.audioEl.load()
    }
  }

  toggle() {
    if (!this.audioEl) {
      return
    }

    if (this.audioEl.paused) {
      this.audioEl.play().catch(() => {})
      return
    }

    this.audioEl.pause()
  }

  async playItem(item: Track) {
    const source = item.webpage_url || item.url
    if (!source) {
      this.error = 'This track does not include a playable URL.'
      return
    }

    const token = ++this.playToken

    if (this.current && this.current.id !== item.id) {
      this.history.unshift(this.current)
      this.history = this.history.slice(0, 25)
    }

    this.current = item
    this.loading = true
    this.error = ''
    this.currentTime = 0

    if (this.audioEl) {
      this.audioEl.pause()
    }

    try {
      const url = await this.api.streamUrl(source)
      if (token !== this.playToken) {
        return
      }

      this.streamUrl = url
      if (this.audioEl) {
        this.audioEl.src = url
        this.audioEl.load()
        await this.audioEl.play().catch(() => {})
      }
    } catch (err) {
      if (token === this.playToken) {
        this.error = err instanceof Error ? err.message : String(err)
      }
    } finally {
      if (token === this.playToken) {
        this.loading = false
      }
    }
  }

  playIndex(i: number) {
    const item = this.items[i]
    if (item) {
      void this.playItem(item)
    }
  }

  previous() {
    const previousItem = this.history.shift()
    if (previousItem) {
      void this.playItem(previousItem)
    }
  }

  playRandom(source: Track[]) {
    if (!source || !source.length) {
      return
    }

    const item = source[Math.floor(Math.random() * source.length)]
    void this.playItem(item)
  }

  next() {
    if (this.items.length > 0) {
      this.items.shift()
    }

    if (this.items.length > 0) {
      void this.playItem(this.items[0])
      return
    }

    this.current = null
    this.streamUrl = ''
    this.loading = false
    this.currentTime = 0
    this.totalTime = 0
    this.isPlaying = false

    if (this.audioEl) {
      this.audioEl.pause()
    }
  }

  replay(item: Track) {
    void this.playItem(item)
  }

  removeAt(index: number) {
    this.items.splice(index, 1)
  }

  get progressPercent() {
    if (!this.totalTime) {
      return 0
    }

    return Math.max(0, Math.min(100, (this.currentTime / this.totalTime) * 100))
  }
}
