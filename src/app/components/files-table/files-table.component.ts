import {Component, NgZone, OnInit} from '@angular/core';
import {CFile} from '../../models/cfile';
import {TableModule} from 'primeng/table';
import {InputFile} from '../../interfaces/input-file'
import {Button} from 'primeng/button';
import {NgIf} from '@angular/common';
import {Tooltip} from 'primeng/tooltip';
import {FileSizeConverterUtil} from '../../utils/file-size-converter-util';

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
  files!: CFile[];
  selectedFiles: CFile | undefined;
  totalSize: number = 0;
  totalSizeField: string = FileSizeConverterUtil.formatFileSize(this.totalSize);

  constructor(
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.files = []
    this.files.push(new CFile("/Very/Long/path/to/very/long/file/with/extention.ext", "VeryLongNameWithExtension.ext", "", 312870))
    this.files.push(new CFile("/Long/Path/to/Some/File.file", "LongFileName.file", "Encrypted", 512130000))
    this.files.push(new CFile("/Short/path", "Path", "", 55))
    this.files.push(new CFile("/", "Name", "", 55130))

    const electron = (window as any).electron;

    electron.receive('files-selected', (inputFiles: InputFile[]) => {
      if (inputFiles) {
        this.ngZone.run(() => {
          inputFiles.forEach(inputFile => {
            const isDuplicate = this.files.some(
              (existing) => existing.path === inputFile.path
            );
            if (!isDuplicate) {
              this.files.push(CFile.fromInputFile(inputFile));
              this.recalculateTotalSize();
            }
          })
        });
      }
    });

    this.recalculateTotalSize();
    electron.send('get-pending-files');
  }

  removeFile(file: CFile) {
    const index = this.files.indexOf(file);
    this.files.splice(index, 1);
    this.recalculateTotalSize();
  }

  encryptFile(filePath: string) {

  }

  decryptFile(filePath: string) {

  }

  private recalculateTotalSize() {
    this.totalSize = this.files.reduce((sum: number, file: CFile) => sum + file.size, 0)
    this.totalSizeField = FileSizeConverterUtil.formatFileSize(this.totalSize);
  }
}
