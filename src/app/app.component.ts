import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeadComponent} from './components/head/head.component';
import {FilesTableComponent} from './components/files-table/files-table.component';
import {ControlComponent} from './components/control/control.component';
import {ThemeService} from './services/theme.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EncryptDialogComponent} from './components/encrypt-dialog/encrypt-dialog.component';
import {DecryptDialogComponent} from './components/decrypt-dialog/decrypt-dialog.component';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {ProgressSpinner} from 'primeng/progressspinner';
import {NgIf, CommonModule} from '@angular/common';
import {LoadingService} from './services/loading.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeadComponent,
    FilesTableComponent,
    ControlComponent,
    FormsModule,
    ReactiveFormsModule,
    EncryptDialogComponent,
    DecryptDialogComponent,
    Toast,
    ProgressSpinner,
    NgIf,
    CommonModule,
  ],
  providers: [
    MessageService,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  electron: any = (window as any).electron;
  title = 'Cryptone';
  loading: boolean = false;

  constructor(
    private readonly themeService: ThemeService,
    private readonly loadingService: LoadingService,
  ) {
    this.themeService.loadTheme()
  }

  ngOnInit(): void {
    this.loadingService.loading$.subscribe(value => {
      this.loading = value
    })
  }
}
