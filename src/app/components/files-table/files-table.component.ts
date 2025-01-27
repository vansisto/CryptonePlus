import {Component, NgZone, OnInit} from '@angular/core';
import {CFile} from '../../models/cfile';
import {TableModule} from 'primeng/table';
import {TranslatePipe} from '@ngx-translate/core';
import {InputFile} from '../../interfaces/input-file'
import {Button} from 'primeng/button';
import {NgIf} from '@angular/common';
import {Tooltip} from 'primeng/tooltip';
import {FilesService} from '../../services/files.service';
import {MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {EncryptDialogService} from '../../services/encrypt-dialog.service';

@Component({
  selector: 'app-files-table',
  imports: [
    TableModule,
    Button,
    NgIf,
    Tooltip,
    TranslatePipe,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './files-table.component.html',
  styleUrl: './files-table.component.scss'
})
export class FilesTableComponent implements OnInit {
  electron = (window as any).electron;
  files!: CFile[];
  selectedFiles: CFile[] = [];

  constructor(
    private ngZone: NgZone,
    private filesService: FilesService,
    private messageService: MessageService,
    private encryptDialogService: EncryptDialogService,
  ) {}

  ngOnInit() {
    this.filesService.files$.subscribe(files => {
      this.ngZone.run(() => {
        this.files = files;
      })
    })

    const electron = (window as any).electron;

    electron.receive('add-files', (inputFiles: InputFile[]) => {
      if (inputFiles) {
        this.ngZone.run(() => {
          inputFiles.forEach(inputFile => {
            const exists = this.filesService
              .getFiles()
              .some(f => f.path === inputFile.path);
            if (!exists) {
              const newCFile = CFile.fromInputFile(inputFile);
              this.filesService.addFile(newCFile);

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
    this.filesService.removeFile(file);
  }

  encryptFile(cfile: CFile) {
    // this.messageService.add({ severity: 'info', summary: 'Info', detail: 'File encryption started...' })
    // const encryptionResult: Promise<any> = this.electron.encryptFile(cfile, "pass", "C:\\Users\\vansi\\AppData\\Roaming\\cryptone\\CryptoneKeys\\Offline\\test\\test.public.key");
    //
    // encryptionResult.then(result => {
    //   const toast = result.success
    //     ? {severity: 'success', summary: 'Encrypted'}
    //     : {severity: 'error', summary: 'Error'};
    //   this.messageService.add({ severity: toast.severity, summary: toast.summary, detail: result.message })
    // })

    this.encryptDialogService.showEncryptDialog();
  }

  decryptFile(cfile: CFile) {
    // this.messageService.add({ severity: 'info', summary: 'Info', detail: 'File decryption started...' })
    // const decryptionResult: Promise<any> = this.electron.decryptFile(cfile, "pass", "C:\\Users\\vansi\\AppData\\Roaming\\cryptone\\CryptoneKeys\\Offline\\test\\test.private.key");
    //
    // decryptionResult.then(result => {
    //   const toast = result.success
    //     ? {severity: 'success', summary: 'Decrypted'}
    //     : {severity: 'error', summary: 'Error'};
    //   this.messageService.add({ severity: toast.severity, summary: toast.summary, detail: result.message })
    // })

    this.encryptDialogService.showDecryptDialog();
  }

  onSelectionChange(selectedFiles: CFile[]) {
    this.filesService.updateSelectedFiles(selectedFiles);
  }
}
