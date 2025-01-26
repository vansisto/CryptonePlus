import {Component, NgZone, OnInit} from '@angular/core';
import {CFile} from '../../models/cfile';
import {TableModule} from 'primeng/table';
import {TranslatePipe} from '@ngx-translate/core';
import {InputFile} from '../../interfaces/input-file'
import {Button} from 'primeng/button';
import {NgIf} from '@angular/common';
import {Tooltip} from 'primeng/tooltip';
import {FilesService} from '../../services/files.service';

@Component({
  selector: 'app-files-table',
  imports: [
    TableModule,
    Button,
    NgIf,
    Tooltip,
    TranslatePipe
  ],
  templateUrl: './files-table.component.html',
  styleUrl: './files-table.component.scss'
})
export class FilesTableComponent implements OnInit {
  electron = (window as any).electron;
  files!: CFile[];
  selectedFiles: CFile | undefined;

  constructor(
    private ngZone: NgZone,
    private filesService: FilesService,
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
              this.filesService.addFile(CFile.fromInputFile(inputFile));
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
    this.electron.encryptFile(cfile, "pass", "C:\\Users\\vansi\\AppData\\Roaming\\cryptone\\CryptoneKeys\\Offline\\test\\test.public.key");
  }

  decryptFile(cfile: CFile) {
    this.electron.decryptFile(cfile, "pass", "C:\\Users\\vansi\\AppData\\Roaming\\cryptone\\CryptoneKeys\\Offline\\test\\test.private.key");
  }

  onSelectionChange(selectedFiles: CFile[]) {
    this.filesService.updateSelectedFiles(selectedFiles);
  }
}
