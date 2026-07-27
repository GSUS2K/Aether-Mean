import { Component } from '@angular/core'
import { ApiService } from '../services/api.service'
import { finalize } from 'rxjs/operators'

@Component({
  selector: 'app-search',
  template: `
    <input type="text" [(ngModel)]="q" placeholder="Search music" (keydown.enter)="doSearch()" />
    <button (click)="doSearch()">Search</button>
  `
})
export class SearchComponent {
  q = ''
  searching = false

  constructor(private api: ApiService) {}

  doSearch() {
    const query = this.q.trim()
    if (!query || this.searching) {
      return
    }

    this.searching = true
    this.api.search(query).pipe(
      finalize(() => {
        this.searching = false
      })
    ).subscribe({
      next: (results) => {
        this.api.lastResults = results || []
      },
      error: () => {
        this.api.lastResults = []
      }
    })
  }
}
