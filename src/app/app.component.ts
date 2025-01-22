import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeadComponent} from './components/head/head.component';
import {FilesTableComponent} from './components/files-table/files-table.component';
import {ControlComponent} from './components/control/control.component';
import {ThemeService} from './services/theme.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeadComponent, FilesTableComponent, ControlComponent, NgForOf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  inputFiles: string[] = [];
  title = 'Cryptone';

  constructor(private themeService: ThemeService) {
    this.themeService.loadTheme()
  }
}
