import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { AppComponent } from './app.component'
import { SearchComponent } from './search/search.component'
import { SearchResultsComponent } from './search/search-results.component'
import { PlayerComponent } from './player/player.component'
import { LibraryComponent } from './library/library.component'

@NgModule({
  declarations: [AppComponent, SearchComponent, SearchResultsComponent, PlayerComponent, LibraryComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
