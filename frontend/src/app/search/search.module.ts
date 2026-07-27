import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SearchComponent } from './search.component'
import { SearchResultsComponent } from './search-results.component'

@NgModule({
  declarations: [SearchComponent, SearchResultsComponent],
  imports: [CommonModule, FormsModule],
  exports: [SearchComponent, SearchResultsComponent]
})
export class SearchModule {}
