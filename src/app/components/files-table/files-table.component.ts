import {Component, NgZone, OnInit} from '@angular/core';
import {CFile} from '../../models/cfile';
import {TableModule} from 'primeng/table';
import {InputFile} from '../../interfaces/input-file'
import {Button} from 'primeng/button';
import {NgIf} from '@angular/common';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-files-table',
  imports: [
    TableModule,
    Button,
    NgIf,
    Tooltip
  ],
  templateUrl: './files-table.component.html',
  styleUrl: './files-table.component.scss'
})
export class FilesTableComponent implements OnInit {
  customers!: CFile[];
  selectedFiles: CFile | undefined;

  constructor(
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.customers = []
    this.customers.push(new CFile("/Very/Long/path/to/very/long/file/with/extention.ext", "VeryLongNameWithExtension.ext", "", "312,87 Kb"))
    this.customers.push(new CFile("/Long/Path/to/Some/File.file", "LongFileName.file", "Encrypted", "512,13 Mb"))
    this.customers.push(new CFile("/Short/path", "Path", "", "55 b"))
    this.customers.push(new CFile("/", "Name", "", "55,3 Kb"))

    const electron = (window as any).electron;

    electron.receive('files-selected', (inputFiles: InputFile[]) => {
      if (inputFiles) {
        this.ngZone.run(() => {
          inputFiles.forEach(inputFile => {
            const isDuplicate = this.customers.some(
              (existing) => existing.path === inputFile.path
            );
            if (!isDuplicate) {
              this.customers.push(CFile.fromInputFile(inputFile));
              const loadedTotalSize = parseInt(sessionStorage.getItem('totalSize') || "0");
              const updatedTotalSize = loadedTotalSize + inputFile.size;
              sessionStorage.setItem('totalSize', updatedTotalSize.toString());
            }
          })
        });
      }
    });

    electron.send('get-pending-files');
  }

  removeFile(rowIndex: number) {
    this.customers.splice(rowIndex, 1);
  }

  encryptFile(filePath: string) {

  }

  decryptFile(filePath: string) {

  }
}
