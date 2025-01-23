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

    const initial: CFile[] = [
      new CFile("/Veeeeeeeeeeeeeeeeeery/Long/path/to/very/long/file.ext", "VeeeeeeeeeeeeeeeryLongName.ext", "", 312870),
      new CFile("/Long/Path/to/Some/File.file", "LongFileName.file", "Encrypted", 512130000),
      new CFile("/Short/path", "Path", "", 55),
      new CFile("/", "Name", "", 55130)
    ];
    this.filesService.setFiles(initial);

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

  encryptFile(filePath: string) {

  }

  decryptFile(filePath: string) {

  }

  onSelectionChange(selectedFiles: CFile[]) {
    this.filesService.updateSelectedFiles(selectedFiles);
  }
}
