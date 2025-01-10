import {Component, OnInit, NgZone } from '@angular/core';
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
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  inputFiles: string[] = [];
  title = 'Cryptone';

  constructor(
    private themeService: ThemeService,
    private ngZone: NgZone,
  ) {
    this.themeService.loadTheme()
  }

  ngOnInit(): void {
    const electron = (window as any).electron;

    electron.receive('files-selected', (inputFiles: string[]) => {
      if (inputFiles) {
        this.ngZone.run(() => {
          this.inputFiles = [...this.inputFiles, ...inputFiles];
        });
      }
    });

    electron.send('get-pending-files');
  }
}
