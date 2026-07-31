import { Injectable } from '@angular/core'
import { from, Observable, Subject } from 'rxjs'
import { invoke } from '@tauri-apps/api/tauri'

export interface Track {
  id: string
  title: string
  duration?: number | null
  thumbnail?: string | null
  webpage_url?: string | null
  url?: string | null
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  public lastResults: Track[] = []
  public searching = false
  public error = ''
  public lastQuery = ''
  private launchQuery = new Subject<string>()
  launchQuery$ = this.launchQuery.asObservable()

  search(query: string): Observable<Track[]> {
    return from(invoke<Track[]>('search_tracks', { query }))
  }

  streamUrl(webpageUrl: string): Promise<string> {
    return invoke<string>('stream_url', { webpageUrl })
  }

  triggerSearch(query: string) {
    const trimmed = query.trim()
    if (!trimmed) {
      return
    }

    this.launchQuery.next(trimmed)
  }
}
