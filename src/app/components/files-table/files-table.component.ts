import {Component, NgZone, OnInit} from '@angular/core';
import {CFile} from '../../models/cfile';
import {TableModule} from 'primeng/table';
import {TranslatePipe} from '@ngx-translate/core';
import {InputFile} from '../../interfaces/input-file'
import {Button} from 'primeng/button';
import {NgIf} from '@angular/common';
import {FilesService} from '../../services/files.service';
import {MessageService} from 'primeng/api';
import {CryptoDialogService} from '../../services/crypto-dialog.service';
import {FileEncryptionService} from '../../services/file-encryption.service';

@Component({
  selector: 'app-files-table',
  imports: [
    TableModule,
    Button,
    NgIf,
    TranslatePipe,
  ],
  providers: [MessageService],
  templateUrl: './files-table.component.html',
  styleUrl: './files-table.component.scss'
})
export class FilesTableComponent implements OnInit {
  electron = (window as any).electron;
  allFiles!: CFile[];
  selectedFiles: CFile[] = [];

  constructor(
    private ngZone: NgZone,
    private filesService: FilesService,
    private fileEncryptionService: FileEncryptionService,
    private encryptDialogService: CryptoDialogService,
  ) {}

  ngOnInit() {
    this.filesService.allFiles$.subscribe(files => {
      this.ngZone.run(() => {
        this.allFiles = files;
      })
    })

    this.filesService.selectedFiles$.subscribe(files => {
      this.selectedFiles = files;
    })

    const electron = (window as any).electron;

    electron.receive('add-files', (inputFiles: InputFile[]) => {
      if (inputFiles) {
        this.ngZone.run(() => {
          inputFiles.forEach(inputFile => {
            const exists = this.allFiles
              .some(f => f.path === inputFile.path);
            if (!exists) {
              const newCFile = CFile.fromInputFile(inputFile);
              this.filesService.addFileToAll(newCFile);

              if (this.selectedFiles) {
                this.selectedFiles = this.selectedFiles.filter(
                  file => file.path !== newCFile.path
                );
              }
            }
          })
        });
      }
    });

    electron.send('get-pending-files');
  }

  removeFile(file: CFile) {
    this.filesService.removeFileFromAll(file);
  }

  showEncryptDialog(cfile: CFile) {
    this.fileEncryptionService.addFileToPending(cfile);
    this.encryptDialogService.showEncryptDialog();
  }

  showDecryptDialog(cfile: CFile) {
    this.fileEncryptionService.addFileToPending(cfile);
    this.encryptDialogService.showDecryptDialog();
  }

  onSelectionChange(selectedFiles: CFile[]) {
    this.filesService.updateSelectedFiles(selectedFiles);
  }
}
