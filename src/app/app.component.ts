import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeadComponent} from './components/head/head.component';
import {FilesTableComponent} from './components/files-table/files-table.component';
import {ControlComponent} from './components/control/control.component';
import {ThemeService} from './services/theme.service';
import {Dialog} from 'primeng/dialog';
import {EncryptDialogService} from './services/encrypt-dialog.service';
import {FloatLabel} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeadComponent, FilesTableComponent, ControlComponent, Dialog, FloatLabel, FormsModule, InputText, Button],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  electron: any = (window as any).electron;
  title = 'Cryptone';
  encryptDialogVisible: boolean = false;
  decryptDialogVisible: boolean = false;
  publicKeyPath: string = "";
  privateKeyPath: string = "";

  constructor(
    private themeService: ThemeService,
    private encryptDialogService: EncryptDialogService,
  ) {
    this.themeService.loadTheme()
  }

  ngOnInit(): void {
    this.encryptDialogService.encryptDialogVisible$.subscribe(value => {
      this.encryptDialogVisible = value;
    })

    this.encryptDialogService.decryptDialogVisible$.subscribe(value => {
      this.decryptDialogVisible = value;
    })
  }

  openKeysFolder(isPublic: boolean = true) {
    this.electron.selectKeyDialog(isPublic).then((key: string) => {
      isPublic
        ? (this.publicKeyPath = key)
        : (this.privateKeyPath = key)

      console.log("Public key path: " + this.publicKeyPath)
      console.log("Private key path: " + this.privateKeyPath)
    });
  }
}
