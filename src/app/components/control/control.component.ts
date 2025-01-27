import {Component, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {TranslatePipe} from '@ngx-translate/core';
import {FileSizeConverterUtil} from '../../utils/file-size-converter-util';
import {FilesService} from '../../services/files.service';
import {TableModule} from 'primeng/table';
import {CFile} from '../../models/cfile';
import {NgIf} from '@angular/common';
import {EncryptDialogService} from '../../services/encrypt-dialog.service';

@Component({
  selector: 'app-control',
  imports: [
    Button,
    TranslatePipe,
    TableModule,
    NgIf,
  ],
  templateUrl: './control.component.html',
  styleUrl: './control.component.scss'
})
export class ControlComponent implements OnInit {
  electron: any = (window as any).electron;
  allFiles: CFile[] = [];
  selectedFiles: CFile[] = [];

  constructor(
    private filesService: FilesService,
    private encryptDialogService: EncryptDialogService,
  ) {
  }

  ngOnInit() {
    this.filesService.selectedFiles$.subscribe(files => {
      this.selectedFiles = files as CFile[];
    })

    this.filesService.files$.subscribe(files => {
      this.allFiles = files as CFile[];
    })
  }

  addFiles(): void {
    this.electron.openFileDialog();
  }

  get totalSizeFormatted() {
    const totalSize = this.filesService.getTotalSize();
    return FileSizeConverterUtil.formatFileSize(totalSize);
  }

  removeAll() {
    this.filesService.removeAllFiles();
  }

  removeSelected() {
    this.filesService.removeSelected();
  }

  showEncryptDialog() {
    this.encryptDialogService.showEncryptDialog();
  }

  showDecryptDialog() {
    this.encryptDialogService.showDecryptDialog();
  }
}
