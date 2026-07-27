import { Component } from '@angular/core'
import { ApiService } from '../services/api.service'
import { finalize } from 'rxjs/operators'

@Component({
  selector: 'app-search',
  template: `
    <div class="search-panel">
      <div class="search-field">
        <input
          type="text"
          [(ngModel)]="q"
          placeholder="Search songs, artists, or paste a link"
          (keydown.enter)="doSearch()"
        />
        <button type="button" class="search-button" [disabled]="searching || !q.trim()" (click)="doSearch()">
          {{ searching ? 'Searching...' : 'Search' }}
        </button>
      </div>
      <div class="status-line">
        <span *ngIf="api.searching">Looking up "{{ api.lastQuery }}"</span>
        <span class="error" *ngIf="api.error">{{ api.error }}</span>
      </div>
    </div>
  `
})
export class SearchComponent {
  q = ''
  searching = false

  constructor(public api: ApiService) {}

  doSearch() {
    const query = this.q.trim()
    if (!query || this.searching) {
      return
    }

    this.searching = true
    this.api.searching = true
    this.api.error = ''
    this.api.lastQuery = query
    this.api.search(query).pipe(
      finalize(() => {
        this.searching = false
        this.api.searching = false
      })
    ).subscribe({
      next: (results) => {
        this.api.lastResults = results || []
      },
      error: (err) => {
        this.api.lastResults = []
        this.api.error = err instanceof Error ? err.message : String(err)
      }
    })
  }
}
