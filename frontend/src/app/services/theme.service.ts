import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'aether-mean-theme'

  init(): string {
    const saved = localStorage.getItem(this.key) || 'dark'
    this.apply(saved)
    return saved
  }

  toggle(): string {
    const next = document.body.dataset.theme === 'light' ? 'dark' : 'light'
    this.apply(next)
    localStorage.setItem(this.key, next)
    return next
  }

  apply(theme: string) {
    document.body.dataset.theme = theme
  }
}
