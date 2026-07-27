import { Injectable } from '@angular/core'
import { from, map, Observable, Subject, tap } from 'rxjs'
import { invoke } from '@tauri-apps/api/tauri'
import { Track } from './api.service'

interface LibraryState {
  saved: Track[]
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  saved: Track[] = []
  private changes = new Subject<void>()
  changes$ = this.changes.asObservable()

  list(): Observable<Track[]> {
    return from(invoke<LibraryState>('list_library')).pipe(
      map((state) => state.saved || []),
      tap((saved) => {
        this.saved = saved
        this.changes.next()
      })
    )
  }

  add(item: Track): Observable<LibraryState> {
    return from(invoke<LibraryState>('add_library_item', { item })).pipe(
      tap((state) => {
        this.saved = state.saved || []
        this.changes.next()
      })
    )
  }

  remove(id: string): Observable<LibraryState> {
    return from(invoke<LibraryState>('remove_library_item', { id })).pipe(
      tap((state) => {
        this.saved = state.saved || []
        this.changes.next()
      })
    )
  }

  refresh() {
    this.changes.next()
  }
}
